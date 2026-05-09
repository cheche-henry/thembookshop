module Admin
  class ProductsController < ApplicationController
    before_action :authenticate_admin!
    before_action :set_product, only: [:show, :update, :destroy, :upload_image, :remove_image]

    # GET /admin/products
    def index
      products = Product
                 .by_category(params[:category])
                 .search(params[:q])
                 .order(created_at: :desc)
                 .page(params[:page])
                 .per(params[:per_page] || 25)

      # Include inactive products for admin
      products = products.where(active: params[:active]) if params[:active].present?

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
      product = Product.new(product_params)

      if product.save
        attach_image(product) if params[:product][:image].present?
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
      if @product.update(product_params)
        attach_image(@product) if params[:product][:image].present?
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

    # POST /admin/products/:id/image  (multipart/form-data)
    def upload_image
      if params[:image].blank?
        return render_error("No image file provided", status: :bad_request)
      end

      @product.image.purge if @product.image.attached?
      @product.image.attach(params[:image])

      if @product.image.attached? && @product.valid?
        render_success(
          { image_url: @product.image_url(host: request.base_url) },
          message: "Image uploaded"
        )
      else
        render_error("Image upload failed", errors: @product.errors.full_messages)
      end
    end

    # DELETE /admin/products/:id/image
    def remove_image
      @product.image.purge if @product.image.attached?
      render_success({}, message: "Image removed")
    end

    # GET /admin/products/low_stock
    def low_stock
      threshold = params[:threshold]&.to_i || 5
      products  = Product.active.where("stock_quantity <= ?", threshold).order(:stock_quantity)
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

    def product_params
      params.require(:product).permit(
        :name, :description, :price, :category, :class_level,
        :subject, :stock_quantity, :active, :badge, :sort_order
      )
    end

    def attach_image(product)
      product.image.attach(params[:product][:image])
    end
  end
end
