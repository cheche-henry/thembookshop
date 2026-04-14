class Product < ApplicationRecord
  has_one_attached :image
  
  validates :name, :price, :category, :stock_quantity, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :stock_quantity, numericality: { greater_than_or_equal_to: 0 }
  
  CATEGORIES = %w[Textbooks Revision Storybooks Stationery School Bags].freeze
  
  def image_url
    return nil unless image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: false)
  end

  def as_json(options = {})
    super(options).merge(image_url: image_url)
  end
end
