class OrderMailer < ApplicationMailer
  default from: 'hisnameishenry01@gmail.com'

  def customer_confirmation(order_id)
    @order = Order.find(order_id)
    mail(to: @order.email, subject: 'Your Them Bookshop Order Confirmation')
  end

  def admin_notification(order_id)
    @order = Order.find(order_id)
    mail(to: 'hisnameishenry01@gmail.com', subject: 'New Order Received')
  end
end