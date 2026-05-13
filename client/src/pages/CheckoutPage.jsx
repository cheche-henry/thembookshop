import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, User, ShoppingBag, CheckCircle, AlertCircle, Smartphone, Clock, Shield } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import Field from '../components/Field'
import { formatKES } from '../utils/format'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const LOCATIONS = [
  'Nairobi CBD','Westlands','Kasarani','Embakasi','Langata','Kiambu','Thika',
  'Kikuyu','Ruiru','Juja','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri',
  'Machakos','Meru','Garissa','Kakamega','Other (specify in notes)',
]

export default function CheckoutPage() {
  const items     = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  const [freshPrices, setFreshPrices] = useState(null)
  const [form, setForm]     = useState({ fullName:'', phone:'', email:'', location:'', notes:'' })
  const [errors, setErrors] = useState({})
  const [submitting, setSub] = useState(false)
  const [apiError, setApiErr] = useState('')
  const [order, setOrder]   = useState(null)

  // Fetch fresh prices from API so cart prices aren't stale
  useEffect(() => {
    if (items.length === 0) return
    let cancelled = false
    fetch(`${API_BASE}/api/v1/products?per_page=100`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const map = {}
        ;(data.data || []).forEach(p => { map[p.id] = p.price })
        setFreshPrices(map)
      })
      .catch(() => {}) // fall back to cart prices on network error
    return () => { cancelled = true }
  }, [items.length])

  const price = (item) => (freshPrices && freshPrices[item.id] != null ? freshPrices[item.id] : item.price)
  const total = items.reduce((sum, i) => sum + price(i) * i.quantity, 0)

  if (items.length === 0 && !order) return <EmptyCart />
  if (order) return <OrderConfirmation order={order} phone={form.phone} />

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.phone.trim())    e.phone    = 'Phone number is required'
    else if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Kenyan number (e.g. 0712345678)'
    if (!form.location)        e.location = 'Please select your delivery location'
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
        method:  'POST',
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

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>Checkout</h1>
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {[
            { step: '1', label: 'Fill details', active: true },
            { step: '2', label: 'Receive M-Pesa prompt', active: false },
            { step: '3', label: 'Enter PIN', active: false },
            { step: '4', label: 'Order confirmed ✅', active: false },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                s.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
              }`} style={{fontFamily:'Nunito,sans-serif'}}>
                <span>{s.step}</span>
                <span>{s.label}</span>
              </div>
              {i < 3 && <span className="text-gray-300 text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {apiError}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800 text-sm" style={{fontFamily:'Nunito,sans-serif'}}>
            Your order is only confirmed after M-Pesa payment
          </p>
          <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
            Clicking &ldquo;Pay with M-Pesa&rdquo; will send a payment request to your phone. Enter your PIN within 5 minutes to confirm your order. No payment = no order.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2" style={{fontFamily:'Nunito,sans-serif'}}>
                <User className="w-4 h-4 text-green-600" /> Your Details
              </h2>
              <div className="space-y-4">
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    className={`w-full border rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="e.g. Jane Muthoni Kamau"
                    value={form.fullName}
                    onChange={e => { setForm({...form, fullName: e.target.value}); setErrors({...errors, fullName: ''}) }}
                  />
                </Field>

                <Field label="M-Pesa Phone Number" error={errors.phone} hint="This number will receive the payment prompt — make sure it's correct">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      placeholder="e.g. 0712 345 678"
                      type="tel"
                      value={form.phone}
                      onChange={e => { setForm({...form, phone: e.target.value}); setErrors({...errors, phone: ''}) }}
                    />
                  </div>
                </Field>

                <Field label="Email Address (optional)" hint="We'll send your order confirmation here once payment is complete">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                    placeholder="your@email.com"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </Field>

                <Field label="Delivery Location" error={errors.location}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all appearance-none ${errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      value={form.location}
                      onChange={e => { setForm({...form, location: e.target.value}); setErrors({...errors, location: ''}) }}
                    >
                      <option value="">— Select your town / area —</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </Field>

                <Field label="Notes / Instructions (optional)">
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none h-20"
                    placeholder="School name, gate number, special instructions…"
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-500 px-1">
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Your phone number is only used for M-Pesa payment processing. We never store your M-Pesa PIN.</p>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4" style={{fontFamily:'Nunito,sans-serif'}}>Order Summary</h2>

              <div className="space-y-2 text-sm mb-4 max-h-52 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        : <ShoppingBag className="w-5 h-5 text-gray-400 m-auto mt-2" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-700 text-xs leading-snug line-clamp-1">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-700 font-semibold text-xs flex-shrink-0">{formatKES(price(item) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{formatKES(total)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center mb-5">
                <span className="font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>Total</span>
                <span className="font-bold text-xl text-green-600" style={{fontFamily:'Nunito,sans-serif'}}>{formatKES(total)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-1 disabled:opacity-60 active:scale-95"
                style={{fontFamily:'Nunito,sans-serif'}}
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Sending M-Pesa prompt&hellip;</span>
                  </>
                ) : (
                  <>
                    <span className="text-base flex items-center gap-2">
                      <Smartphone className="w-5 h-5" /> Pay {formatKES(total)} with M-Pesa
                    </span>
                    <span className="text-green-200 text-xs font-normal">You'll receive a prompt on your phone</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                Order is only confirmed after M-Pesa payment is completed
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center page-enter">
      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500 mb-4 font-semibold">Your cart is empty.</p>
      <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">Browse the Shop</Link>
    </div>
  )
}

function OrderConfirmation({ order, phone }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center page-enter">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-bold text-2xl text-gray-800 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>
          Check Your Phone!
        </h2>
        <p className="text-gray-500 mb-4 text-sm leading-relaxed">
          An M-Pesa payment request has been sent to <strong className="text-gray-800">{phone}</strong>.
          Open your phone and enter your M-Pesa PIN to complete payment.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-400 mb-1">Order Reference</p>
          <p className="font-mono font-bold text-green-600 text-lg">{order.reference}</p>
        </div>

        <div className={`flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl mb-5 ${
          order.mpesa_sent
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {order.mpesa_sent
            ? <><CheckCircle className="w-4 h-4 flex-shrink-0" /> M-Pesa prompt sent successfully</>
            : <><AlertCircle className="w-4 h-4 flex-shrink-0" /> {order.mpesa_message}</>
          }
        </div>

        <div className="text-left bg-blue-50 rounded-xl p-4 mb-6 text-sm space-y-2">
          <p className="font-bold text-blue-800 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>After you pay:</p>
          <p className="text-blue-700">✅ Your order will be confirmed automatically</p>
          <p className="text-blue-700">📧 You'll receive a confirmation email</p>
          <p className="text-blue-700">📦 We'll prepare your items for delivery</p>
        </div>

        <div className="text-xs text-gray-400 mb-6 flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          M-Pesa prompt expires in 5 minutes
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm" style={{fontFamily:'Nunito,sans-serif'}}>
            Back to Home
          </Link>
          <Link to="/shop" className="text-green-600 hover:text-green-800 font-semibold text-sm" style={{fontFamily:'Nunito,sans-serif'}}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
