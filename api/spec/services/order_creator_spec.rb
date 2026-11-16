require "rails_helper"

RSpec.describe OrderCreator do
  let(:product) { create(:product, price: 350, stock_quantity: 5) }
  let(:order_params) do
    {
      customer_name: "Jane Muthoni",
      customer_phone: "0712 345 678",
      customer_email: "jane@example.com",
      delivery_address: "Nairobi CBD"
    }
  end

  def call(items, key: nil)
    described_class.call(
      order_params: order_params,
      items_params: items,
      idempotency_key: key
    )
  end

  it "creates the order and reserves stock" do
    result = call([{ product_id: product.id, quantity: 2 }])

    expect(result).to be_success
    order = result.order
    expect(order.reload.status).to eq("pending")
    expect(order.order_items.count).to eq(1)
    expect(order.order_items.first.quantity).to eq(2)
    expect(order.subtotal).to eq(700)
    expect(order.total_amount).to eq(700)
    expect(product.reload.stock_quantity).to eq(3)
  end

  it "normalises the customer phone number" do
    result = call([{ product_id: product.id, quantity: 1 }])

    expect(result.order.customer_phone).to eq("254712345678")
  end

  it "collapses duplicate cart rows for the same product" do
    result = call([
                    { product_id: product.id, quantity: 1 },
                    { product_id: product.id, quantity: 2 }
                  ])

    expect(result).to be_success
    expect(result.order.order_items.count).to eq(1)
    expect(result.order.order_items.first.quantity).to eq(3)
    expect(product.reload.stock_quantity).to eq(2)
  end

  it "refuses orders that exceed available stock and leaves stock untouched" do
    result = call([{ product_id: product.id, quantity: 6 }])

    expect(result).not_to be_success
    expect(result.errors.first).to include("Insufficient stock")
    expect(Order.count).to eq(0)
    expect(product.reload.stock_quantity).to eq(5)
  end

  it "refuses inactive products" do
    product.update!(active: false)

    result = call([{ product_id: product.id, quantity: 1 }])

    expect(result).not_to be_success
    expect(result.errors.first).to include("not found or unavailable")
  end

  it "replays a request with the same idempotency key instead of duplicating it" do
    first = call([{ product_id: product.id, quantity: 2 }], key: "checkout-abc")
    second = call([{ product_id: product.id, quantity: 4 }], key: "checkout-abc")

    expect(second).to be_success
    expect(second.replayed).to be(true)
    expect(second.order.id).to eq(first.order.id)
    expect(Order.count).to eq(1)
    expect(product.reload.stock_quantity).to eq(3)
  end
end
