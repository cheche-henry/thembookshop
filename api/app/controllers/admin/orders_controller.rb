module Admin
  class OrdersController < ApplicationController
    MAX_PER_PAGE = 100

    before_action :authenticate_admin!
    before_action :set_order, only: %i[show update_status cancel]

    # GET /admin/orders
    def index
      orders = Order
               .includes(:order_items, :payments, :products)
               .by_status(params[:status])
               .recent
               .page(params[:page])
               .per(per_page)

      if params[:q].present?
        orders = orders.where("customer_name ILIKE :q OR customer_phone ILIKE :q OR reference ILIKE :q",
                              q: "%#{params[:q]}%")
      end
      orders = orders.where("created_at >= ?", parsed_date(params[:from]).beginning_of_day) if params[:from].present?
      orders = orders.where("created_at <= ?", parsed_date(params[:to]).end_of_day) if params[:to].present?

      render_success(
        OrderBlueprint.render_as_hash(orders, view: :list),
        meta: pagination_meta(orders).merge(status_counts: status_counts)
      )
    end

    # GET /admin/orders/:id
    def show
      render_success(OrderBlueprint.render_as_hash(@order, view: :admin))
    end

    # PATCH /admin/orders/:id/status
    def update_status
      new_status = params[:status]&.to_s

      unless Order::STATUSES.include?(new_status)
        return render_error("Invalid status '#{new_status}'. Valid: #{Order::STATUSES.join(", ")}")
      end

      OrderWorkflow.transition!(@order, new_status)

      # Notify customer on meaningful status changes
      enqueue_notification(@order.id, "order_status_update") if new_status.in?(%w[completed processing])

      render_success(
        OrderBlueprint.render_as_hash(@order.reload, view: :admin),
        message: "Order #{@order.reference} moved to '#{new_status}'"
      )
    rescue Order::InvalidTransitionError, Product::InsufficientStockError => e
      render_error(e.message, status: :unprocessable_entity)
    end

    # POST /admin/orders/:id/cancel
    def cancel
      reason = params[:reason]&.strip
      return render_error("Order cannot be cancelled in its current state (#{@order.status})") unless @order.can_transition_to?("cancelled")

      OrderWorkflow.transition!(
        @order,
        "cancelled",
        reason: reason.present? ? "Cancelled by admin: #{reason}" : "Cancelled by admin"
      )

      enqueue_notification(@order.id, "order_status_update")
      render_success(
        OrderBlueprint.render_as_hash(@order.reload, view: :admin),
        message: "Order cancelled and stock restored"
      )
    rescue Order::InvalidTransitionError => e
      render_error(e.message, status: :unprocessable_entity)
    end

    # GET /admin/orders/stats  — dashboard summary
    def stats
      today      = Time.current.beginning_of_day
      this_month = Time.current.beginning_of_month

      render_success({
                       total_orders: Order.count,
                       orders_today: Order.where("created_at >= ?", today).count,
                       orders_this_month: Order.where("created_at >= ?", this_month).count,
                       revenue_today: Order.where("created_at >= ? AND status IN (?)", today,
                                                  %w[paid processing completed]).sum(:total_amount),
                       revenue_this_month: Order.where("created_at >= ? AND status IN (?)", this_month,
                                                       %w[paid processing completed]).sum(:total_amount),
                       revenue_total: Order.where(status: %w[paid processing completed]).sum(:total_amount),
                       pending_orders: Order.where(status: "pending").count,
                       payment_initiated: Order.where(status: "payment_initiated").count,
                       paid_orders: Order.where(status: "paid").count,
                       processing_orders: Order.where(status: "processing").count,
                       completed_orders: Order.where(status: "completed").count,
                       failed_orders: Order.where(status: "failed").count,
                       cancelled_orders: Order.where(status: "cancelled").count,
                       low_stock_products: Product.active.where("stock_quantity <= 5").count,
                       out_of_stock_products: Product.active.where(stock_quantity: 0).count,
                       total_products: Product.active.count
                     })
    end

    private

    def set_order
      @order = Order.includes(:payments, order_items: :product).find(params[:id])
    end

    def per_page
      value = params[:per_page].to_i
      value = 20 unless value.positive?
      [value, MAX_PER_PAGE].min
    end

    def parsed_date(value)
      Date.parse(value.to_s)
    rescue Date::Error
      Time.current.to_date
    end

    def status_counts
      Order.group(:status).count
    end

    def enqueue_notification(order_id, event)
      OrderNotificationJob.perform_later(order_id, event)
    rescue StandardError => e
      Rails.logger.error "[Admin::OrdersController] Could not enqueue #{event} for order ##{order_id}: #{e.class}: #{e.message}"
    end
  end
end
