require "active_support/core_ext/integer/time"
Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.active_storage.service = :amazon
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: ENV.fetch("SMTP_HOST"),
    port: ENV.fetch("SMTP_PORT", 587).to_i,
    user_name: ENV["SMTP_USERNAME"],
    password: ENV["SMTP_PASSWORD"],
    authentication: :plain,
    enable_starttls_auto: true,
  }
  config.action_mailer.default_url_options = { host: ENV["APP_HOST"] }
  config.force_ssl = true
  config.log_level = ENV.fetch("LOG_LEVEL", "info").to_sym
end
