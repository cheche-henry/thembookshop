module Admin
  class OrdersController < ApplicationController
    before_action :authenticate_admin!
    before_action :set_order, only: [:show, :update_status, :cancel]

    # GET /admin/orders
    def index
      orders = Order
               .includes(:order_items, :payments)
               .by_status(params[:status])
               .recent
               .page(params[:page])
               .per(params[:per_page] || 20)

      orders = orders.where("customer_name ILIKE :q OR customer_phone ILIKE :q OR reference ILIKE :q",
                            q: "%#{params[:q]}%") if params[:q].present?
      orders = orders.where("created_at >= ?", Date.parse(params[:from])) if params[:from].present?
      orders = orders.where("created_at <= ?", Date.parse(params[:to]).end_of_day) if params[:to].present?

      render_success(
        OrderBlueprint.render_as_hash(orders, view: :list),
        meta: pagination_meta(orders).merge(status_counts: status_counts)
      )
    end

    # GET /admin/orders/:id
    def show
      render_success(OrderBlueprint.render_as_hash(@order))
    end

    # PATCH /admin/orders/:id/status
    def update_status
      new_status = params[:status]&.to_s

      unless Order::STATUSES.include?(new_status)
        return render_error("Invalid status '#{new_status}'. Valid: #{Order::STATUSES.join(', ')}")
      end

      @order.transition_to!(new_status)

      # Notify customer on meaningful status changes
      if new_status.in?(%w[completed processing])
        OrderNotificationJob.perform_later(@order.id, "order_status_update")
      end

      render_success(
        OrderBlueprint.render_as_hash(@order),
        message: "Order #{@order.reference} moved to '#{new_status}'"
      )
    rescue Order::InvalidTransitionError => e
      render_error(e.message, status: :unprocessable_entity)
    end

    # POST /admin/orders/:id/cancel
    def cancel
      reason = params[:reason]&.strip
      unless @order.can_transition_to?("cancelled")
        return render_error("Order cannot be cancelled in its current state (#{@order.status})")
      end

      ActiveRecord::Base.transaction do
        @order.transition_to!("cancelled")
        # Restore stock for each item
        @order.order_items.includes(:product).each do |item|
          item.product.restore_stock!(item.quantity)
        end
        # Append cancellation note
        @order.update!(notes: [@order.notes, "Cancelled by admin: #{reason}"].compact.join("\n"))
      end

      OrderNotificationJob.perform_later(@order.id, "order_status_update")
      render_success(OrderBlueprint.render_as_hash(@order), message: "Order cancelled and stock restored")
    end

    # GET /admin/orders/stats  — dashboard summary
    def stats
      today      = Time.current.beginning_of_day
      this_month = Time.current.beginning_of_month

      render_success(
        total_orders:          Order.count,
        orders_today:          Order.where("created_at >= ?", today).count,
        orders_this_month:     Order.where("created_at >= ?", this_month).count,
        revenue_today:         Order.where("created_at >= ? AND status IN (?)", today, %w[paid processing completed]).sum(:total_amount),
        revenue_this_month:    Order.where("created_at >= ? AND status IN (?)", this_month, %w[paid processing completed]).sum(:total_amount),
        revenue_total:         Order.where(status: %w[paid processing completed]).sum(:total_amount),
        pending_orders:        Order.where(status: "pending").count,
        payment_initiated:     Order.where(status: "payment_initiated").count,
        paid_orders:           Order.where(status: "paid").count,
        processing_orders:     Order.where(status: "processing").count,
        completed_orders:      Order.where(status: "completed").count,
        failed_orders:         Order.where(status: "failed").count,
        cancelled_orders:      Order.where(status: "cancelled").count,
        low_stock_products:    Product.active.where("stock_quantity <= 5").count,
        out_of_stock_products: Product.active.where(stock_quantity: 0).count,
        total_products:        Product.active.count,
      )
    end

    private

    def set_order
      @order = Order.includes(:order_items, :payments).find(params[:id])
    end

    def status_counts
      Order.group(:status).count
    end
  end
end
