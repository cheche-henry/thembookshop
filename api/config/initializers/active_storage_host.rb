Rails.application.routes.default_url_options[:host] = ENV.fetch("APP_HOST", "http://localhost:3000")
