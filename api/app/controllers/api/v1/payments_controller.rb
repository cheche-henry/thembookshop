module Api
  module V1
    class PaymentsController < ApplicationController
      ACCEPTED = { ResultCode: 0, ResultDesc: "Accepted" }.freeze

      before_action :verify_callback_authenticity!, only: :callback
      before_action -> { rate_limit!("payments-create", limit: 5, period: 1.minute) }, only: :create

      # POST /api/v1/payments/mpesa
      # Re-trigger an STK push for an unpaid order.
      def create
        order = Order.includes(:payments, order_items: :product).find_by!(reference: params[:order_reference])

        return render_error("Order #{order.reference} cannot accept a new payment (status: #{order.status})") unless order.pending_payment?

        phone = params[:phone].presence || order.customer_phone
        return render_error("Enter a valid Kenyan M-Pesa number", status: :unprocessable_entity) unless PhoneNumber.valid?(phone)

        # Retrying a failed order must reserve its stock again before charging.
        OrderWorkflow.transition!(order, "pending", reason: "Payment retry requested") if order.status == "failed"

        initiate_payment!(order, phone)
        render_success({ message: "M-Pesa prompt sent to #{PhoneNumber.local(phone)}" })
      rescue MpesaService::MpesaError => e
        Rails.logger.error "[M-Pesa Retry] #{e.message} — Order #{order&.reference}"
        fail_pending_order(order)

        render_error("M-Pesa prompt could not be sent. Please try again.", status: :unprocessable_entity)
      rescue Product::InsufficientStockError => e
        render_error(e.message, status: :unprocessable_entity)
      end

      # POST /api/v1/payments/callback
      # Called by Safaricom — must always return 200 for accepted callbacks.
      def callback
        payload = parse_callback_payload
        stk     = payload.dig("Body", "stkCallback") || {}

        checkout_request_id = stk["CheckoutRequestID"]
        result_code         = stk["ResultCode"]&.to_s

        Rails.logger.info "[M-Pesa Callback] CheckoutRequestID=#{checkout_request_id} ResultCode=#{result_code}"

        if checkout_request_id.blank?
          Rails.logger.warn "[M-Pesa Callback] Missing CheckoutRequestID"
          return render json: ACCEPTED
        end

        payment = Payment.find_by(checkout_request_id: checkout_request_id)

        unless payment
          Rails.logger.warn "[M-Pesa Callback] Unknown CheckoutRequestID: #{checkout_request_id}"
          return render json: ACCEPTED
        end

        notify_order(payment.order_id) if process_callback(payment, stk:, payload:)
        render json: ACCEPTED
      rescue JSON::ParserError
        render json: ACCEPTED
      rescue StandardError => e
        Rails.logger.error "[M-Pesa Callback] #{e.class}: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}"
        render json: ACCEPTED
      end

      private

      def initiate_payment!(order, phone)
        payment = order.payments.create!(
          method: "mpesa",
          status: "pending",
          amount: order.total_amount,
          phone_number: phone
        )

        response = MpesaService.new.initiate_stk_push(
          phone: payment.normalized_phone,
          amount: order.total_amount,
          order_reference: order.reference
        )

        payment.update!(
          status: "initiated",
          merchant_request_id: response["MerchantRequestID"],
          checkout_request_id: response["CheckoutRequestID"]
        )

        order.transition_to!("payment_initiated") if order.can_transition_to?("payment_initiated")
        enqueue_status_check(payment)
        payment
      rescue MpesaService::MpesaError
        payment&.update(status: "failed", result_desc: "STK push failed") if payment&.persisted?
        raise
      end

      # Applies the callback inside a row lock. Returns true when this call is
      # the one that completed the payment.
      def process_callback(payment, stk:, payload:)
        result_code = stk["ResultCode"]&.to_s
        result_desc = stk["ResultDesc"]
        completed   = false

        ActiveRecord::Base.transaction do
          payment.lock!
          next if payment.completed?

          metadata = extract_metadata(stk)

          if result_code == "0" && !amount_mismatch?(payment, metadata)
            complete!(payment, metadata:, code: result_code, description: result_desc, payload:)
            completed = true
          else
            description = if result_code == "0"
                            "Amount mismatch: expected #{payment.amount.ceil}, received #{metadata["Amount"]}"
                          else
                            result_desc
                          end
            log_amount_mismatch(payment, metadata) if result_code == "0"

            mark_failed!(payment, code: result_code, description:, payload:)
          end
        end

        completed
      end

      def log_amount_mismatch(payment, metadata)
        Rails.logger.error(
          "[M-Pesa Callback] Amount mismatch for payment ##{payment.id}: " \
          "expected #{payment.amount.ceil}, got #{metadata["Amount"]}"
        )
      end

      # Prefer the raw JSON body (what Safaricom sends) and fall back to parsed
      # params so the endpoint also behaves when invoked from tests or proxies.
      def parse_callback_payload
        raw = request.raw_post
        return JSON.parse(raw) if raw.present?

        params.to_unsafe_h.deep_stringify_keys
      end

      def verify_callback_authenticity!
        allowed_ips = ENV["MPESA_CALLBACK_IPS"].to_s.split(",").map(&:strip).reject(&:blank?)
        if allowed_ips.any? && !allowed_ips.include?(request.remote_ip)
          Rails.logger.warn "[M-Pesa Callback] Rejected request from #{request.remote_ip}"
          return render json: { ResultCode: 1, ResultDesc: "Forbidden" }, status: :forbidden
        end

        expected = ENV["MPESA_CALLBACK_TOKEN"].to_s
        return if expected.blank?

        # Only look at the query string / header here: reading params would
        # consume the JSON body that the callback needs to parse.
        provided = request.headers["X-Callback-Token"].presence ||
                   request.query_parameters["token"].presence

        return if provided.present? && ActiveSupport::SecurityUtils.secure_compare(expected, provided.to_s)

        Rails.logger.warn "[M-Pesa Callback] Rejected request with invalid callback token from #{request.remote_ip}"
        render json: { ResultCode: 1, ResultDesc: "Unauthorized" }, status: :unauthorized
      end

      def extract_metadata(stk)
        metadata = {}
        stk.dig("CallbackMetadata", "Item")&.each do |item|
          metadata[item["Name"]] = item["Value"]
        end
        metadata
      end

      def amount_mismatch?(payment, metadata)
        amount = metadata["Amount"]
        return false if amount.blank?

        amount.to_i != payment.amount.ceil.to_i
      end

      def complete!(payment, metadata:, code:, description:, payload:)
        receipt = metadata["MpesaReceiptNumber"]&.to_s

        payment.update!(
          status: "completed",
          mpesa_receipt_number: receipt,
          mpesa_transaction_id: receipt,
          mpesa_transaction_date: parse_mpesa_date(metadata["TransactionDate"]) || Time.current,
          result_code: code,
          result_desc: description,
          raw_callback: payload
        )

        order = Order.find(payment.order_id)

        if order.can_transition_to?("paid")
          OrderWorkflow.transition!(order, "paid")
        else
          # The customer has paid, so never roll the payment back. Flag it for
          # manual reconciliation instead (e.g. order cancelled mid-payment).
          Rails.logger.error(
            "[M-Pesa Callback] Payment ##{payment.id} completed but order " \
            "#{order.reference} is '#{order.status}' — manual reconciliation/refund required"
          )
        end
      end

      def mark_failed!(payment, code:, description:, payload:)
        payment.update!(
          status: "failed",
          result_code: code,
          result_desc: description,
          raw_callback: payload
        )

        order = Order.find(payment.order_id)
        return unless order.pending_payment? && order.can_transition_to?("failed")

        OrderWorkflow.transition!(order, "failed", reason: "M-Pesa payment failed: #{description}")
      end

      def fail_pending_order(order)
        return unless order
        return unless order.status == "pending" && order.can_transition_to?("failed")

        OrderWorkflow.transition!(order, "failed", reason: "M-Pesa retry could not be sent")
      rescue StandardError => e
        Rails.logger.error "[Order #{order.reference}] Could not mark as failed: #{e.class}: #{e.message}"
      end

      def enqueue_status_check(payment)
        MpesaStatusCheckJob.set(wait: 1.minute).perform_later(payment.id, 1)
      rescue StandardError => e
        Rails.logger.error "[MpesaStatusCheckJob] Could not enqueue for payment ##{payment.id}: #{e.class}: #{e.message}"
      end

      def notify_order(order_id)
        enqueue_notification(order_id, "order_placed")
        enqueue_notification(order_id, "payment_received")
      end

      def enqueue_notification(order_id, event)
        OrderNotificationJob.perform_later(order_id, event)
      rescue StandardError => e
        Rails.logger.error "[M-Pesa Callback] Could not enqueue #{event} for order ##{order_id}: #{e.class}: #{e.message}"
      end

      def parse_mpesa_date(date_str)
        return nil if date_str.blank?

        Time.strptime(date_str.to_s, "%Y%m%d%H%M%S")
      rescue ArgumentError
        nil
      end
    end
  end
end
