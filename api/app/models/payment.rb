class Payment < ApplicationRecord
  belongs_to :order

  STATUSES = %w[pending initiated completed failed cancelled refunded].freeze
  METHODS  = %w[mpesa].freeze

  validates :status,       inclusion: { in: STATUSES }
  validates :method,       inclusion: { in: METHODS }
  validates :amount,       numericality: { greater_than: 0 }
  validates :phone_number, presence: true

  scope :completed, -> { where(status: "completed") }
  scope :pending,   -> { where(status: "pending") }

  def completed?
    status == "completed"
  end

  # Normalise to 2547XXXXXXXX format for Daraja
  def normalized_phone
    ph = phone_number.to_s.gsub(/[\s\-]/, "")
    ph = ph.sub(/\A\+/, "")           # remove leading +
    ph = ph.sub(/\A0/, "254")         # 07xx → 2547xx
    ph
  end
end
