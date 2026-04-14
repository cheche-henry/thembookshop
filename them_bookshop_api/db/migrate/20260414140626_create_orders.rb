class CreateOrders < ActiveRecord::Migration[7.2]
  def change
    create_table :orders do |t|
      t.string :name
      t.string :phone_number
      t.string :email
      t.text :delivery_address
      t.string :status, default: "pending"
      t.decimal :total_amount, default: 0
      t.string :mpesa_transaction_id
      t.string :payment_status, default: "pending"

      t.timestamps
    end
 end
end
