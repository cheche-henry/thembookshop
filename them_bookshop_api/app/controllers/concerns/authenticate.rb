module Authenticate
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_admin!
  end

  private

  def authenticate_admin!
    token = request.headers['Authorization']&.split(' ')&.last
    decoded = JsonWebToken.decode(token)
    
    if decoded && (admin = AdminUser.find_by(id: decoded[:admin_id]))
      @current_admin = admin
    else
      render json: { error: 'Unauthorized. Admin login required.' }, status: :unauthorized
    end
  end
end