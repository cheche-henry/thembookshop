module Admin
  class ProductsController < ApplicationController
    MAX_PER_PAGE = 100

    before_action :authenticate_admin!
    before_action :set_product, only: %i[show update destroy upload_image remove_image restock]

    # GET /admin/products
    def index
      products = Product
                 .with_attached_image
                 .by_category(params[:category])
                 .by_subcategory(params[:subcategory])
                 .by_subject(params[:subject])
                 .by_subsubject(params[:subsubject])
                 .by_stage(params[:stage])
                 .by_level(params[:class_level])
                 .search(params[:q])
                 .order(created_at: :desc)
                 .page(params[:page])
                 .per(per_page)

      # Include inactive products for admin
      products = products.where(active: ActiveModel::Type::Boolean.new.cast(params[:active])) if params[:active].present?

      render_success(
        ProductBlueprint.render_as_hash(products, view: :admin, host: request.base_url),
        meta: pagination_meta(products)
      )
    end

    # GET /admin/products/:id
    def show
      render_success(ProductBlueprint.render_as_hash(@product, view: :admin, host: request.base_url))
    end

    # POST /admin/products
    def create
      image = params.dig(:product, :image)
      return render_error(image_error_message, status: :unprocessable_entity) if image.present? && !valid_image_upload?(image)

      product = Product.new(product_params)
      product.image.attach(image) if image.present?

      if product.save
        render_created(
          ProductBlueprint.render_as_hash(product, view: :admin, host: request.base_url),
          message: "Product '#{product.name}' created"
        )
      else
        render_error("Product could not be saved", errors: product.errors.full_messages)
      end
    end

    # PATCH /admin/products/:id
    def update
      image = params.dig(:product, :image)
      return render_error(image_error_message, status: :unprocessable_entity) if image.present? && !valid_image_upload?(image)

      @product.assign_attributes(product_params)
      attach_image(@product) if image.present?

      if @product.save
        render_success(
          ProductBlueprint.render_as_hash(@product, view: :admin, host: request.base_url),
          message: "Product updated"
        )
      else
        render_error("Product could not be updated", errors: @product.errors.full_messages)
      end
    end

    # DELETE /admin/products/:id
    def destroy
      if @product.order_items.exists?
        # Soft-delete to preserve order history
        @product.update!(active: false)
        render_success({}, message: "Product deactivated (has existing orders)")
      else
        @product.image.purge if @product.image.attached?
        @product.destroy!
        render_success({}, message: "Product deleted")
      end
    end

    # POST /admin/products/:id/upload_image  (multipart/form-data)
    def upload_image
      file = params[:image]

      return render_error("No image file provided", status: :bad_request) if file.blank?

      return render_error(image_error_message, status: :unprocessable_entity) unless valid_image_upload?(file)

      # Only replace the existing image once the new file has passed validation.
      @product.image.purge if @product.image.attached?
      @product.image.attach(file)

      if @product.save
        render_success(
          { image_url: @product.image_url(host: request.base_url) },
          message: "Image uploaded"
        )
      else
        @product.image.purge if @product.image.attached?
        render_error("Image upload failed", errors: @product.errors.full_messages)
      end
    end

    # DELETE /admin/products/:id/remove_image
    def remove_image
      @product.image.purge if @product.image.attached?
      render_success({}, message: "Image removed")
    end

    # GET /admin/products/low_stock
    def low_stock
      threshold = [params[:threshold].to_i, 0].max
      threshold = 5 if threshold.zero?
      products  = Product.active.with_attached_image.where("stock_quantity <= ?", threshold).order(:stock_quantity)
      render_success(ProductBlueprint.render_as_hash(products, view: :admin, host: request.base_url))
    end

    # PATCH /admin/products/:id/restock
    def restock
      qty = params[:quantity].to_i
      return render_error("Quantity must be positive") unless qty.positive?

      @product.increment!(:stock_quantity, qty)
      render_success(
        { stock_quantity: @product.stock_quantity },
        message: "Added #{qty} units. New stock: #{@product.stock_quantity}"
      )
    end

    private

    def set_product
      @product = Product.find(params[:id])
    end

    def per_page
      value = params[:per_page].to_i
      value = 25 unless value.positive?
      [value, MAX_PER_PAGE].min
    end

    def product_params
      attrs = params.require(:product).permit(
        :name, :description, :price, :category, :subcategory, :class_level,
        :subject, :subsubject, :stage, :stock_quantity, :active, :badge,
        :sort_order, class_levels: []
      )

      # The storefront reads class_levels; class_level is the legacy single-value
      # column kept in sync so older queries and exports keep working.
      if attrs.key?(:class_levels)
        levels = Array(attrs[:class_levels]).compact_blank
        attrs[:class_levels] = levels
        attrs[:class_level]  = levels.first
      end

      # Form inputs submit "" to clear a value; store a real NULL instead.
      %i[subject subsubject stage].each do |key|
        attrs[key] = nil if attrs.key?(key) && attrs[key].blank?
      end

      attrs
    end

    def attach_image(product)
      product.image.attach(params[:product][:image])
    end

    def image_error_message
      "Image must be a JPEG, PNG or WebP file smaller than #{Product::MAX_IMAGE_BYTES / 1.megabyte}MB"
    end

    def valid_image_upload?(file)
      Product::IMAGE_CONTENT_TYPES.include?(file.content_type.to_s) &&
        file.size.to_i.between?(1, Product::MAX_IMAGE_BYTES)
    end
  end
end
