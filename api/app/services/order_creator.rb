class OrderCreator
  Result = Struct.new(:success?, :order, :errors, keyword_init: true)

  # No delivery fee for now — free delivery on all orders
  DELIVERY_FEE = 0

  def self.call(order_params:, items_params:)
    new(order_params:, items_params:).call
  end

  def initialize(order_params:, items_params:)
    @order_params = order_params.to_h.symbolize_keys
    @items_params = items_params
    @errors       = []
  end

  def call
    ActiveRecord::Base.transaction do
      validate_items!
      build_order
      deduct_stock!
      @order.save!
    end
    Result.new(success?: true, order: @order, errors: [])
  rescue ActiveRecord::RecordInvalid => e
    Result.new(success?: false, order: nil, errors: [e.message])
  rescue Product::InsufficientStockError, ValidationError => e
    Result.new(success?: false, order: nil, errors: [e.message])
  end

  private

  def validate_items!
    raise ValidationError, "Order must contain at least one item" if @items_params.blank?

    @resolved_items = @items_params.map do |item|
      product  = Product.active.lock.find_by(id: item[:product_id])
      quantity = item[:quantity].to_i

      raise ValidationError, "Product ##{item[:product_id]} not found or unavailable" unless product
      raise ValidationError, "Quantity for '#{product.name}' must be at least 1" unless quantity.positive?
      raise Product::InsufficientStockError, "Insufficient stock for '#{product.name}'. Only #{product.stock_quantity} left." if product.stock_quantity < quantity

      { product:, quantity: }
    end
  end

  def build_order
    subtotal = @resolved_items.sum { |i| i[:product].price * i[:quantity] }

    @order = Order.new(
      **@order_params,
      subtotal:     subtotal,
      delivery_fee: DELIVERY_FEE,
      total_amount: subtotal + DELIVERY_FEE,
      status:       "pending",
    )

    @resolved_items.each do |item|
      @order.order_items.build(
        product:               item[:product],
        quantity:              item[:quantity],
        unit_price:            item[:product].price,
        total_price:           item[:product].price * item[:quantity],
        product_name_snapshot: item[:product].name,
      )
    end
  end

  def deduct_stock!
    @resolved_items.each { |i| i[:product].reduce_stock!(i[:quantity]) }
  end

  class ValidationError < StandardError; end
end
