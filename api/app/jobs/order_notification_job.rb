# Sends order emails asynchronously via Sidekiq
# Enqueued by: OrdersController#create, PaymentsController#callback
class OrderNotificationJob < ApplicationJob
  queue_as :mailers
  sidekiq_options retry: 3, dead: true

  VALID_EVENTS = %w[order_placed payment_received order_status_update].freeze

  def perform(order_id, event)
    order = Order.includes(:order_items, :payments).find(order_id)

    case event
    when "order_placed"
      # Confirmation to customer (only if email provided)
      OrderMailer.order_confirmation(order).deliver_now if order.customer_email.present?
      # Alert to admin (always)
      OrderMailer.new_order_admin_alert(order).deliver_now
    when "payment_received"
      OrderMailer.payment_received(order).deliver_now if order.customer_email.present?
    when "order_status_update"
      OrderMailer.order_status_update(order).deliver_now if order.customer_email.present?
    else
      Rails.logger.warn "[OrderNotificationJob] Unknown event: #{event}"
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "[OrderNotificationJob] Order ##{order_id} not found"
  end
end
