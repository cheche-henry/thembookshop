class Order < ApplicationRecord
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items
  has_many :payments, dependent: :destroy

  STATUSES = %w[pending payment_initiated paid processing completed failed cancelled].freeze
  VALID_TRANSITIONS = {
    "pending"           => %w[payment_initiated cancelled],
    "payment_initiated" => %w[paid failed cancelled],
    "paid"              => %w[processing cancelled],
    "processing"        => %w[completed],
    "completed"         => [],
    "failed"            => %w[pending],
    "cancelled"         => [],
  }.freeze

  validates :reference,      presence: true, uniqueness: true
  validates :customer_name,  presence: true, length: { minimum: 2, maximum: 100 }
  validates :customer_phone, presence: true, format: {
    with: /\A(\+?254|0)[17]\d{8}\z/,
    message: "must be a valid Kenyan number (e.g. 0712345678)"
  }
  validates :customer_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :delivery_address, presence: true
  validates :total_amount, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }

  before_validation :generate_reference, on: :create

  scope :recent,    -> { order(created_at: :desc) }
  scope :by_status, ->(s) { s.present? ? where(status: s) : all }

  def can_transition_to?(new_status)
    VALID_TRANSITIONS[status]&.include?(new_status.to_s)
  end

  def transition_to!(new_status)
    new_status = new_status.to_s
    raise InvalidTransitionError, "Cannot move order from '#{status}' to '#{new_status}'" unless can_transition_to?(new_status)
    update!(status: new_status)
  end

  def active_payment
    payments.order(created_at: :desc).first
  end

  def paid?
    status.in?(%w[paid processing completed])
  end

  class InvalidTransitionError < StandardError; end

  private

  def generate_reference
    self.reference ||= loop do
      ref = "TBS-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.alphanumeric(6).upcase}"
      break ref unless Order.exists?(reference: ref)
    end
  end
end
