require "rails_helper"

RSpec.describe OrderWorkflow do
  let(:product) { create(:product, stock_quantity: 7) }
  let(:order)   { create(:order, status: "paid") }

  before do
    create(:order_item, order: order, product: product, quantity: 2)
  end

  it "restores stock and refunds the payment when an order is cancelled" do
    payment = create(:payment, order: order, status: "completed", amount: order.total_amount)

    described_class.transition!(order, "cancelled", reason: "Customer changed their mind")

    expect(order.reload.status).to eq("cancelled")
    expect(order.stock_restored).to be(true)
    expect(product.reload.stock_quantity).to eq(9)
    expect(payment.reload.status).to eq("refunded")
    expect(order.notes).to include("Customer changed their mind")
  end

  it "restores stock when an order fails" do
    described_class.transition!(order, "cancelled")

    expect(product.reload.stock_quantity).to eq(9)
  end

  it "re-reserves stock when a failed order is retried" do
    order.update!(status: "payment_initiated")

    described_class.transition!(order, "failed")
    expect(product.reload.stock_quantity).to eq(9)
    expect(order.reload.stock_restored).to be(true)

    described_class.transition!(order, "pending")

    expect(order.reload.status).to eq("pending")
    expect(order.stock_restored).to be(false)
    expect(product.reload.stock_quantity).to eq(7)
  end

  it "rejects invalid transitions" do
    order.update!(status: "completed")

    expect { described_class.transition!(order, "cancelled") }
      .to raise_error(Order::InvalidTransitionError)
    expect(product.reload.stock_quantity).to eq(7)
  end
end
