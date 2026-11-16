require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true

  # Uploads must survive redeploys. Set ACTIVE_STORAGE_SERVICE=amazon (S3/R2)
  # in production; the default keeps local disk for simple single-VM setups.
  config.active_storage.service = ENV.fetch("ACTIVE_STORAGE_SERVICE", "local").to_sym

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: ENV.fetch("SMTP_HOST"),
    port: ENV.fetch("SMTP_PORT", 587).to_i,
    user_name: ENV["SMTP_USERNAME"],
    password: ENV["SMTP_PASSWORD"],
    authentication: :plain,
    enable_starttls_auto: true
  }
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "https://thembookshop.co.ke") }
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_caching = false

  # Rate limiting uses the cache store, so shared Redis makes limits effective
  # across web workers.
  if ENV["REDIS_URL"].present?
    config.cache_store = :redis_cache_store, {
      url: ENV["REDIS_URL"],
      namespace: "them-bookshop",
      expires_in: 1.day
    }
  end

  config.force_ssl  = true
  config.assume_ssl = ENV.fetch("ASSUME_SSL", "true") == "true"

  # Never accept unauthenticated M-Pesa callbacks in production. Either the
  # shared token or a source-IP allowlist must be configured.
  if ENV["MPESA_CALLBACK_TOKEN"].blank? && ENV["MPESA_CALLBACK_IPS"].blank?
    raise "Set MPESA_CALLBACK_TOKEN (or MPESA_CALLBACK_IPS) before running in production"
  end

  config.log_level = ENV.fetch("LOG_LEVEL", "info").to_sym
  config.log_to_stdout = true
end
