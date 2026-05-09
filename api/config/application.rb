require_relative "boot"
require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module ThemBookshopApi
  class Application < Rails::Application
    config.load_defaults 7.1

    # API-only mode
    config.api_only = true

    # CORS — configured in initializers/cors.rb
    config.middleware.insert_before 0, Rack::Cors

    # Active Job queue adapter
    config.active_job.queue_adapter = :sidekiq

    # Time zone — Nairobi
    config.time_zone = "Africa/Nairobi"
    config.active_record.default_timezone = :utc

    # Autoload paths
    config.autoload_paths += %W[#{config.root}/app/services #{config.root}/app/blueprints]

    # Custom config
    config.x.app_host = ENV.fetch("APP_HOST", "http://localhost:3000")

    # Logging
    config.log_level = ENV.fetch("LOG_LEVEL", "info").to_sym
  end
end
