import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, User, ChevronRight, Info, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { formatKES } from '../utils/format'

// ============================================================
// CHECKOUT PAGE — UI ONLY
// TODO: Integrate M-Pesa STK Push API (Daraja) when backend is ready
// TODO: Send order to backend API on form submit
// ============================================================

const DELIVERY_FEE = 200
const DELIVERY_THRESHOLD = 2000

const deliveryLocations = [
  'Nairobi CBD', 'Westlands', 'Kasarani', 'Embakasi', 'Langata',
  'Kiambu', 'Thika', 'Kikuyu', 'Ruiru', 'Juja',
  'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri',
  'Machakos', 'Meru', 'Garissa', 'Kakamega', 'Other (specify in notes)',
]

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  const [form, setForm] = useState({
    fullName: '', phone: '', location: '', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Please enter your full name'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Please enter a valid Kenyan phone number'
    if (!form.location) e.location = 'Please select your delivery location'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    // TODO: Call M-Pesa STK Push API here
    setSubmitted(true)
    clearCart()
  }

  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center page-enter">
        <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500 mb-4 font-display font-semibold">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Browse the Shop</Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center page-enter">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-2">
          Thank you, <strong>{form.fullName}</strong>! Your order has been received.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          We'll send an M-Pesa payment prompt to <strong>{form.phone}</strong>. Please complete the payment within 5 minutes.
        </p>
        <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-700 font-display mb-6">
          Delivery to <strong>{form.location}</strong> — we'll contact you to confirm.
        </div>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title mb-2">Checkout</h1>
      <p className="text-gray-500 text-sm mb-8">Fill in your details and pay via M-Pesa</p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl2 shadow-card p-6">
              <h2 className="font-display font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-500" /> Your Details
              </h2>

              <div className="space-y-4">
                <Field
                  label="Full Name"
                  error={errors.fullName}
                  icon={<User className="w-4 h-4" />}
                >
                  <input
                    className={`input ${errors.fullName ? 'border-red-300 ring-red-200' : ''}`}
                    placeholder="e.g. Jane Muthoni Kamau"
                    value={form.fullName}
                    onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setErrors({ ...errors, fullName: '' }) }}
                  />
                </Field>

                <Field
                  label="M-Pesa Phone Number"
                  error={errors.phone}
                  hint="The number that will receive the payment prompt"
                  icon={<Phone className="w-4 h-4" />}
                >
                  <input
                    className={`input ${errors.phone ? 'border-red-300 ring-red-200' : ''}`}
                    placeholder="e.g. 0712 345 678"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }) }}
                  />
                </Field>

                <Field
                  label="Delivery Location"
                  error={errors.location}
                  icon={<MapPin className="w-4 h-4" />}
                >
                  <select
                    className={`input ${errors.location ? 'border-red-300 ring-red-200' : ''}`}
                    value={form.location}
                    onChange={(e) => { setForm({ ...form, location: e.target.value }); setErrors({ ...errors, location: '' }) }}
                  >
                    <option value="">— Select your town / area —</option>
                    {deliveryLocations.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Notes / Instructions (optional)">
                  <textarea
                    className="input resize-none h-24 text-sm"
                    placeholder="Any special delivery instructions, school name, etc."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            {/* M-Pesa Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <p className="font-display font-bold text-green-800 text-sm mb-1">Pay with M-Pesa</p>
                <p className="text-green-700 text-xs leading-relaxed">
                  After placing your order, you'll receive an M-Pesa STK push to the phone number above. Enter your PIN to complete payment. Your order is confirmed once payment is received.
                </p>
                {/* TODO: Integrate Safaricom Daraja STK Push API */}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl2 shadow-card p-6 sticky top-24">
              <h2 className="font-display font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm mb-4 max-h-52 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-700 text-xs leading-snug line-clamp-1">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-700 font-semibold text-xs flex-shrink-0">{formatKES(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-brand-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatKES(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center mb-5">
                <span className="font-display font-bold">Total</span>
                <span className="font-display font-bold text-xl text-brand-600">{formatKES(total)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-display font-bold py-4 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-base active:scale-95"
              >
                📱 Pay with M-Pesa
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                {formatKES(total)} will be requested via M-Pesa
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, error, hint, icon }) {
  return (
    <div>
      <label className="block font-display font-semibold text-sm text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 font-display">{error}</p>}
    </div>
  )
}
