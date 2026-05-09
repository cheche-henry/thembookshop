ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)
require "bundler/setup"
require "dotenv/load" if %w[development test].include?(ENV["RAILS_ENV"])
