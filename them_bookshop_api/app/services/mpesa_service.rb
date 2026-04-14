class MpesaService
  BASE_URL = {
    sandbox: 'https://sandbox.safaricom.co.ke',
    production: 'https://api.safaricom.co.ke'
  }.freeze

  def initialize
    @env = ENV['MPESA_ENVIRONMENT'] || 'sandbox'
    @base_url = BASE_URL[@env.to_sym]
  end

  def access_token
    credentials = Base64.strict_encode64("#{ENV['MPESA_CONSUMER_KEY']}:#{ENV['MPESA_CONSUMER_SECRET']}")
    response = HTTParty.get(
      "#{@base_url}/oauth/v1/generate?grant_type=client_credentials",
      headers: { Authorization: "Basic #{credentials}" }
    )
    response.parsed_response['access_token']
  end

  def initiate_stk_push(phone, amount, order_id, passkey = nil)
    timestamp = Time.now.strftime('%Y%m%d%H%M%S')
    passkey ||= ENV['MPESA_PASSKEY']
    password = Base64.strict_encode64("#{ENV['MPESA_SHORTCODE']}#{passkey}#{timestamp}")

    payload = {
      BusinessShortCode: ENV['MPESA_SHORTCODE'],
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount.to_i,
      PartyA: phone,
      PartyB: ENV['MPESA_SHORTCODE'],
      PhoneNumber: phone,
      CallBackURL: ENV['MPESA_CALLBACK_URL'],
      AccountReference: "TB-#{order_id}",
      TransactionDesc: "Them Bookshop Purchase"
    }

    HTTParty.post(
      "#{@base_url}/mpesa/stkpush/v1/processrequest",
      headers: { Authorization: "Bearer #{access_token}", 'Content-Type' => 'application/json' },
      body: payload.to_json
    )
  end

  def handle_callback(callback_data)
    # Extract M-Pesa response
    body = callback_data['Body']['stkCallback']
    result_code = body['ResultCode']
    
    if result_code == 0
      metadata = body['CallbackMetadata']['Item']
      transaction_id = metadata.find { |i| i['Name'] == 'MpesaReceiptNumber' }&.dig('Value')
      amount = metadata.find { |i| i['Name'] == 'Amount' }&.dig('Value')
      
      { success: true, transaction_id:, amount: }
    else
      { success: false, error: body['ResultDesc'] }
    end
  end
end