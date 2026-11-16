FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "Textbook #{n}" }
    description { "A school textbook" }
    price { 350 }
    category { "Textbooks" }
    class_level { "Grade 4" }
    subject { "Mathematics" }
    stock_quantity { 10 }
    active { true }
  end

  factory :admin_user do
    sequence(:email) { |n| "admin#{n}@thembookshop.co.ke" }
    name { "Admin User" }
    password { "Password123!" }
    active { true }
  end

  factory :order do
    customer_name { "Jane Muthoni" }
    customer_phone { "0712345678" }
    customer_email { "jane@example.com" }
    delivery_address { "Nairobi CBD" }
    delivery_location { "Nairobi CBD" }
    subtotal { 350 }
    delivery_fee { 0 }
    total_amount { 350 }
    status { "pending" }
  end

  factory :order_item do
    order
    product
    quantity { 1 }
    unit_price { product.price }
    total_price { product.price * quantity }
    product_name_snapshot { product.name }
  end

  factory :payment do
    order
    add_attribute(:method) { "mpesa" }
    status { "initiated" }
    amount { order.total_amount }
    phone_number { "0712345678" }
    sequence(:checkout_request_id) { |n| "ws_CO_TEST#{n}" }
  end
end
