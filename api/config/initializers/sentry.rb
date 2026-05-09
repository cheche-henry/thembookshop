if ENV["SENTRY_DSN"].present?
  Sentry.init do |config|
    config.dsn                = ENV["SENTRY_DSN"]
    config.traces_sample_rate = ENV.fetch("SENTRY_TRACES_SAMPLE_RATE", 0.2).to_f
    config.environment        = Rails.env
    config.send_default_pii   = false
  end
end
