module Api
  module V1
    class OrdersController < ApplicationController
      # POST /api/v1/orders
      # Creates order, deducts stock, sends emails, initiates M-Pesa STK push
      def create
        result = OrderCreator.call(
          order_params: permitted_order_params,
          items_params: permitted_items_params,
        )

        if result.success?
          order = result.order
          # ⛔ No emails here — wait for payment confirmation
          mpesa_result = initiate_mpesa_payment(order)

          render_created(
            {
              order:         OrderBlueprint.render_as_hash(order),
              mpesa_sent:    mpesa_result[:success],
              mpesa_message: mpesa_result[:message],
            },
            message: "Order created. Complete M-Pesa payment to confirm."
          )
        else
          render_error(result.errors.first, status: :unprocessable_entity, errors: result.errors)
        end
      end

      # GET /api/v1/orders/:reference  (customer can look up their own order by ref)
      def show
        order = Order.includes(:order_items, :payments).find_by!(reference: params[:id])
        render_success(OrderBlueprint.render_as_hash(order))
      end

      private

      def permitted_order_params
        params.require(:order).permit(
          :customer_name, :customer_phone, :customer_email,
          :delivery_address, :delivery_location, :notes
        )
      end

      def permitted_items_params
        params.require(:order).require(:items).map do |item|
          item.permit(:product_id, :quantity).to_h
        end
      end

      def initiate_mpesa_payment(order)
        payment = order.payments.create!(
          method:       "mpesa",
          status:       "pending",
          amount:       order.total_amount,
          phone_number: order.customer_phone,
        )

        mpesa    = MpesaService.new
        response = mpesa.initiate_stk_push(
          phone:           payment.normalized_phone,
          amount:          order.total_amount,
          order_reference: order.reference,
        )

        payment.update!(
          status:              "initiated",
          merchant_request_id: response["MerchantRequestID"],
          checkout_request_id: response["CheckoutRequestID"],
        )
        order.transition_to!("payment_initiated")

        # Schedule a fallback status check in 2 minutes if callback doesn't arrive
        MpesaStatusCheckJob.set(wait: 2.minutes).perform_later(payment.id)

        { success: true, message: "M-Pesa prompt sent to #{order.customer_phone}" }
      rescue MpesaService::MpesaError => e
        Rails.logger.error "[M-Pesa STK Push] #{e.message} — Order #{order.reference}"
        payment&.update(status: "failed")
        { success: false, message: "M-Pesa prompt could not be sent: #{e.message}" }
      end
    end
  end
end
