class AddPaymentHardeningColumns < ActiveRecord::Migration[7.1]
  def change
    # stock_restored: inventory has already been returned for this order, so
    # stock restores stay idempotent across callbacks, admin actions and retries.
    # idempotency_key: lets the storefront retry a create request without
    # duplicating the order.
    change_table :orders, bulk: true do |t|
      t.boolean :stock_restored, default: false, null: false
      t.string :idempotency_key
    end

    add_index :orders, :idempotency_key, unique: true

    # Inventory and totals must never go negative/zero, regardless of app bugs.
    add_check_constraint :products, "stock_quantity >= 0", name: "products_stock_quantity_non_negative"
    add_check_constraint :orders, "total_amount > 0", name: "orders_total_amount_positive"
  end
end
