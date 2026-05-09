# ============================================================
# MpesaService — Safaricom Daraja API (STK Push / Lipa Na M-Pesa)
#
# TODO (production):
#   - Set MPESA_ENV=production in your .env
#   - Replace sandbox credentials with live ones from developer.safaricom.co.ke
#   - Whitelist your callback URL in the Daraja portal
# ============================================================

require "faraday"
require "faraday/retry"
require "base64"

class MpesaService
  SANDBOX_URL    = "https://sandbox.safaricom.co.ke".freeze
  PRODUCTION_URL = "https://api.safaricom.co.ke".freeze

  def initialize
    @consumer_key    = ENV.fetch("MPESA_CONSUMER_KEY")
    @consumer_secret = ENV.fetch("MPESA_CONSUMER_SECRET")
    @shortcode       = ENV.fetch("MPESA_SHORTCODE")
    @passkey         = ENV.fetch("MPESA_PASSKEY")
    @callback_url    = ENV.fetch("MPESA_CALLBACK_URL")
    @env             = ENV.fetch("MPESA_ENV", "sandbox")
    @base_url        = @env == "production" ? PRODUCTION_URL : SANDBOX_URL
  end

  # ── Public API ────────────────────────────────────────────────────────────

  # Initiates an STK Push (Lipa Na M-Pesa prompt on the customer's phone)
  # Returns the raw Daraja response hash, or raises MpesaError
  def initiate_stk_push(phone:, amount:, order_reference:, description: nil)
    token      = fetch_access_token
    timestamp  = Time.current.strftime("%Y%m%d%H%M%S")
    password   = generate_password(timestamp)
    amount_int = amount.ceil.to_i  # M-Pesa only accepts whole KES

    body = {
      BusinessShortCode: @shortcode,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   "CustomerPayBillOnline",
      Amount:            amount_int,
      PartyA:            phone,
      PartyB:            @shortcode,
      PhoneNumber:       phone,
      CallBackURL:       @callback_url,
      AccountReference:  order_reference,
      TransactionDesc:   description || "Them Bookshop order #{order_reference}",
    }

    response = connection(token).post("/mpesa/stkpush/v1/processrequest", body.to_json)
    parsed   = JSON.parse(response.body)

    raise MpesaError, parsed["errorMessage"] || "STK Push failed" if response.status != 200
    raise MpesaError, parsed["ResponseDescription"] if parsed["ResponseCode"] != "0"

    parsed
  rescue Faraday::Error => e
    raise MpesaError, "Network error: #{e.message}"
  end

  # Check STK Push transaction status (polling fallback)
  def query_stk_status(checkout_request_id)
    token     = fetch_access_token
    timestamp = Time.current.strftime("%Y%m%d%H%M%S")

    body = {
      BusinessShortCode: @shortcode,
      Password:          generate_password(timestamp),
      Timestamp:         timestamp,
      CheckoutRequestID: checkout_request_id,
    }

    response = connection(token).post("/mpesa/stkpushquery/v1/query", body.to_json)
    JSON.parse(response.body)
  rescue Faraday::Error => e
    raise MpesaError, "Network error: #{e.message}"
  end

  # ── Private helpers ───────────────────────────────────────────────────────
  private

  def fetch_access_token
    credentials = Base64.strict_encode64("#{@consumer_key}:#{@consumer_secret}")
    conn = Faraday.new(url: @base_url) do |f|
      f.request  :retry, max: 2
      f.response :raise_error
    end

    response = conn.get("/oauth/v1/generate?grant_type=client_credentials") do |req|
      req.headers["Authorization"] = "Basic #{credentials}"
    end

    parsed = JSON.parse(response.body)
    raise MpesaError, "Could not get M-Pesa access token" unless parsed["access_token"]

    parsed["access_token"]
  rescue Faraday::Error => e
    raise MpesaError, "Auth network error: #{e.message}"
  end

  def generate_password(timestamp)
    raw = "#{@shortcode}#{@passkey}#{timestamp}"
    Base64.strict_encode64(raw)
  end

  def connection(access_token)
    Faraday.new(url: @base_url) do |f|
      f.request  :retry, max: 2
      f.headers["Content-Type"]  = "application/json"
      f.headers["Authorization"] = "Bearer #{access_token}"
      f.response :raise_error
    end
  end

  class MpesaError < StandardError; end
end
