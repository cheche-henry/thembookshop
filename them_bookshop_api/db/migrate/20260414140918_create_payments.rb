class CreatePayments < ActiveRecord::Migration[7.2]
  def change
    create_table :payments do |t|
      t.references :order, null: false, foreign_key: true
      t.string :transaction_id
      t.string :phone_number
      t.decimal :amount, precision: 10, scale: 2
      t.string :status, default: "pending"

      t.timestamps
    end
 end
end
