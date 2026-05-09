require "active_support/core_ext/integer/time"
Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.active_storage.service = :local
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: ENV.fetch("SMTP_HOST", "smtp.gmail.com"),
    port: ENV.fetch("SMTP_PORT", 587).to_i,
    user_name: ENV["SMTP_USERNAME"],
    password: ENV["SMTP_PASSWORD"],
    authentication: :plain,
    enable_starttls_auto: true,
  }
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "http://localhost:3000") }
  config.action_mailer.raise_delivery_errors = true
  config.log_level = :debug
  config.hosts << "starlight-lazy-arbitrary.ngrok-free.dev"
end
