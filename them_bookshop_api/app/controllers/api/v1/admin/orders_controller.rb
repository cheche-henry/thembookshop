module Api
  module V1
    module Admin
      class OrdersController < BaseController
        include Authenticate

        def index
          orders = Order.includes(:order_items, :payment).order(created_at: :desc)
          orders = orders.where(status: params[:status]) if params[:status].present?
          render json: orders, status: :ok
        end

        def update_status
          order = Order.find(params[:id])
          if order.update(status: params[:status])
            render json: order, status: :ok
          else
            render json: { error: order.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end