# Single entry point for order status changes so inventory side effects stay
# consistent no matter whether the change came from a callback, a job or admin.
class OrderWorkflow
  class << self
    def transition!(order, new_status, reason: nil)
      new_status = new_status.to_s

      order.with_lock do
        # Retrying a failed order re-reserves the stock that was released.
        OrderStock.deduct!(order) if order.status == "failed" && new_status == "pending"

        order.transition_to!(new_status)

        case new_status
        when "failed"
          OrderStock.restore!(order)
        when "cancelled"
          OrderStock.restore!(order)
          refund_completed_payments!(order)
        end

        if reason.present?
          order.update_columns(
            notes: [order.notes, reason.to_s.strip].compact.reject(&:blank?).join("\n"),
            updated_at: Time.current
          )
        end

        order
      end
    end

    private

    # A cancelled order must not stay flagged as paid. Actual money movement is
    # handled manually, but the ledger should reflect the refund.
    def refund_completed_payments!(order)
      order.payments.completed.find_each do |payment|
        payment.update!(status: "refunded", result_desc: [payment.result_desc, "Order cancelled"].compact.join(" — "))
      end
    end
  end
end
