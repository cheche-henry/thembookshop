class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :quantity,   numericality: { greater_than: 0, only_integer: true }
  validates :unit_price, numericality: { greater_than_or_equal_to: 0 }
  validates :total_price, numericality: { greater_than_or_equal_to: 0 }
  validates :product_name_snapshot, presence: true

  before_validation :set_prices_and_snapshot

  private

  def set_prices_and_snapshot
    if product.present?
      self.unit_price            = product.price
      self.total_price           = unit_price * quantity.to_i
      self.product_name_snapshot = product.name
    end
  end
end
