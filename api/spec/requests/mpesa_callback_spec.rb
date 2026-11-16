require "rails_helper"

RSpec.describe "M-Pesa callback", type: :request do
  let(:product) { create(:product, stock_quantity: 10, price: 500) }
  let(:order)   { create(:order, status: "payment_initiated", subtotal: 1000, total_amount: 1000) }
  let(:payment) { create(:payment, order: order, amount: 1000, status: "initiated", checkout_request_id: "ws_CO_123456") }

  let(:token) { "test-callback-token" }

  before do
    create(:order_item, order: order, product: product, quantity: 2, unit_price: 500, total_price: 1000)
    payment
  end

  around do |example|
    previous_token = ENV["MPESA_CALLBACK_TOKEN"]
    previous_ips   = ENV["MPESA_CALLBACK_IPS"]
    ENV["MPESA_CALLBACK_TOKEN"] = token
    ENV["MPESA_CALLBACK_IPS"]   = nil
    example.run
  ensure
    ENV["MPESA_CALLBACK_TOKEN"] = previous_token
    ENV["MPESA_CALLBACK_IPS"]   = previous_ips
  end

  def callback_payload(result_code: 0, amount: 1000, receipt: "QK123ABC")
    {
      Body: {
        stkCallback: {
          MerchantRequestID: "merchant-1",
          CheckoutRequestID: payment.checkout_request_id,
          ResultCode: result_code,
          ResultDesc: result_code.zero? ? "The service request is processed successfully." : "Request cancelled by user",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: amount },
              { Name: "MpesaReceiptNumber", Value: receipt },
              { Name: "TransactionDate", Value: "20261116120000" },
              { Name: "PhoneNumber", Value: 254_712_345_678 }
            ]
          }
        }
      }
    }.to_json
  end

  def post_callback(payload, query: {})
    headers = { "CONTENT_TYPE" => "application/json" }
    headers["X-Callback-Token"] = token unless query.key?(:token)

    post "/api/v1/payments/callback", params: payload, headers: headers
  end

  it "rejects callbacks without the shared token" do
    post "/api/v1/payments/callback",
         params: callback_payload,
         headers: { "CONTENT_TYPE" => "application/json" }

    expect(response).to have_http_status(:unauthorized)
    expect(payment.reload.status).to eq("initiated")
    expect(order.reload.status).to eq("payment_initiated")
  end

  it "rejects callbacks with the wrong shared token" do
    post "/api/v1/payments/callback",
         params: callback_payload,
         headers: { "CONTENT_TYPE" => "application/json", "X-Callback-Token" => "wrong" }

    expect(response).to have_http_status(:unauthorized)
    expect(payment.reload.status).to eq("initiated")
  end

  it "accepts a valid callback, completes the payment and marks the order paid" do
    headers = { "CONTENT_TYPE" => "application/json", "X-Callback-Token" => token }
    post "/api/v1/payments/callback", params: callback_payload, headers: headers

    expect(response).to have_http_status(:ok)
    expect(payment.reload.status).to eq("completed")
    expect(payment.mpesa_receipt_number).to eq("QK123ABC")
    expect(order.reload.status).to eq("paid")
    expect(product.reload.stock_quantity).to eq(10)
  end

  it "marks the payment failed and restores stock when the amount does not match" do
    headers = { "CONTENT_TYPE" => "application/json", "X-Callback-Token" => token }
    post "/api/v1/payments/callback", params: callback_payload(amount: 10), headers: headers

    expect(response).to have_http_status(:ok)
    expect(payment.reload.status).to eq("failed")
    expect(order.reload.status).to eq("failed")
    expect(order.stock_restored).to be(true)
    expect(product.reload.stock_quantity).to eq(12)
  end

  it "acknowledges unknown checkout request ids without changing anything" do
    headers = { "CONTENT_TYPE" => "application/json", "X-Callback-Token" => token }
    payload = JSON.parse(callback_payload).merge(
      "Body" => { "stkCallback" => { "CheckoutRequestID" => "ws_CO_UNKNOWN", "ResultCode" => 0 } }
    )

    post "/api/v1/payments/callback", params: payload.to_json, headers: headers

    expect(response).to have_http_status(:ok)
    expect(payment.reload.status).to eq("initiated")
  end

  it "is idempotent when Safaricom retries the same callback" do
    headers = { "CONTENT_TYPE" => "application/json", "X-Callback-Token" => token }
    2.times { post "/api/v1/payments/callback", params: callback_payload, headers: headers }

    expect(response).to have_http_status(:ok)
    expect(payment.reload.status).to eq("completed")
    expect(order.reload.status).to eq("paid")
  end

  context "when MPESA_CALLBACK_IPS is configured" do
    around do |example|
      previous = ENV["MPESA_CALLBACK_IPS"]
      ENV["MPESA_CALLBACK_IPS"] = "203.0.113.10"
      example.run
    ensure
      ENV["MPESA_CALLBACK_IPS"] = previous
    end

    it "rejects requests from other addresses" do
      headers = { "CONTENT_TYPE" => "application/json", "X-Callback-Token" => token }
      post "/api/v1/payments/callback", params: callback_payload, headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(payment.reload.status).to eq("initiated")
    end
  end
end
