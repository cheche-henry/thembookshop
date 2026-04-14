class AddIndexesAndConstraints < ActiveRecord::Migration[7.2]
  def change
    add_index :admin_users, :email, unique: true
    add_index :products, :category
    add_index :products, [:category, :class_level]
    add_index :orders, :phone_number
    add_index :order_items, [:order_id, :product_id]
  end
end