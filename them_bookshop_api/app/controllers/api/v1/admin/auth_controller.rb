module Api
  module V1
    module Admin
      class AuthController < BaseController
        skip_before_action :authenticate_admin!, only: [:login]

        def login
          admin = AdminUser.find_by(email: params[:email])
          
          if admin&.authenticate(params[:password])
            token = JsonWebToken.encode(admin_id: admin.id)
            render json: { token:, admin: { id: admin.id, email: admin.email } }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end
      end
    end
  end
end