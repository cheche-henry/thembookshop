class OrderBlueprint < Blueprinter::Base
  identifier :id

  fields :reference, :customer_name, :customer_phone, :customer_email,
         :delivery_address, :delivery_location, :notes,
         :subtotal, :delivery_fee, :total_amount, :status,
         :created_at, :updated_at

  association :order_items, blueprint: OrderItemBlueprint
  association :payments,    blueprint: PaymentBlueprint

  view :list do
    fields :id, :reference, :customer_name, :customer_phone,
           :customer_email, :total_amount, :status, :created_at
  end
end