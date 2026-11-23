import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle, CheckCircle, ChevronRight, Clock, Mail, Package, Shield, Smartphone,
} from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { Input, Select, Textarea } from '../components/ui/Form'
import { Button } from '../components/ui/Button'
import { EmptyCart } from '../components/EmptyState'
import { formatKES } from '../utils/format'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const LOCATIONS = [
  'Nairobi CBD','Westlands','Kasarani','Embakasi','Langata','Kiambu','Thika',
  'Kikuyu','Ruiru','Juja','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri',
  'Machakos','Meru','Garissa','Kakamega','Other (specify in notes)',
]

const STEPS = ['Your details', 'M-Pesa prompt', 'Enter PIN', 'Order confirmed']

const newIdempotencyKey = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
)

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  const [freshPrices, setFreshPrices] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', location: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [order, setOrder] = useState(null)

  const itemIds = items.map((item) => item.id).join(',')
  const [submitKey, setSubmitKey] = useState(newIdempotencyKey)

  // A new cart means a genuinely new order; only retries of the same cart
  // reuse the idempotency key.
  useEffect(() => { setSubmitKey(newIdempotencyKey()) }, [itemIds])

  // Fetch fresh prices from the API so the summary isn't based on stale
  // localStorage data. Only the products actually in the cart are requested.
  useEffect(() => {
    if (!itemIds) return undefined
    let cancelled = false
    fetch(`${API_BASE}/api/v1/products?ids=${encodeURIComponent(itemIds)}&per_page=100`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return
        const map = {}
        ;(data.data || []).forEach((product) => { map[product.id] = product })
        setFreshPrices(map)
      })
      .catch(() => {}) // fall back to cart prices on network error
    return () => { cancelled = true }
  }, [itemIds])

  const snapshot = (item) => freshPrices?.[item.id]
  const price = (item) => (snapshot(item)?.price ?? item.price)
  const stock = (item) => {
    const fresh = snapshot(item)
    const value = Number(fresh?.stock_quantity ?? item.stock_quantity)
    return Number.isFinite(value) ? value : null
  }
  const total = items.reduce((sum, item) => sum + price(item) * item.quantity, 0)

  if (items.length === 0 && !order) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="mb-8">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold">Delivery and payment</h1>
        </div>
        <EmptyCart />
      </div>
    )
  }
  if (order) return <OrderConfirmation order={order} phone={form.phone} />

  const normalizePhone = (value) => value.replace(/[\s\-()]/g, '')

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Enter the name for this delivery.'

    const phone = normalizePhone(form.phone)
    if (!phone) next.phone = 'Enter the phone number that will pay.'
    else if (!/^(07|01|\+2547|\+2541|2547|2541)\d{8}$/.test(phone))
      next.phone = 'Enter a valid Kenyan number, for example 0712345678.'

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = 'Enter a valid email address.'

    if (!form.location) next.location = 'Choose a delivery location.'

    const outOfStock = items.find((item) => {
      const available = stock(item)
      return available !== null && available < item.quantity
    })
    if (outOfStock) next.cart = `Only ${stock(outOfStock)} of “${outOfStock.name}” are available. Please update your cart.`

    return next
  }

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const next = validate()
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setSubmitting(true)
    setApiError('')

    try {
      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': submitKey,
        },
        body: JSON.stringify({
          order: {
            customer_name: form.fullName,
            customer_phone: normalizePhone(form.phone),
            customer_email: form.email.trim(),
            delivery_address: form.location,
            delivery_location: form.location,
            notes: form.notes,
            items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'The order could not be created.')
      clearCart()
      setOrder({
        ...data.data.order,
        phone: normalizePhone(form.phone),
        mpesa_sent: data.data.mpesa_sent,
        mpesa_message: data.data.mpesa_message,
      })
    } catch (error) {
      setApiError(error.message || 'Something went wrong. Please try again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div>
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold">Delivery and payment</h1>
      </div>

      <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs" aria-label="Checkout steps">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${
              index === 0
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-line-strong text-muted'
            }`}>
              {index + 1}
            </span>
            <span className={index === 0 ? 'font-medium text-ink' : 'text-muted'}>{step}</span>
            {index < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-line-strong" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {(apiError || errors.cart) && (
        <div className="mt-6 flex items-start gap-3 border border-danger/30 bg-[#fdf3f2] px-4 py-3 text-sm text-danger" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{apiError || errors.cart}</span>
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 border-l-2 border-brand-700 bg-brand-50 px-4 py-3.5">
        <Smartphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-800" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-brand-900">Your order is only confirmed after M-Pesa payment</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-brand-800">
            Submitting this form sends a payment request to your phone. Enter your PIN within five minutes to confirm the order.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <section className="border-t border-line pt-6">
              <h2 className="text-base font-semibold text-ink">Contact details</h2>
              <p className="mt-1 text-[13px] text-muted">The phone number receives the M-Pesa payment request.</p>

              <div className="mt-5 space-y-4">
                <Input
                  label="Full name"
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  placeholder="Jane Muthoni Kamau"
                  autoComplete="name"
                  error={errors.fullName}
                />

                <Input
                  label="M-Pesa phone number"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                  placeholder="0712 345 678"
                  autoComplete="tel"
                  hint="Check this carefully. The payment prompt goes to this number."
                  error={errors.phone}
                />

                <Input
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  optional
                  hint="Used for the order confirmation email after payment."
                  error={errors.email}
                />
              </div>
            </section>

            <section className="border-t border-line pt-6">
              <h2 className="text-base font-semibold text-ink">Delivery</h2>
              <p className="mt-1 text-[13px] text-muted">Tell us where the order should be delivered.</p>

              <div className="mt-5 space-y-4">
                <Select
                  label="Town or area"
                  value={form.location}
                  onChange={(event) => setField('location', event.target.value)}
                  error={errors.location}
                >
                  <option value="">Select your town or area</option>
                  {LOCATIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                </Select>

                <Textarea
                  label="Delivery notes"
                  value={form.notes}
                  onChange={(event) => setField('notes', event.target.value)}
                  placeholder="School name, gate number or other instructions"
                  rows={3}
                  optional
                />
              </div>
            </section>

            <div className="flex items-start gap-2.5 text-xs leading-relaxed text-muted">
              <Shield className="mt-px h-4 w-4 flex-shrink-0 text-brand-700" aria-hidden="true" />
              <p>Your phone number is used to process the M-Pesa payment. We never ask for or store your M-Pesa PIN.</p>
            </div>
          </div>

          <aside>
            <div className="border border-line bg-surface p-6 lg:sticky lg:top-24">
              <h2 className="text-base font-semibold text-ink">Order summary</h2>

              <div className="mt-4 max-h-56 space-y-2 overflow-y-auto border-b border-line pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-muted">
                      <span className="line-clamp-2">{item.name}</span>
                      <span className="mt-0.5 block text-xs text-muted/80">Qty {item.quantity}</span>
                    </span>
                    <span className="flex-shrink-0 tabular-nums text-body">{formatKES(price(item) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular-nums text-body">{formatKES(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="text-success">Free</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-xl font-semibold tabular-nums text-ink">{formatKES(total)}</span>
              </div>

              <Button type="submit" size="lg" loading={submitting} className="mt-5 w-full">
                {submitting ? 'Sending M-Pesa prompt' : `Pay ${formatKES(total)} with M-Pesa`}
              </Button>

              <p className="mt-3 text-center text-xs leading-relaxed text-muted">
                You will receive a payment prompt on your phone. The order is only confirmed after payment.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}

function OrderConfirmation({ order, phone }) {
  const [resending, setResending] = useState(false)
  const [promptSent, setPromptSent] = useState(Boolean(order.mpesa_sent))
  const [message, setMessage] = useState(order.mpesa_message || '')

  const resendPrompt = async () => {
    setResending(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/mpesa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_reference: order.reference, phone: order.phone || phone }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'The M-Pesa prompt could not be sent.')
      setPromptSent(true)
      setMessage(data.data?.message || 'M-Pesa prompt sent.')
    } catch (error) {
      setPromptSent(false)
      setMessage(error.message || 'The M-Pesa prompt could not be sent.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-lg">
        <div className="border border-line bg-surface p-6 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-muted-surface">
            <Smartphone className="h-5 w-5 text-brand-800" aria-hidden="true" />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold leading-tight text-ink sm:text-[28px]">
            {promptSent ? 'Enter your M-Pesa PIN to confirm' : 'The payment prompt was not sent'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            {promptSent ? (
              <>A payment request has been sent to <strong className="font-medium text-ink">{order.phone || phone}</strong>. Enter your PIN on your phone to complete the order.</>
            ) : (
              <>We could not send a payment request to <strong className="font-medium text-ink">{order.phone || phone}</strong>. Use the button below to try again.</>
            )}
          </p>

          <div className="mt-5 border border-line bg-paper px-4 py-3">
            <p className="text-[11px] font-medium text-muted">Order reference</p>
            <p className="mt-0.5 font-mono text-base font-semibold text-ink">{order.reference}</p>
          </div>

          <div
            className={`mt-4 flex items-start gap-2.5 border px-4 py-3 text-sm ${
              promptSent
                ? 'border-success/30 bg-brand-50 text-brand-900'
                : 'border-warning/30 bg-[#fbf3e3] text-warning'
            }`}
            role="status"
          >
            {promptSent
              ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              : <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />}
            <span>{message || (promptSent ? 'M-Pesa prompt sent.' : 'Payment prompt was not sent.')}</span>
          </div>

          {!promptSent && (
            <Button onClick={resendPrompt} loading={resending} className="mt-4 w-full">
              Resend M-Pesa prompt
            </Button>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm font-medium text-ink">After you pay</p>
            <ul className="mt-3 space-y-2.5 text-[13px] text-muted">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="mt-px h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                Your order is confirmed automatically once payment is received.
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-px h-4 w-4 flex-shrink-0 text-brand-700" aria-hidden="true" />
                If you provided an email address, a confirmation is sent to it.
              </li>
              <li className="flex items-start gap-2.5">
                <Package className="mt-px h-4 w-4 flex-shrink-0 text-brand-700" aria-hidden="true" />
                We prepare the items for delivery after payment.
              </li>
            </ul>
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            The M-Pesa prompt expires after five minutes.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="btn-secondary flex-1">Back to home</Link>
            <Link to="/shop" className="flex-1 text-center text-sm leading-[2.75rem] text-brand-800 hover:underline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
