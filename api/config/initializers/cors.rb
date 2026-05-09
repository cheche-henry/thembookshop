Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("CORS_ORIGINS", "http://localhost:5173,http://localhost:3001").split(",").map(&:strip)
    resource "/api/*",   headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head], credentials: false
    resource "/admin/*", headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head], credentials: false
    resource "/api/v1/payments/callback", headers: :any, methods: [:post, :options]
  end
end
