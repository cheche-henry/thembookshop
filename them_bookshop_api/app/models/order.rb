class Order < ApplicationRecord
  has_many :order_items, dependent: :destroy
  has_one :payment, dependent: :destroy
  
  validates :name, :phone_number, :delivery_address, presence: true
  validates :phone_number, format: { with: /\A0[17]\d{8}\z/, message: "must be a valid Kenyan number (07XXXXXXXX or 01XXXXXXXX)" }
  
  enum status: { pending: 'pending', paid: 'paid', failed: 'failed', completed: 'completed' }
  enum payment_status: { pending: 'pending', success: 'success', failed: 'failed' }
  
  before_create :calculate_total

  private

  def calculate_total
    self.total_amount = order_items.sum { |item| item.price_at_purchase * item.quantity }
  end
end
