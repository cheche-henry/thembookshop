class MpesaStatusCheckJob < ApplicationJob
  queue_as :payments
  sidekiq_options retry: 2

  MAX_ATTEMPTS = 6
  RETRY_DELAY  = 1.minute

  def perform(payment_id, attempt = 1)
    payment = Payment.find(payment_id)

    return if payment.terminal? || payment.checkout_request_id.blank?

    mpesa  = MpesaService.new
    result = mpesa.query_stk_status(payment.checkout_request_id)
    code   = result["ResultCode"]&.to_s

    if code == "0"
      finalize_success(payment, result)
    elsif code.present?
      finalize_failure(payment, code, result["ResultDesc"])
    elsif attempt < MAX_ATTEMPTS
      # Daraja is still processing the prompt (usually reports this as an
      # errorCode without a ResultCode). Keep polling instead of giving up.
      self.class.set(wait: RETRY_DELAY).perform_later(payment_id, attempt + 1)
    else
      Rails.logger.warn "[MpesaStatusCheckJob] Payment ##{payment_id} still unresolved after #{attempt} attempts"
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "[MpesaStatusCheckJob] Payment ##{payment_id} not found"
  rescue MpesaService::MpesaError => e
    Rails.logger.error "[MpesaStatusCheckJob] Daraja error: #{e.message}"
    raise
  end

  private

  def finalize_success(payment, result)
    completed = false

    ActiveRecord::Base.transaction do
      payment.lock!
      next if payment.completed?

      payment.update!(
        status: "completed",
        mpesa_receipt_number: result["MpesaReceiptNumber"] || payment.mpesa_receipt_number,
        mpesa_transaction_id: result["MpesaReceiptNumber"] || payment.mpesa_transaction_id,
        mpesa_transaction_date: parse_mpesa_date(result["TransactionDate"]) || Time.current,
        result_code: "0",
        result_desc: result["ResultDesc"]
      )

      order = Order.find(payment.order_id)
      if order.can_transition_to?("paid")
        OrderWorkflow.transition!(order, "paid")
      else
        Rails.logger.error(
          "[MpesaStatusCheckJob] Payment ##{payment.id} completed but order " \
          "#{order.reference} is '#{order.status}' — manual reconciliation required"
        )
      end

      completed = true
    end

    return unless completed

    enqueue_notification(payment.order_id, "order_placed")
    enqueue_notification(payment.order_id, "payment_received")
  end

  def finalize_failure(payment, code, description)
    ActiveRecord::Base.transaction do
      payment.lock!
      next if payment.terminal?

      payment.update!(status: "failed", result_code: code, result_desc: description)

      order = Order.find(payment.order_id)
      if order.status.in?(%w[pending payment_initiated]) && order.can_transition_to?("failed")
        OrderWorkflow.transition!(order, "failed", reason: "M-Pesa payment failed: #{description}")
      end
    end
  end

  def enqueue_notification(order_id, event)
    OrderNotificationJob.perform_later(order_id, event)
  rescue StandardError => e
    Rails.logger.error "[MpesaStatusCheckJob] Could not enqueue #{event} for order ##{order_id}: #{e.class}: #{e.message}"
  end

  def parse_mpesa_date(value)
    return nil if value.blank?

    Time.strptime(value.to_s, "%Y%m%d%H%M%S")
  rescue ArgumentError
    nil
  end
end
