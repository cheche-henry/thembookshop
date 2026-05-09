# Polls the Daraja API for STK Push status if callback hasn't arrived within 2 minutes
# Scheduled via Sidekiq Scheduler (see config/sidekiq.yml)
class MpesaStatusCheckJob < ApplicationJob
  queue_as :payments
  sidekiq_options retry: 2

  def perform(payment_id)
    payment = Payment.find(payment_id)

    return if payment.completed? || payment.status == "failed"
    return if payment.checkout_request_id.blank?

    mpesa   = MpesaService.new
    result  = mpesa.query_stk_status(payment.checkout_request_id)
    code    = result["ResultCode"]&.to_s

    if code == "0"
      # Payment successful — mirror what the callback would do
      payment.update!(
        status:               "completed",
        mpesa_receipt_number: result["MpesaReceiptNumber"] || payment.mpesa_receipt_number,
        result_code:          code,
        result_desc:          result["ResultDesc"],
      )
      order = payment.order
      order.transition_to!("paid")
      OrderNotificationJob.perform_later(order.id, "payment_received")
    elsif code.present? && code != "0"
      payment.update!(status: "failed", result_code: code, result_desc: result["ResultDesc"])
      payment.order.transition_to!("failed") rescue nil
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "[MpesaStatusCheckJob] Payment ##{payment_id} not found"
  rescue MpesaService::MpesaError => e
    Rails.logger.error "[MpesaStatusCheckJob] Daraja error: #{e.message}"
    raise # allow Sidekiq to retry
  end
end
