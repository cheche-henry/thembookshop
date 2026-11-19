module Api
  module V1
    class ProductsController < ApplicationController
      MAX_PER_PAGE = 100
      MAX_IDS      = 100

      before_action :set_product, only: [:show]

      # GET /api/v1/products
      def index
        products = Product.active
                          .with_attached_image
                          .by_ids(product_ids)
                          .by_category(params[:category])
                          .by_subcategory(params[:subcategory])
                          .by_level(params[:class_level])
                          .by_subject(params[:subject])
                          .by_subsubject(params[:subsubject])
                          .by_stage(params[:stage])
                          .search(params[:q])
                          .ordered
                          .page(params[:page])
                          .per(per_page)

        render_success(
          ProductBlueprint.render_as_hash(products, view: :list, host: request.base_url),
          meta: pagination_meta(products)
        )
      end

      # GET /api/v1/products/:id
      def show
        render_success(ProductBlueprint.render_as_hash(@product, host: request.base_url))
      end

      # GET /api/v1/products/facets
      # Nested counts for the storefront filter sidebar.
      def facets
        render_success(ProductFacets.new.as_json)
      end

      # GET /api/v1/products/meta
      # Static taxonomy + subject components, used by the admin form and any
      # client that wants to render filters from the server definition.
      def meta
        render_success(Product.catalogue_meta)
      end

      private

      def set_product
        @product = Product.active.with_attached_image.find(params[:id])
      end

      def per_page
        value = params[:per_page].to_i
        value = 24 unless value.positive?
        [value, MAX_PER_PAGE].min
      end

      def product_ids
        params[:ids].to_s.split(",").map(&:to_i).reject(&:zero?).uniq.first(MAX_IDS)
      end
    end
  end
end
