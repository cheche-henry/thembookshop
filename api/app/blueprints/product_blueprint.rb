class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :price, :category, :subcategory, :class_level,
         :class_levels, :subject, :subsubject, :stage, :stock_quantity, :active,
         :badge, :sort_order, :created_at, :updated_at

  field :in_stock, &:in_stock?
  field :level_label, &:level_label
  field :subject_label, &:subject_label
  field :category_label, &:category_label

  field :image_url do |product, options|
    host = options[:host] || Rails.application.config.x.app_host
    product.image_url(host:)
  end

  view :admin do
    fields :stock_quantity, :active, :sort_order, :raw_name, :source_key
  end

  view :list do
    excludes :description
  end
end
