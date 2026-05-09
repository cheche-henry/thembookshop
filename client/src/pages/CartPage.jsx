import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import CartItem from '../components/CartItem'
import { EmptyCart } from '../components/EmptyState'
import { formatKES } from '../utils/format'

const DELIVERY_THRESHOLD = 2000
const DELIVERY_FEE = 200

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="section-title mb-8">My Cart</h1>
      <EmptyCart />
    </div>
  )

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">
          My Cart <span className="text-gray-400 font-normal text-xl">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors font-display font-semibold"
        >
          <Trash2 className="w-4 h-4" /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => <CartItem key={item.id} item={item} />)}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl2 shadow-card p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg text-gray-800 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1 flex-1 pr-2">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-gray-800 flex-shrink-0">{formatKES(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatKES(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-brand-600 font-semibold' : 'font-semibold'}>
                  {deliveryFee === 0 ? 'FREE' : formatKES(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-gray-400">
                  Add {formatKES(DELIVERY_THRESHOLD - subtotal)} more for free delivery
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center mb-6">
              <span className="font-display font-bold text-gray-800">Total</span>
              <span className="font-display font-bold text-xl text-brand-600">{formatKES(total)}</span>
            </div>

            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold py-3.5 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md text-base"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop" className="block text-center text-sm text-brand-600 hover:text-brand-800 mt-3 font-display font-semibold">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
