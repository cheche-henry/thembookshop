module Api
  module V1
    class PaymentsController < ApplicationController
      # POST /api/v1/payments/mpesa
      # Manually re-trigger an STK push (e.g. customer timed out)
      def create
        order   = Order.find_by!(reference: params[:order_reference])
        phone   = params[:phone] || order.customer_phone
        payment = order.payments.where(status: %w[pending initiated]).last

        unless order.pending_payment?
          return render_error("Order #{order.reference} cannot accept a new payment (status: #{order.status})")
        end

        mpesa    = MpesaService.new
        response = mpesa.initiate_stk_push(
          phone:           Payment.new(phone_number: phone).normalized_phone,
          amount:          order.total_amount,
          order_reference: order.reference,
        )

        payment ||= order.payments.new(amount: order.total_amount, method: "mpesa")
        payment.update!(
          phone_number:        phone,
          status:              "initiated",
          merchant_request_id: response["MerchantRequestID"],
          checkout_request_id: response["CheckoutRequestID"],
        )
        order.update!(status: "payment_initiated") if order.status == "pending"

        MpesaStatusCheckJob.set(wait: 2.minutes).perform_later(payment.id)
        render_success({ message: "M-Pesa prompt sent to #{phone}" })
      rescue MpesaService::MpesaError => e
        render_error("M-Pesa error: #{e.message}")
      end

      # POST /api/v1/payments/callback
      # Called by Safaricom's servers — must respond quickly (within 5s)
      # ⚠️  This endpoint must be publicly reachable and NOT behind authentication
      def callback
        body      = request.body.read
        payload   = JSON.parse(body) rescue {}
        stk_data  = payload.dig("Body", "stkCallback") || {}

        checkout_request_id = stk_data["CheckoutRequestID"]
        result_code         = stk_data["ResultCode"]&.to_s
        result_desc         = stk_data["ResultDesc"]

        payment = Payment.find_by(checkout_request_id:)

        unless payment
          Rails.logger.warn "[M-Pesa Callback] Unknown CheckoutRequestID: #{checkout_request_id}"
          return render json: { ResultCode: 0, ResultDesc: "Accepted" }
        end

        # Prevent duplicate processing
        if payment.completed?
          return render json: { ResultCode: 0, ResultDesc: "Already processed" }
        end

        # Extract metadata items from successful response
        metadata = {}
        if result_code == "0"
          stk_data.dig("CallbackMetadata", "Item")&.each do |item|
            metadata[item["Name"]] = item["Value"]
          end
        end

        ActiveRecord::Base.transaction do
          if result_code == "0"
            payment.update!(
              status:                 "completed",
              mpesa_receipt_number:   metadata["MpesaReceiptNumber"],
              mpesa_transaction_id:   metadata["MpesaReceiptNumber"],
              mpesa_transaction_date: parse_mpesa_date(metadata["TransactionDate"]),
              result_code:,
              result_desc:,
              raw_callback:           payload,
            )
            payment.order.transition_to!("paid")
            OrderNotificationJob.perform_later(payment.order_id, "payment_received")
          else
            payment.update!(
              status:       "failed",
              result_code:,
              result_desc:,
              raw_callback: payload,
            )
            payment.order.transition_to!("failed") rescue nil
          end
        end

        # Safaricom expects this exact JSON response
        render json: { ResultCode: 0, ResultDesc: "Accepted" }
      rescue JSON::ParserError
        render json: { ResultCode: 0, ResultDesc: "Accepted" }
      rescue => e
        Rails.logger.error "[M-Pesa Callback] #{e.class}: #{e.message}"
        render json: { ResultCode: 0, ResultDesc: "Accepted" } # always respond 200 to Safaricom
      end

      private

      def parse_mpesa_date(date_str)
        return nil if date_str.blank?
        Time.strptime(date_str.to_s, "%Y%m%d%H%M%S")
      rescue
        nil
      end
    end
  end
end
