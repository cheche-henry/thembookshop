require "rails_helper"

RSpec.describe OrderStock do
  let(:product) { create(:product, stock_quantity: 10) }
  let(:order)   { create(:order, status: "payment_initiated") }

  before do
    create(:order_item, order: order, product: product, quantity: 3)
  end

  describe ".restore!" do
    it "returns stock exactly once" do
      expect(described_class.restore!(order)).to be(true)
      expect(product.reload.stock_quantity).to eq(13)
      expect(order.reload.stock_restored).to be(true)

      expect(described_class.restore!(order)).to be(false)
      expect(product.reload.stock_quantity).to eq(13)
    end
  end

  describe ".deduct!" do
    it "re-reserves stock for a restored order" do
      described_class.restore!(order)

      expect(described_class.deduct!(order)).to be(true)
      expect(product.reload.stock_quantity).to eq(10)
      expect(order.reload.stock_restored).to be(false)
    end

    it "does nothing when stock is already reserved" do
      expect(described_class.deduct!(order)).to be(false)
      expect(product.reload.stock_quantity).to eq(10)
    end

    it "raises without changing the flag when stock is insufficient" do
      described_class.restore!(order)
      product.update!(stock_quantity: 1)

      expect { described_class.deduct!(order) }
        .to raise_error(Product::InsufficientStockError)
      expect(order.reload.stock_restored).to be(true)
    end
  end
end
