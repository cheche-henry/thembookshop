class OrderBlueprint < Blueprinter::Base
  identifier :id

  # Public-safe view: no customer PII, no payment identifiers. Used by the
  # guest order lookup and order-creation responses.
  view :public do
    fields :reference, :subtotal, :delivery_fee, :total_amount, :status,
           :created_at, :updated_at
    association :order_items, blueprint: OrderItemBlueprint, view: :public
  end

  view :admin do
    fields :reference, :customer_name, :customer_phone, :customer_email,
           :delivery_address, :delivery_location, :notes,
           :subtotal, :delivery_fee, :total_amount, :status, :stock_restored,
           :created_at, :updated_at
    association :order_items, blueprint: OrderItemBlueprint, view: :admin
    association :payments,    blueprint: PaymentBlueprint, view: :admin
  end

  view :list do
    fields :reference, :customer_name, :customer_phone, :customer_email,
           :total_amount, :status, :created_at
  end
end
