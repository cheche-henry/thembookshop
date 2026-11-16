# Allowed browser origins for the storefront and admin SPA.
origins = [ENV["CORS_ORIGINS"], ENV["FRONTEND_URL"]]
          .compact
          .join(",")
          .split(",")
          .map(&:strip)
          .reject(&:blank?)
          .uniq
origins = ["http://localhost:5173"] if origins.empty?

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*origins)
    resource "/api/*",   headers: :any, methods: %i[get post put patch delete options head], credentials: false
    resource "/admin/*", headers: :any, methods: %i[get post put patch delete options head], credentials: false
  end
end
