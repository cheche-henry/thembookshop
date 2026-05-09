class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.string  :reference,        null: false  # e.g. TBS-20240101-0001
      t.string  :customer_name,    null: false
      t.string  :customer_phone,   null: false
      t.string  :customer_email
      t.text    :delivery_address, null: false
      t.string  :delivery_location
      t.text    :notes
      t.decimal :subtotal,         null: false, precision: 10, scale: 2
      t.decimal :delivery_fee,     null: false, precision: 10, scale: 2, default: 0
      t.decimal :total_amount,     null: false, precision: 10, scale: 2
      t.string  :status,           null: false, default: "pending"
      # pending → payment_initiated → paid → processing → completed | failed | cancelled

      t.timestamps
    end
    add_index :orders, :reference, unique: true
    add_index :orders, :customer_phone
    add_index :orders, :customer_email
    add_index :orders, :status
    add_index :orders, :created_at
  end
end
