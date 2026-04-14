module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

      before_action :authenticate_admin!

      attr_reader :current_admin

      private

      def authenticate_admin!
        header = request.headers['Authorization']

        if header.blank?
          return render json: { error: 'Missing token' }, status: :unauthorized
        end

        token = header.split(' ').last

        begin
          decoded = JsonWebToken.decode(token)
          @current_admin = AdminUser.find(decoded[:admin_id])
        rescue JWT::DecodeError, ActiveRecord::RecordNotFound
          render json: { error: 'Invalid token' }, status: :unauthorized
        end
      end

      def render_unprocessable_entity(exception)
        render json: { error: exception.message }, status: :unprocessable_entity
      end

      def render_not_found(_exception)
        render json: { error: 'Resource not found' }, status: :not_found
      end
    end
  end
end