module Api
  module V1
    class OrdersController < BaseController
      def create
        service = OrderProcessingService.new(order_params, items_params)
        result = service.process
        
        if result.is_a?(Order)
          render json: { 
            message: 'Order placed successfully. Check your phone for M-Pesa prompt.',
            order: result.as_json(include: { order_items: { include: :product }, payment: {} })
          }, status: :created
        else
          render json: result, status: :unprocessable_entity
        end
      end

      private

      def order_params
        params.require(:order).permit(:name, :phone_number, :email, :delivery_address)
      end

      def items_params
        params.require(:items).map do |item|
          item.permit(:product_id, :quantity)
        end
      end
    end
  end
end