class MpesaStatusCheckJob < ApplicationJob
  queue_as :payments
  sidekiq_options retry: 2

  def perform(payment_id)
    payment = Payment.find(payment_id)

    return if payment.completed? || payment.status == "failed"
    return if payment.checkout_request_id.blank?

    mpesa  = MpesaService.new
    result = mpesa.query_stk_status(payment.checkout_request_id)
    code   = result["ResultCode"]&.to_s

    if code == "0"
      # Payment confirmed via polling fallback
      payment.update!(
        status:               "completed",
        mpesa_receipt_number: result["MpesaReceiptNumber"] || payment.mpesa_receipt_number,
        result_code:          code,
        result_desc:          result["ResultDesc"],
      )
      order = payment.order
      order.transition_to!("paid")

      # Send emails now that payment is confirmed
      OrderNotificationJob.perform_later(order.id, "order_placed")
      OrderNotificationJob.perform_later(order.id, "payment_received")

    elsif code.present? && code != "0"
      # Payment failed — restore stock
      payment.update!(status: "failed", result_code: code, result_desc: result["ResultDesc"])
      order = payment.order
      order.transition_to!("failed") rescue nil

      order.order_items.includes(:product).each do |item|
        item.product.restore_stock!(item.quantity) rescue nil
      end
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "[MpesaStatusCheckJob] Payment ##{payment_id} not found"
  rescue MpesaService::MpesaError => e
    Rails.logger.error "[MpesaStatusCheckJob] Daraja error: #{e.message}"
    raise
  end
end