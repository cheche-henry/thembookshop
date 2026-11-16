module Api
  module V1
    class OrdersController < ApplicationController
      before_action -> { rate_limit!("orders-create", limit: 10, period: 1.minute) }, only: :create
      before_action -> { rate_limit!("orders-show", limit: 30, period: 1.minute) }, only: :show

      # POST /api/v1/orders
      # Creates order, deducts stock, initiates M-Pesa STK push.
      # Safe to retry with the same Idempotency-Key header: the existing order
      # is returned instead of creating (and reserving) a second one.
      def create
        result = OrderCreator.call(
          order_params: permitted_order_params,
          items_params: permitted_items_params,
          idempotency_key: idempotency_key
        )

        return render_error(result.errors.first, status: :unprocessable_entity, errors: result.errors) unless result.success?

        order = result.order

        if result.replayed
          return render_created(
            {
              order: OrderBlueprint.render_as_hash(order, view: :public),
              mpesa_sent: order.payments.any? { |payment| payment.status.in?(%w[pending initiated completed]) },
              mpesa_message: "This order was already created. Check your phone for the M-Pesa prompt."
            },
            message: "Order already created."
          )
        end

        mpesa_result = initiate_mpesa_payment(order)

        render_created(
          {
            order: OrderBlueprint.render_as_hash(order.reload, view: :public),
            mpesa_sent: mpesa_result[:success],
            mpesa_message: mpesa_result[:message]
          },
          message: "Order created. Complete M-Pesa payment to confirm."
        )
      end

      # GET /api/v1/orders/:reference?phone=0712345678
      # Customer can look up their own order by reference, verified by the
      # phone number used at checkout. Returns no customer PII.
      def show
        order = Order.includes(:order_items).find_by!(reference: params[:id])

        return render_not_found("Order not found") unless order.phone_matches?(params[:phone])

        render_success(OrderBlueprint.render_as_hash(order, view: :public))
      end

      private

      def idempotency_key
        request.headers["Idempotency-Key"].presence ||
          params.dig(:order, :idempotency_key).presence
      end

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
          method: "mpesa",
          status: "pending",
          amount: order.total_amount,
          phone_number: order.customer_phone
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

        { success: true, message: "M-Pesa prompt sent to #{order.display_phone}" }
      rescue MpesaService::MpesaError => e
        Rails.logger.error "[M-Pesa STK Push] #{e.message} — Order #{order.reference}"
        payment&.update(status: "failed", result_desc: "STK push failed") if payment&.persisted?
        fail_unpaid_order(order)

        { success: false, message: "M-Pesa prompt could not be sent. Please try again from your order confirmation." }
      rescue StandardError => e
        # The order is already committed; never bubble this up as a 500 or the
        # client will retry and create duplicates. Stock is released only when
        # we know the prompt was never sent.
        Rails.logger.error "[M-Pesa STK Push] #{e.class}: #{e.message} — Order #{order.reference}"
        fail_unpaid_order(order) unless payment&.status == "initiated"

        { success: false, message: "We could not confirm the M-Pesa prompt. Check your phone or retry from your order confirmation." }
      end

      def fail_unpaid_order(order)
        order.reload
        return unless order.can_transition_to?("failed")

        OrderWorkflow.transition!(order, "failed", reason: "M-Pesa prompt could not be sent")
      rescue StandardError => e
        Rails.logger.error "[Order #{order.reference}] Could not mark as failed: #{e.class}: #{e.message}"
      end

      def enqueue_status_check(payment)
        MpesaStatusCheckJob.set(wait: 2.minutes).perform_later(payment.id, 1)
      rescue StandardError => e
        Rails.logger.error "[MpesaStatusCheckJob] Could not enqueue for payment ##{payment.id}: #{e.class}: #{e.message}"
      end
    end
  end
end
