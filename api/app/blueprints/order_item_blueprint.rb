class OrderItemBlueprint < Blueprinter::Base
  identifier :id

  fields :quantity, :unit_price, :total_price, :product_name_snapshot, :created_at

  field :product_id do |item|
    item.product_id
  end

  association :product, blueprint: ProductBlueprint, view: :list
end
