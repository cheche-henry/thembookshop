class AdminNotificationJob < ApplicationJob
  queue_as :default

  def perform(order_id)
    OrderMailer.admin_notification(order_id).deliver_later
  end
end