class OrderMailer < ApplicationMailer
  # ── Customer confirmation ─────────────────────────────────────────────────
  def order_confirmation(order)
    @order      = order
    @order_items = order.order_items.includes(:product)
    @frontend_url = ENV.fetch("FRONTEND_URL", "https://thembookshop.co.ke")

    mail(
      to:      @order.customer_email,
      subject: "Order Confirmed – #{@order.reference} | Them Bookshop"
    )
  end

  # ── Admin new-order alert ─────────────────────────────────────────────────
  def new_order_admin_alert(order)
    @order       = order
    @order_items = order.order_items.includes(:product)
    @admin_url   = ENV.fetch("ADMIN_URL", "http://localhost:3001/admin")

    mail(
      to:      ENV.fetch("ADMIN_EMAIL_NOTIFY", "admin@thembookshop.co.ke"),
      subject: "[NEW ORDER] #{@order.reference} – KES #{@order.total_amount} – Them Bookshop"
    )
  end

  # ── Payment received confirmation ─────────────────────────────────────────
  def payment_received(order)
    @order   = order
    @payment = order.active_payment

    mail(
      to:      @order.customer_email,
      subject: "Payment Received – #{@order.reference} | Them Bookshop"
    ) if @order.customer_email.present?
  end

  # ── Order status update ───────────────────────────────────────────────────
  def order_status_update(order)
    @order = order

    mail(
      to:      @order.customer_email,
      subject: "Your Order #{@order.reference} is #{@order.status.humanize} | Them Bookshop"
    ) if @order.customer_email.present?
  end
end
