class OrderCreator
  Result = Struct.new(:success?, :order, :errors, :replayed, keyword_init: true)

  # No delivery fee for now — free delivery on all orders
  DELIVERY_FEE = 0

  def self.call(order_params:, items_params:, idempotency_key: nil)
    new(order_params:, items_params:, idempotency_key:).call
  end

  def initialize(order_params:, items_params:, idempotency_key: nil)
    @order_params    = order_params.to_h.symbolize_keys
    @items_params    = items_params
    @idempotency_key = idempotency_key.presence
    @errors          = []
  end

  def call
    if @idempotency_key
      existing = find_existing_order
      return success(existing, replayed: true) if existing
    end

    ActiveRecord::Base.transaction do
      validate_items!
      build_order
      deduct_stock!
      @order.save!
    end

    success(@order, replayed: false)
  rescue ActiveRecord::RecordInvalid => e
    failure(e.message)
  rescue Product::InsufficientStockError, ValidationError => e
    failure(e.message)
  rescue ActiveRecord::RecordNotUnique
    # A concurrent request with the same idempotency key won the race.
    existing = find_existing_order
    return success(existing, replayed: true) if existing

    failure("This order could not be created because one of the items appears twice. Please refresh your cart and try again.")
  end

  private

  def success(order, replayed:)
    Result.new(success?: true, order:, errors: [], replayed:)
  end

  def failure(message)
    Result.new(success?: false, order: nil, errors: [message], replayed: false)
  end

  def find_existing_order
    return nil unless @idempotency_key

    Order.includes(:order_items, :payments).find_by(idempotency_key: @idempotency_key)
  end

  # The frontend sends the cart as-is; collapse duplicate product rows so the
  # unique (order_id, product_id) index cannot blow up the request.
  def grouped_items
    @grouped_items ||= @items_params.each_with_object({}) do |item, acc|
      product_id = item[:product_id].to_i
      quantity   = item[:quantity].to_i
      acc[product_id] = (acc[product_id] || 0) + quantity
    end
  end

  def validate_items!
    raise ValidationError, "Order must contain at least one item" if grouped_items.blank?

    @resolved_items = grouped_items.map do |product_id, quantity|
      product = Product.active.lock.find_by(id: product_id)

      raise ValidationError, "Product ##{product_id} not found or unavailable" unless product
      raise ValidationError, "Quantity for '#{product.name}' must be at least 1" unless quantity.positive?
      if product.stock_quantity < quantity
        raise Product::InsufficientStockError,
              "Insufficient stock for '#{product.name}'. Only #{product.stock_quantity} left."
      end

      { product:, quantity: }
    end
  end

  def build_order
    subtotal = @resolved_items.sum { |i| i[:product].price * i[:quantity] }

    @order = Order.new(
      **@order_params,
      idempotency_key: @idempotency_key,
      subtotal: subtotal,
      delivery_fee: DELIVERY_FEE,
      total_amount: subtotal + DELIVERY_FEE,
      status: "pending"
    )

    @resolved_items.each do |item|
      @order.order_items.build(
        product: item[:product],
        quantity: item[:quantity],
        unit_price: item[:product].price,
        total_price: item[:product].price * item[:quantity],
        product_name_snapshot: item[:product].name
      )
    end
  end

  def deduct_stock!
    @resolved_items.each { |i| i[:product].reduce_stock!(i[:quantity]) }
  end

  class ValidationError < StandardError; end
end
