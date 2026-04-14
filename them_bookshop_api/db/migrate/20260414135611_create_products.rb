class CreateProducts < ActiveRecord::Migration[7.2]
  def change
    create_table :products do |t|
      t.string :name
      t.text :description
      t.decimal :price
      t.string :category
      t.string :class_level
      t.string :subject
      t.integer :stock_quantity

      t.timestamps
    end
  end
end