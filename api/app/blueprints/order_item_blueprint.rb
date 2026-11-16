class OrderItemBlueprint < Blueprinter::Base
  identifier :id

  view :public do
    fields :quantity, :unit_price, :total_price, :product_name_snapshot, :product_id
  end

  view :admin do
    fields :quantity, :unit_price, :total_price, :product_name_snapshot, :product_id, :created_at
    association :product, blueprint: ProductBlueprint, view: :list
  end
end
