module Admin
  class AuthController < ApplicationController
    before_action :authenticate_admin!, only: [:me, :update_credentials]

    # POST /admin/auth/login
    def login
      admin = AdminUser.active.find_by(email: params[:email]&.downcase&.strip)

      if admin&.authenticate(params[:password])
        admin.record_login!(ip: request.remote_ip)
        token = JsonWebToken.encode({ admin_user_id: admin.id, email: admin.email })
        render_success(
          {
            token:,
            expires_in: "#{ENV.fetch('JWT_EXPIRY_HOURS', 24)} hours",
            admin: {
              id:    admin.id,
              name:  admin.name,
              email: admin.email,
            }
          },
          message: "Welcome back, #{admin.display_name}!"
        )
      else
        sleep 0.5 # Slow down brute-force attempts
        render_unauthorized("Invalid email or password")
      end
    end

    # GET /admin/auth/me
    def me
      render_success(
        id:            current_admin.id,
        name:          current_admin.name,
        email:         current_admin.email,
        phone:         current_admin.phone,
        last_login_at: current_admin.last_login_at,
      )
    end

    # PATCH /admin/auth/credentials
    # Change email and/or password
    def update_credentials
      admin = current_admin
      permitted = params.permit(:name, :email, :phone, :password, :current_password)

      if permitted[:password].present?
        unless admin.authenticate(permitted.delete(:current_password))
          return render_error("Current password is incorrect", status: :unprocessable_entity)
        end
      end

      if admin.update(permitted.except(:current_password))
        render_success({ message: "Credentials updated successfully" })
      else
        render_error("Update failed", errors: admin.errors.full_messages)
      end
    end
  end
end
