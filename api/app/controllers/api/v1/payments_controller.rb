module Api
  module V1
    class PaymentsController < ApplicationController

      # POST /api/v1/payments/mpesa
      # Manually re-trigger an STK push
      def create
        order = Order.find_by!(reference: params[:order_reference])
        phone = params[:phone] || order.customer_phone

        unless order.pending_payment?
          return render_error("Order #{order.reference} cannot accept a new payment (status: #{order.status})")
        end

        mpesa    = MpesaService.new
        response = mpesa.initiate_stk_push(
          phone:           Payment.new(phone_number: phone).normalized_phone,
          amount:          order.total_amount,
          order_reference: order.reference,
        )

        payment = order.payments.where(status: %w[pending initiated]).last ||
                  order.payments.new(amount: order.total_amount, method: "mpesa")

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
      # Called by Safaricom — must always return 200
      def callback
        body    = request.body.read
        payload = JSON.parse(body) rescue {}
        stk     = payload.dig("Body", "stkCallback") || {}

        checkout_request_id = stk["CheckoutRequestID"]
        result_code         = stk["ResultCode"]&.to_s
        result_desc         = stk["ResultDesc"]

        Rails.logger.info "[M-Pesa Callback] CheckoutRequestID=#{checkout_request_id} ResultCode=#{result_code}"

        payment = Payment.find_by(checkout_request_id: checkout_request_id)

        unless payment
          Rails.logger.warn "[M-Pesa Callback] Unknown CheckoutRequestID: #{checkout_request_id}"
          return render json: { ResultCode: 0, ResultDesc: "Accepted" }
        end

        if payment.completed?
          Rails.logger.info "[M-Pesa Callback] Already processed payment ##{payment.id}"
          return render json: { ResultCode: 0, ResultDesc: "Accepted" }
        end

        # Extract metadata from successful callback
        metadata = {}
        if result_code == "0"
          stk.dig("CallbackMetadata", "Item")&.each do |item|
            metadata[item["Name"]] = item["Value"]
          end
        end

        ActiveRecord::Base.transaction do
          if result_code == "0"
            payment.update!(
              status:                 "completed",
              mpesa_receipt_number:   metadata["MpesaReceiptNumber"]&.to_s,
              mpesa_transaction_id:   metadata["MpesaReceiptNumber"]&.to_s,
              mpesa_transaction_date: parse_mpesa_date(metadata["TransactionDate"]),
              result_code:            result_code,
              result_desc:            result_desc,
              raw_callback:           payload,
            )
            payment.order.transition_to!("paid")

            # Emails only fire after confirmed payment
            OrderNotificationJob.perform_later(payment.order_id, "order_placed")
            OrderNotificationJob.perform_later(payment.order_id, "payment_received")

            Rails.logger.info "[M-Pesa Callback] ✅ Payment #{metadata['MpesaReceiptNumber']} confirmed for order #{payment.order.reference}"
          else
            payment.update!(
              status:       "failed",
              result_code:  result_code,
              result_desc:  result_desc,
              raw_callback: payload,
            )
            payment.order.transition_to!("failed") rescue nil
            restore_stock_for_order!(payment.order)

            Rails.logger.info "[M-Pesa Callback] ❌ Payment failed for order #{payment.order.reference}: #{result_desc}"
          end
        end

        render json: { ResultCode: 0, ResultDesc: "Accepted" }
      rescue JSON::ParserError
        render json: { ResultCode: 0, ResultDesc: "Accepted" }
      rescue => e
        Rails.logger.error "[M-Pesa Callback] #{e.class}: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}"
        render json: { ResultCode: 0, ResultDesc: "Accepted" }
      end

      private

      def restore_stock_for_order!(order)
        order.order_items.includes(:product).each do |item|
          item.product.restore_stock!(item.quantity)
        rescue => e
          Rails.logger.error "[Stock Restore] #{e.message}"
        end
      end

      def parse_mpesa_date(date_str)
        return nil if date_str.blank?
        Time.strptime(date_str.to_s, "%Y%m%d%H%M%S")
      rescue
        nil
      end
    end
  end
end