module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product, only: [:show]

      # GET /api/v1/products
      def index
        products = Product.active
                          .by_category(params[:category])
                          .by_level(params[:class_level])
                          .by_subject(params[:subject])
                          .search(params[:q])
                          .ordered
                          .page(params[:page])
                          .per(params[:per_page] || 24)

        render_success(
          ProductBlueprint.render_as_hash(products, view: :list, host: request.base_url),
          meta: pagination_meta(products)
        )
      end

      # GET /api/v1/products/:id
      def show
        render_success(ProductBlueprint.render_as_hash(@product, host: request.base_url))
      end

      private

      def set_product
        @product = Product.active.find(params[:id])
      end
    end
  end
end
