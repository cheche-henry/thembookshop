import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, MapPin, User, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { formatKES } from '../utils/format'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const DELIVERY_THRESHOLD = 2000
const DELIVERY_FEE = 200

const LOCATIONS = [
  'Nairobi CBD','Westlands','Kasarani','Embakasi','Langata','Kiambu','Thika',
  'Kikuyu','Ruiru','Juja','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri',
  'Machakos','Meru','Garissa','Kakamega','Other (specify in notes)',
]

export default function CheckoutPage() {
  const items      = useCartStore((s) => s.items)
  const clearCart  = useCartStore((s) => s.clearCart)
  const navigate   = useNavigate()
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total      = subtotal + deliveryFee

  const [form, setForm]       = useState({ fullName:'', phone:'', email:'', location:'', notes:'' })
  const [errors, setErrors]   = useState({})
  const [submitting, setSub]  = useState(false)
  const [apiError, setApiErr] = useState('')
  const [order, setOrder]     = useState(null)  // set on success

  if (items.length === 0 && !order) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center page-enter">
      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500 mb-4 font-semibold">Your cart is empty.</p>
      <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">Browse the Shop</Link>
    </div>
  )

  if (order) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center page-enter">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="font-bold text-2xl text-gray-800 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>Order Placed!</h2>
      <p className="text-gray-500 mb-2">
        Thank you, <strong>{form.fullName}</strong>! Your order <strong className="text-green-600">{order.reference}</strong> has been received.
      </p>
      <p className="text-sm text-gray-400 mb-6">
        You'll receive an M-Pesa payment prompt on <strong>{form.phone}</strong> shortly. Enter your PIN to complete payment.
      </p>
      {order.mpesa_message && (
        <div className={`flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl mb-6 ${
          order.mpesa_sent ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {order.mpesa_sent ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {order.mpesa_message}
        </div>
      )}
      <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700 mb-6" style={{fontFamily:'Nunito,sans-serif'}}>
        Delivery to <strong>{form.location}</strong> — we'll contact you to confirm.
      </div>
      <Link to="/" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">Back to Home</Link>
    </div>
  )

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())  e.fullName = 'Full name is required'
    if (!form.phone.trim())     e.phone = 'Phone number is required'
    else if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(form.phone.replace(/\s/g,'')))
      e.phone = 'Enter a valid Kenyan phone number (e.g. 0712345678)'
    if (!form.location)         e.location = 'Please select your delivery location'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSub(true)
    setApiErr('')
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            customer_name:     form.fullName,
            customer_phone:    form.phone,
            customer_email:    form.email,
            delivery_address:  form.location,
            delivery_location: form.location,
            notes:             form.notes,
            items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
          }
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Order failed')

      clearCart()
      setOrder({ ...data.data.order, mpesa_sent: data.data.mpesa_sent, mpesa_message: data.data.mpesa_message })
    } catch (err) {
      setApiErr(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSub(false)
    }
  }

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>Checkout</h1>
      <p className="text-gray-500 text-sm mb-8">Fill in your details and pay via M-Pesa</p>

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2" style={{fontFamily:'Nunito,sans-serif'}}>
                <User className="w-4 h-4 text-green-600" /> Your Details
              </h2>
              <div className="space-y-4">
                <Field label="Full Name" error={errors.fullName}>
                  <input className={`w-full border rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ${errors.fullName ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="e.g. Jane Muthoni Kamau" value={form.fullName}
                    onChange={e => { setForm({...form, fullName: e.target.value}); setErrors({...errors, fullName:''}) }} />
                </Field>
                <Field label="M-Pesa Phone Number" error={errors.phone} hint="The number that will receive the payment prompt">
                  <input className={`w-full border rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="e.g. 0712 345 678" type="tel" value={form.phone}
                    onChange={e => { setForm({...form, phone: e.target.value}); setErrors({...errors, phone:''}) }} />
                </Field>
                <Field label="Email Address (optional)" hint="We'll send your order confirmation here">
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                    placeholder="your@email.com" type="email" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} />
                </Field>
                <Field label="Delivery Location" error={errors.location}>
                  <select className={`w-full border rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ${errors.location ? 'border-red-300' : 'border-gray-200'}`}
                    value={form.location}
                    onChange={e => { setForm({...form, location: e.target.value}); setErrors({...errors, location:''}) }}>
                    <option value="">— Select your town / area —</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Notes / Instructions (optional)">
                  <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none h-20"
                    placeholder="Any special delivery instructions, school name, etc."
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </Field>
              </div>
            </div>

            {/* M-Pesa info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <p className="font-bold text-green-800 text-sm mb-1" style={{fontFamily:'Nunito,sans-serif'}}>Pay with M-Pesa</p>
                <p className="text-green-700 text-xs leading-relaxed">
                  After placing your order, you'll receive an M-Pesa STK push to your phone number. Enter your PIN to complete payment. Your order is confirmed once payment is received.
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4" style={{fontFamily:'Nunito,sans-serif'}}>Order Summary</h2>
              <div className="space-y-2 text-sm mb-4 max-h-52 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {(item.image_url || item.image)
                        ? <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <ShoppingBag className="w-5 h-5 text-gray-400 m-auto mt-2" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-700 text-xs leading-snug line-clamp-1">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-700 font-semibold text-xs flex-shrink-0">{formatKES(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatKES(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatKES(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && <p className="text-xs text-gray-400">Add {formatKES(DELIVERY_THRESHOLD - subtotal)} more for free delivery</p>}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>Total</span>
                <span className="font-bold text-xl text-green-600" style={{fontFamily:'Nunito,sans-serif'}}>{formatKES(total)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-base active:scale-95 disabled:opacity-60"
                style={{fontFamily:'Nunito,sans-serif'}}
              >
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing order…</>
                  : '📱 Pay with M-Pesa'
                }
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

function Field({ label, children, error, hint }) {
  return (
    <div>
      <label className="block font-semibold text-sm text-gray-700 mb-1.5" style={{fontFamily:'Nunito,sans-serif'}}>{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  )
}
