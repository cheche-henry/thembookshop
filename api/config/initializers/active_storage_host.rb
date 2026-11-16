# APP_HOST must be the public base URL of the API (with scheme).
app_url = ENV.fetch("APP_HOST", "http://localhost:3000").to_s.strip
app_url = "https://#{app_url}" unless app_url.match?(%r{\Ahttps?://}i)
uri = URI.parse(app_url)

Rails.application.config.x.app_host = app_url

Rails.application.routes.default_url_options[:host]     = uri.host
Rails.application.routes.default_url_options[:protocol] = uri.scheme
Rails.application.routes.default_url_options[:port] = uri.port if uri.port && ![80, 443].include?(uri.port)
