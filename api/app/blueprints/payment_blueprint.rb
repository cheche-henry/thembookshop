class PaymentBlueprint < Blueprinter::Base
  identifier :id

  fields :method, :status, :amount, :phone_number,
         :merchant_request_id, :checkout_request_id,
         :mpesa_receipt_number, :mpesa_transaction_id,
         :result_code, :result_desc, :mpesa_transaction_date, :created_at
end
