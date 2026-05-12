import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Trash2, Smartphone } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import CartItem from '../components/CartItem'
import { EmptyCart } from '../components/EmptyState'
import { formatKES } from '../utils/format'

export default function CartPage() {
  const items     = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total     = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8" style={{fontFamily:'Nunito,sans-serif'}}>My Cart</h1>
      <EmptyCart />
    </div>
  )

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>
          My Cart <span className="text-gray-400 font-normal text-xl">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors font-semibold"
          style={{fontFamily:'Nunito,sans-serif'}}
        >
          <Trash2 className="w-4 h-4" /> Clear all
        </button>
      </div>

      {/* M-Pesa payment notice — prominent */}
      <div className="bg-green-600 text-white rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Smartphone className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm" style={{fontFamily:'Nunito,sans-serif'}}>Payment via M-Pesa is required to confirm your order</p>
          <p className="text-green-100 text-xs mt-0.5">
            Once you checkout, you'll receive an M-Pesa STK push on your phone. Your order is only confirmed after payment is completed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => <CartItem key={item.id} item={item} />)}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-800 mb-5" style={{fontFamily:'Nunito,sans-serif'}}>Order Summary</h2>

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
                <span className="font-semibold">{formatKES(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center mb-5">
              <span className="font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>Total</span>
              <span className="font-bold text-xl text-green-600" style={{fontFamily:'Nunito,sans-serif'}}>{formatKES(total)}</span>
            </div>

            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md text-base"
              style={{fontFamily:'Nunito,sans-serif'}}
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            {/* What happens next */}
            <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-600 mb-1.5">What happens next:</p>
              <p>1️⃣ Fill in your delivery details</p>
              <p>2️⃣ Receive M-Pesa prompt on your phone</p>
              <p>3️⃣ Enter PIN to pay</p>
              <p>4️⃣ Order confirmed instantly ✅</p>
            </div>

            <Link to="/shop" className="block text-center text-sm text-green-600 hover:text-green-800 mt-3 font-semibold" style={{fontFamily:'Nunito,sans-serif'}}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
