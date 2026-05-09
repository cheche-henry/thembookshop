# Thin wrapper around the jwt gem
# Usage:
#   token = JsonWebToken.encode({ admin_user_id: 1 })
#   payload = JsonWebToken.decode(token)  # => { "admin_user_id" => 1 }

module JsonWebToken
  SECRET      = ENV.fetch("JWT_SECRET") { raise "JWT_SECRET env var is not set!" }
  EXPIRY_HRS  = ENV.fetch("JWT_EXPIRY_HOURS", 24).to_i
  ALGORITHM   = "HS256".freeze

  class DecodeError < StandardError; end
  class ExpiredToken < DecodeError; end

  def self.encode(payload, exp: EXPIRY_HRS.hours.from_now)
    payload = payload.merge(exp: exp.to_i, iat: Time.current.to_i)
    JWT.encode(payload, SECRET, ALGORITHM)
  end

  def self.decode(token)
    options = { algorithms: [ALGORITHM], verify_expiration: true }
    decoded = JWT.decode(token, SECRET, true, options)
    HashWithIndifferentAccess.new(decoded.first)
  rescue JWT::ExpiredSignature
    raise ExpiredToken, "Token has expired"
  rescue JWT::DecodeError => e
    raise DecodeError, "Invalid token: #{e.message}"
  end
end
