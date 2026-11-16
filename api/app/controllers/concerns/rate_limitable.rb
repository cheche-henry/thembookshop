# Simple cache-backed rate limiting. Used on unauthenticated endpoints that
# cost money (STK pushes) or are brute-force targets (admin login).
module RateLimitable
  extend ActiveSupport::Concern

  private

  def rate_limit!(bucket, limit:, period:)
    key = "rate_limit:#{bucket}:#{request.remote_ip}"

    count = Rails.cache.increment(key, 1, expires_in: period)
    if count.nil?
      Rails.cache.write(key, 1, expires_in: period)
      count = 1
    end

    return if count <= limit

    response.headers["Retry-After"] = period.to_i.to_s
    render_error("Too many requests. Please try again in a moment.", status: :too_many_requests)
  end
end
