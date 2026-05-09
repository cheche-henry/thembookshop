class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments do |t|
      t.references :order, null: false, foreign_key: true
      t.string  :method,               null: false, default: "mpesa"
      t.string  :status,               null: false, default: "pending"
      # pending | initiated | completed | failed | cancelled | refunded
      t.decimal :amount,               null: false, precision: 10, scale: 2
      t.string  :phone_number,         null: false

      # Daraja STK Push fields
      t.string  :merchant_request_id
      t.string  :checkout_request_id
      t.string  :mpesa_receipt_number   # filled on callback
      t.string  :mpesa_transaction_id   # alias for receipt
      t.string  :result_code
      t.string  :result_desc
      t.datetime :mpesa_transaction_date

      # Raw callback payload for audit
      t.jsonb   :raw_callback

      t.timestamps
    end
    add_index :payments, :checkout_request_id, unique: true
    add_index :payments, :mpesa_receipt_number
    add_index :payments, :status
  end
end
