class OrderProcessingService
  attr_reader :order_params, :items_params

  def initialize(order_params, items_params)
    @order_params = order_params
    @items_params = items_params
  end

  def process
    ActiveRecord::Base.transaction do
      validate_stock!
      @order = Order.create!(order_params)
      create_items!
      deduct_stock!
      create_payment!
      initiate_mpese_push!
      send_emails!
      @order
    end
  rescue ActiveRecord::RecordInvalid => e
    { error: e.message }
  rescue => e
    { error: "Order processing failed: #{e.message}" }
  end

  private

  def validate_stock!
    items_params.each do |item|
      product = Product.find(item[:product_id])
      raise "Insufficient stock for #{product.name}" if product.stock_quantity < item[:quantity].to_i
    end
  end

  def create_items!
    items_params.each do |item|
      product = Product.find(item[:product_id])
      @order.order_items.create!(
        product_id: product.id,
        quantity: item[:quantity],
        price_at_purchase: product.price
      )
    end
  end

  def deduct_stock!
    @order.order_items.each do |order_item|
      order_item.product.decrement!(:stock_quantity, order_item.quantity)
    end
  end

  def create_payment!
    @order.create_payment!(
      phone_number: @order.phone_number,
      amount: @order.total_amount,
      status: 'pending'
    )
  end

  def initiate_mpese_push!
    MpesaService.new.initiate_stk_push(
      @order.phone_number,
      @order.total_amount,
      @order.id
    )
  end

  def send_emails!
    OrderConfirmationJob.perform_later(@order.id)
    AdminNotificationJob.perform_later(@order.id)
  end
end