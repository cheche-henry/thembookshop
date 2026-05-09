class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string  :name,           null: false
      t.text    :description
      t.decimal :price,          null: false, precision: 10, scale: 2
      t.string  :category,       null: false
      t.string  :class_level
      t.string  :subject
      t.integer :stock_quantity, null: false, default: 0
      t.boolean :active,         null: false, default: true
      t.string  :badge
      t.integer :sort_order,     default: 0

      t.timestamps
    end
    add_index :products, :category
    add_index :products, :class_level
    add_index :products, :subject
    add_index :products, :active
    add_index :products, [:category, :active]
  end
end
