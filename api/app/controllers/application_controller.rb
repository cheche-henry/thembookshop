class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods

  # ── Error handling ────────────────────────────────────────────────────────
  rescue_from StandardError,                       with: :handle_internal_error
  rescue_from ActiveRecord::RecordNotFound,        with: :handle_not_found
  rescue_from ActiveRecord::RecordInvalid,         with: :handle_unprocessable
  rescue_from ActionController::ParameterMissing,  with: :handle_bad_request
  rescue_from Order::InvalidTransitionError,       with: :handle_unprocessable
  rescue_from Product::InsufficientStockError,     with: :handle_unprocessable
  rescue_from JsonWebToken::DecodeError,           with: :handle_unauthorized
  rescue_from JsonWebToken::ExpiredToken,          with: :handle_token_expired

  private

  # ── Auth helpers ──────────────────────────────────────────────────────────
  def authenticate_admin!
    token   = extract_bearer_token
    payload = JsonWebToken.decode(token)
    @current_admin = AdminUser.active.find_by(id: payload[:admin_user_id])
    render_unauthorized("Admin account not found or inactive") unless @current_admin
  rescue JsonWebToken::DecodeError, JsonWebToken::ExpiredToken => e
    render_unauthorized(e.message)
  end

  def current_admin
    @current_admin
  end

  def extract_bearer_token
    header = request.headers["Authorization"]
    raise JsonWebToken::DecodeError, "Authorization header missing" unless header
    header.split(" ").last
  end

  # ── Response helpers ──────────────────────────────────────────────────────
  def render_success(data, message: nil, status: :ok, meta: nil)
    payload = { success: true, data: }
    payload[:message] = message if message.present?
    payload[:meta]    = meta    if meta.present?
    render json: payload, status:
  end

  def render_created(data, message: "Created successfully")
    render_success(data, message:, status: :created)
  end

  def render_error(message, status: :unprocessable_entity, errors: nil)
    payload = { success: false, message: }
    payload[:errors] = errors if errors.present?
    render json: payload, status:
  end

  def render_unauthorized(message = "Unauthorized")
    render_error(message, status: :unauthorized)
  end

  def render_not_found(message = "Resource not found")
    render_error(message, status: :not_found)
  end

  # ── Error handlers ────────────────────────────────────────────────────────
  def handle_not_found(e)
    render_not_found(e.message)
  end

  def handle_unprocessable(e)
    render_error(e.message, status: :unprocessable_entity)
  end

  def handle_bad_request(e)
    render_error("Missing parameter: #{e.param}", status: :bad_request)
  end

  def handle_unauthorized(e)
    render_unauthorized(e.message)
  end

  def handle_token_expired(_e)
    render_error("Token has expired, please log in again", status: :unauthorized)
  end

  def handle_internal_error(e)
    Rails.logger.error "[500] #{e.class}: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}"
    Sentry.capture_exception(e) if defined?(Sentry)
    render_error("An unexpected error occurred. Please try again.", status: :internal_server_error)
  end

  # ── Pagination helpers ────────────────────────────────────────────────────
  def pagination_meta(collection)
    {
      current_page:  collection.current_page,
      total_pages:   collection.total_pages,
      total_count:   collection.total_count,
      per_page:      collection.limit_value,
    }
  end
end
