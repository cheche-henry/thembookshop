module Admin
  class AuthController < ApplicationController
    before_action :authenticate_admin!, only: %i[me update_credentials]
    before_action -> { rate_limit!("admin-login", limit: 5, period: 1.minute) }, only: :login

    # POST /admin/auth/login
    def login
      admin = AdminUser.active.find_by(email: params[:email]&.downcase&.strip)

      if admin&.authenticate(params[:password])
        admin.record_login!(ip: request.remote_ip)
        token = JsonWebToken.encode({ admin_user_id: admin.id, email: admin.email })
        render_success(
          {
            token:,
            expires_in: "#{JsonWebToken::EXPIRY_HRS} hours",
            admin: {
              id: admin.id,
              name: admin.name,
              email: admin.email
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
        id: current_admin.id,
        name: current_admin.name,
        email: current_admin.email,
        phone: current_admin.phone,
        last_login_at: current_admin.last_login_at
      )
    end

    # PATCH /admin/auth/credentials
    # Change email and/or password. Both require the current password.
    def update_credentials
      admin     = current_admin
      permitted = params.permit(:name, :email, :phone, :password, :current_password)

      changing_email    = permitted[:email].present? && permitted[:email].downcase.strip != admin.email
      changing_password = permitted[:password].present?

      if (changing_email || changing_password) && !admin.authenticate(permitted[:current_password].to_s)
        return render_error("Current password is incorrect", status: :unprocessable_entity)
      end

      if changing_password && permitted[:password].to_s.length < 8
        return render_error("Password must be at least 8 characters", status: :unprocessable_entity)
      end

      if admin.update(permitted.except(:current_password))
        render_success({ message: "Credentials updated successfully" })
      else
        render_error("Update failed", errors: admin.errors.full_messages)
      end
    end
  end
end
