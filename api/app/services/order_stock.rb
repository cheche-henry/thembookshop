# Idempotent inventory reservation/restoration for an order.
#
# Orders reserve stock at creation time. Because payment callbacks, the polling
# job and admin actions can all race to release that stock, every release is
# guarded by the orders.stock_restored flag inside a row lock.
class OrderStock
  class RestoreError < StandardError; end

  class << self
    # Returns true when stock was returned by this call, false when it had
    # already been returned.
    def restore!(order)
      restored = false

      order.with_lock do
        next false if order.stock_restored?

        order.order_items.includes(:product).find_each do |item|
          item.product.restore_stock!(item.quantity)
        end

        order.update_columns(stock_restored: true, updated_at: Time.current)
        restored = true
      end

      restored
    end

    # Re-reserves stock when a failed order is retried. Raises
    # Product::InsufficientStockError when the catalogue no longer has enough.
    def deduct!(order)
      deducted = false

      order.with_lock do
        next false unless order.stock_restored?

        order.order_items.includes(:product).find_each do |item|
          item.product.reduce_stock!(item.quantity)
        end

        order.update_columns(stock_restored: false, updated_at: Time.current)
        deducted = true
      end

      deducted
    end
  end
end
