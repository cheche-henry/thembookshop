class AddCatalogueMetadataToProducts < ActiveRecord::Migration[7.1]
  def change
    change_table :products, bulk: true do |t|
      t.string :subcategory
      t.string :subsubject
      t.string :stage
      t.string :class_levels, array: true, default: [], null: false
      t.string :raw_name
      t.string :source_key
    end

    reversible do |dir|
      dir.up do
        # Existing rows only carry a single class_level. Promote it to the new
        # array so filters and display keep working before the catalogue is
        # re-seeded.
        execute <<~SQL.squish
          UPDATE products
          SET class_levels = ARRAY[class_level]
          WHERE class_level IS NOT NULL AND class_level <> ''
        SQL
      end
    end

    add_index :products, %i[category subcategory]
    add_index :products, :subcategory
    add_index :products, :subsubject
    add_index :products, :stage
    add_index :products, :class_levels, using: :gin
    add_index :products, :source_key, unique: true
  end
end
