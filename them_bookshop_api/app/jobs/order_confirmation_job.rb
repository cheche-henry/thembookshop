class OrderConfirmationJob < ApplicationJob
  queue_as :default

  def perform(order_id)
    OrderMailer.customer_confirmation(order_id).deliver_later
  end
end