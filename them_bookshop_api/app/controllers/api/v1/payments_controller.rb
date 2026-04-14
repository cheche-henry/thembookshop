module Api
  module V1
    class PaymentsController < BaseController
      # Payments must be public (NO admin auth)
      skip_before_action :authenticate_admin!, only: [:stk_push, :mpesa_callback]

      # =========================
      # 🔵 STK PUSH INITIATION
      # =========================
      def stk_push
        phone = format_phone(params[:phone])
        amount = params[:amount]
        order_id = params[:order_id]

        result = MpesaService.new.initiate_stk_push(
          phone,
          amount,
          order_id
        )

        render json: result
      end

      # =========================
      # 🔵 MPESA CALLBACK
      # =========================
      def mpesa_callback
        result = MpesaService.new.handle_callback(request.request_parameters)

        if result[:success]
          process_successful_payment(result)
          head :ok
        else
          Rails.logger.error "M-Pesa Callback Failed: #{result[:error]}"
          head :bad_request
        end
      end

      private

      # =========================
      # 📞 PHONE FORMATTING FIX
      # =========================
      def format_phone(phone)
        phone = phone.to_s.strip

        if phone.start_with?('0')
          "254#{phone[1..]}"
        elsif phone.start_with?('7')
          "254#{phone}"
        elsif phone.start_with?('254')
          phone
        else
          phone
        end
      end

      # =========================
      # 💳 PAYMENT UPDATE LOGIC
      # =========================
      def process_successful_payment(result)
        # IMPORTANT:
        # This is still simplified. Production should use CheckoutRequestID.
        payment = Payment.find_by(status: 'pending')

        return unless payment

        ActiveRecord::Base.transaction do
          payment.update!(
            status: 'success',
            transaction_id: result[:transaction_id]
          )

          payment.order.update!(
            payment_status: 'success',
            mpesa_transaction_id: result[:transaction_id]
          )
        end
      rescue => e
        Rails.logger.error "Payment processing error: #{e.message}"
      end
    end
  end
end