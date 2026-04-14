module Api
  module V1
    class ProductsController < BaseController
      def index
        products = Product.all
        products = products.where(category: params[:category]) if params[:category].present?
        products = products.where(class_level: params[:class_level]) if params[:class_level].present?
        products = products.where('name ILIKE ?', "%#{params[:q]}%") if params[:q].present?
        
        render json: products, status: :ok
      end

      def show
        render json: Product.find(params[:id]), status: :ok
      end
    end
  end
end