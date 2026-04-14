class Payment < ApplicationRecord
  belongs_to :order
  
  enum status: { pending: 'pending', success: 'success', failed: 'failed' }
  
  validates :phone_number, format: { with: /\A0[17]\d{8}\z/ }, allow_blank: true
end
