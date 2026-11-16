class PaymentBlueprint < Blueprinter::Base
  identifier :id

  # Daraja request identifiers are deliberately excluded from the public view:
  # they are the key used by the callback endpoint, so exposing them would let
  # a customer forge a payment confirmation.
  view :public do
    fields :method, :status, :amount, :mpesa_receipt_number,
           :result_code, :result_desc, :created_at
  end

  view :admin do
    fields :method, :status, :amount, :phone_number,
           :merchant_request_id, :checkout_request_id,
           :mpesa_receipt_number, :mpesa_transaction_id,
           :result_code, :result_desc, :mpesa_transaction_date, :created_at
  end
end
