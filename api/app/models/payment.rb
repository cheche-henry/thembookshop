class Payment < ApplicationRecord
  belongs_to :order

  STATUSES = %w[pending initiated completed failed cancelled refunded].freeze
  METHODS  = %w[mpesa].freeze

  validates :status,       inclusion: { in: STATUSES }
  validates :method,       inclusion: { in: METHODS }
  validates :amount,       numericality: { greater_than: 0 }
  validates :phone_number, presence: true

  before_validation :normalize_phone_number

  scope :completed, -> { where(status: "completed") }
  scope :pending,   -> { where(status: "pending") }

  def completed?
    status == "completed"
  end

  def terminal?
    status.in?(%w[completed failed refunded cancelled])
  end

  # Normalise to 2547XXXXXXXX format for Daraja
  def normalized_phone
    PhoneNumber.normalize(phone_number)
  end

  private

  def normalize_phone_number
    self.phone_number = PhoneNumber.normalize(phone_number) if phone_number.present?
  end
end
