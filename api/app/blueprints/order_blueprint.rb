class OrderBlueprint < Blueprinter::Base
  identifier :id

  fields :reference, :customer_name, :customer_phone, :customer_email,
         :delivery_address, :delivery_location, :notes,
         :subtotal, :delivery_fee, :total_amount, :status,
         :created_at, :updated_at

  association :order_items, blueprint: OrderItemBlueprint
  association :payments,    blueprint: PaymentBlueprint

  view :list do
    excludes :notes, :delivery_location
    exclude_association :order_items
    exclude_association :payments
    fields :reference, :customer_name, :customer_phone, :total_amount, :status, :created_at
  end
end
