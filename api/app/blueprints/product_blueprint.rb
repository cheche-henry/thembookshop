class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :price, :category, :class_level, :subject,
         :stock_quantity, :active, :badge, :sort_order, :created_at, :updated_at

  field :in_stock do |product|
    product.in_stock?
  end

  field :image_url do |product, options|
    host = options[:host] || Rails.application.config.x.app_host
    product.image_url(host:)
  end

  view :admin do
    fields :stock_quantity, :active, :sort_order
  end

  view :list do
    excludes :description
  end
end
