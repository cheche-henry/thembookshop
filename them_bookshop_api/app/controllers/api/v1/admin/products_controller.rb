module Api
  module V1
    module Admin
      class ProductsController < BaseController
        include Authenticate

        def index
          render json: Product.all, status: :ok
        end

        def create
          product = Product.new(product_params)
          if product.save
            render json: product, status: :created
          else
            render json: { error: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          product = Product.find(params[:id])
          if product.update(product_params)
            render json: product, status: :ok
          else
            render json: { error: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          Product.find(params[:id]).destroy
          head :no_content
        end

        private

        def product_params
          params.require(:product).permit(:name, :description, :price, :category, :class_level, :subject, :stock_quantity, :image)
        end
      end
    end
  end
end