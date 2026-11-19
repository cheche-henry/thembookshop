class Product < ApplicationRecord
  has_one_attached :image
  has_many :order_items, dependent: :restrict_with_exception

  # ── Catalogue taxonomy ────────────────────────────────────────────────────
  # Departments (category) → shelves (subcategory). Every product belongs to
  # exactly one shelf so the storefront filters never offer an empty bucket.
  TAXONOMY = {
    "Books" => [
      "Textbooks",
      "Revision & Exam Prep",
      "Set Books & Literature",
      "Readers & Storybooks",
      "Reference & Dictionaries",
      "Bibles & Religious"
    ],
    "Stationery" => [
      "Exercise Books & Notebooks",
      "Writing & Correction",
      "Paper, Envelopes & Book Covers",
      "Files & Filing",
      "Office Essentials",
      "Accounting & Cash Books",
      "Registers & Admin Books",
      "Diaries & Planners",
      "Adhesives & Tapes",
      "Calculators",
      "Math Sets & Technical Drawing",
      "Chalk & Whiteboard"
    ],
    "Art & Craft" => [
      "Colouring",
      "Paints & Brushes",
      "Craft & Modelling"
    ],
    "School Equipment" => [
      "Classroom & Teaching Aids",
      "Sports & PE",
      "Home Science & Sewing",
      "Tools & Hardware",
      "Music & Electronics"
    ]
  }.freeze

  CATEGORIES    = TAXONOMY.keys.freeze
  SUBCATEGORIES = TAXONOMY.values.flatten.freeze

  # A subject is the broad learning area. Components are the strands inside it,
  # which is why Fasihi belongs to Kiswahili rather than beside it.
  SUBJECT_COMPONENTS = {
    "Kiswahili" => %w[Lugha Fasihi Insha].freeze,
    "English" => %w[Language Literature Composition].freeze
  }.freeze

  SUBJECTS = [
    "Mathematics", "English", "Kiswahili", "Science", "Biology", "Chemistry",
    "Physics", "Geography", "History", "Social Studies", "Creative Arts", "CRE",
    "Agriculture", "Pre-Technical", "Business"
  ].freeze

  # Stage is a coarse school band. It is stored separately from class levels so
  # stage-wide reference books (atlases, tables) are not forced into a form.
  STAGES = {
    "Pre-Primary" => %w[PP1 PP2],
    "Lower Primary" => ["Grade 1", "Grade 2", "Grade 3"],
    "Upper Primary" => ["Grade 4", "Grade 5", "Grade 6"],
    "Junior Secondary" => ["Grade 7", "Grade 8", "Grade 9"],
    "Senior Secondary" => ["Grade 10", "Grade 11", "Grade 12"],
    "Secondary (8-4-4)" => ["Form 1", "Form 2", "Form 3", "Form 4"]
  }.freeze

  CLASS_LEVELS = STAGES.values.flatten.freeze

  BADGES = [
    "Best Seller", "New", "New Edition", "Popular", "Exam Prep",
    "Bundle Deal", "Value Pack", "Kids Favorite", "Set Book"
  ].freeze

  validates :name, presence: true, length: { maximum: 255 }
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :subcategory, presence: true, inclusion: { in: SUBCATEGORIES }
  validates :subject, inclusion: { in: SUBJECTS }, allow_blank: true
  validates :stage, inclusion: { in: STAGES.keys }, allow_blank: true
  validates :stock_quantity, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validate  :subcategory_matches_category
  validate  :subsubject_matches_subject
  validate  :class_levels_are_known
  validate  :image_content_type, if: -> { image.attached? }

  IMAGE_CONTENT_TYPES = %w[image/jpeg image/jpg image/png image/webp].freeze
  MAX_IMAGE_BYTES     = 5.megabytes

  scope :active,        -> { where(active: true) }
  scope :in_stock,      -> { where("stock_quantity > 0") }
  scope :by_category,   ->(cat)  { cat.present? ? where(category: cat) : all }
  scope :by_subcategory, ->(sub) { sub.present? ? where(subcategory: sub) : all }
  scope :by_level,      ->(level) { level.present? ? where("? = ANY(class_levels)", level) : all }
  scope :by_subject,    ->(subj) { subj.present? ? where(subject: subj) : all }
  scope :by_subsubject, ->(sub)  { sub.present? ? where(subsubject: sub) : all }
  scope :by_stage,      ->(stg)  { stg.present? ? where(stage: stg) : all }
  scope :by_ids,        ->(ids)  { ids.present? ? where(id: ids) : all }
  scope :search,        lambda { |q|
    q.present? ? where("name ILIKE :q OR description ILIKE :q OR subject ILIKE :q OR subcategory ILIKE :q", q: "%#{q}%") : all
  }
  scope :ordered, -> { order(sort_order: :asc, created_at: :desc) }

  # Shape consumed by the storefront/admin filter builders.
  def self.catalogue_meta
    {
      categories: TAXONOMY.map { |name, subcategories| { name: name, subcategories: subcategories } },
      subjects: SUBJECTS.map { |name| { name: name, components: SUBJECT_COMPONENTS.fetch(name, []) } },
      stages: STAGES.map { |name, levels| { name: name, levels: levels } },
      class_levels: CLASS_LEVELS,
      badges: BADGES
    }
  end

  def in_stock?
    stock_quantity.positive?
  end

  # Levels stored on the product. Falls back to the legacy single column while
  # older records are still around.
  def effective_levels
    levels = Array(class_levels).compact_blank
    levels.presence || Array(class_level).compact_blank
  end

  def level_label
    ProductNameNormalizer.level_label(effective_levels)
  end

  def subject_label
    [subject, subsubject].compact_blank.join(" · ").presence
  end

  def category_label
    [category, subcategory].compact_blank.join(" · ")
  end

  def image_url(host: nil)
    return nil unless image.attached?

    host ||= Rails.application.config.x.app_host
    Rails.application.routes.url_helpers.rails_blob_url(image, host: host)
  rescue StandardError => e
    Rails.logger.warn "[Product#image_url] Product ##{id}: #{e.class}: #{e.message}"
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

  def subcategory_matches_category
    return if subcategory.blank? || category.blank?

    allowed = TAXONOMY.fetch(category, [])
    return if allowed.include?(subcategory)

    errors.add(:subcategory, "is not available under #{category}")
  end

  def subsubject_matches_subject
    return if subsubject.blank?
    return errors.add(:subsubject, "requires a subject") if subject.blank?

    components = SUBJECT_COMPONENTS.fetch(subject, [])
    return if components.include?(subsubject)

    errors.add(:subsubject, "is not a component of #{subject}")
  end

  def class_levels_are_known
    unknown = Array(class_levels).compact_blank - CLASS_LEVELS
    return if unknown.empty?

    errors.add(:class_levels, "contains unknown level(s): #{unknown.join(", ")}")
  end

  def image_content_type
    errors.add(:image, "must be JPEG, PNG, or WebP") unless image.content_type.in?(IMAGE_CONTENT_TYPES)

    return unless image.blob.byte_size.to_i > MAX_IMAGE_BYTES

    errors.add(:image, "must be smaller than #{MAX_IMAGE_BYTES / 1.megabyte}MB")
  end
end
