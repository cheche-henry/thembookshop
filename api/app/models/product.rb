class Product < ApplicationRecord
  has_one_attached :image
  has_many :order_items, dependent: :restrict_with_exception

  CATEGORIES = ["Textbooks", "Revision Books", "Storybooks", "Exercise Books",
                "Pens & Pencils", "Geometry Sets", "Rulers", "School Bags",
                "Stationery"].freeze
  CLASS_LEVELS = ["PP1", "PP2",
                  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
                  "Grade 7","Grade 8","Grade 9","Grade 10",
                  "Form 1","Form 2","Form 3","Form 4"].freeze
  SUBJECTS = %w[Mathematics English Kiswahili Science Biology Chemistry
                Physics Geography History Social\ Studies Creative\ Arts
                CRE Agriculture Pre-Technical Business].freeze

  validates :name, presence: true, length: { maximum: 255 }
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :stock_quantity, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validate  :image_content_type, if: -> { image.attached? }

  scope :active,      -> { where(active: true) }
  scope :in_stock,    -> { where("stock_quantity > 0") }
  scope :by_category, ->(cat)   { cat.present? ? where(category: cat) : all }
  scope :by_level,    ->(level) { level.present? ? where(class_level: level) : all }
  scope :by_subject,  ->(subj)  { subj.present? ? where(subject: subj) : all }
  scope :search,      ->(q)     { q.present? ? where("name ILIKE :q OR description ILIKE :q OR subject ILIKE :q", q: "%#{q}%") : all }
  scope :ordered,     -> { order(sort_order: :asc, created_at: :desc) }

  def in_stock?
    stock_quantity.positive?
  end

  def image_url(host: nil)
    return nil unless image.attached?
    host ||= Rails.application.config.x.app_host
    Rails.application.routes.url_helpers.rails_blob_url(image, host: host)
  rescue
    nil
  end

  def reduce_stock!(qty)
    with_lock do
      raise InsufficientStockError, "Insufficient stock for '#{name}'. Available: #{stock_quantity}" if stock_quantity < qty
      update!(stock_quantity: stock_quantity - qty)
    end
  end

  def restore_stock!(qty)
    with_lock { increment!(:stock_quantity, qty) }
  end

  class InsufficientStockError < StandardError; end

  private

  def image_content_type
    unless image.content_type.in?(%w[image/jpeg image/jpg image/png image/webp])
      errors.add(:image, "must be JPEG, PNG, or WebP")
    end
  end
end
