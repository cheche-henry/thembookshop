import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Phone, MapPin, Mail, Package, CreditCard, RefreshCw, XCircle } from 'lucide-react'
import { api } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { Btn } from '../components/AdminInput'
import Modal from '../components/Modal'

const fmt = (n) => `KES ${Number(n || 0).toLocaleString('en-KE')}`

const TRANSITIONS = {
  pending:           ['payment_initiated', 'cancelled'],
  payment_initiated: ['paid', 'failed', 'cancelled'],
  paid:              ['processing', 'cancelled'],
  processing:        ['completed'],
  completed:         [],
  failed:            ['pending'],
  cancelled:         [],
}

const STATUS_LABELS = {
  payment_initiated: 'Mark as Awaiting Payment',
  paid:              'Mark as Paid',
  processing:        'Mark as Processing',
  completed:         'Mark as Completed',
  failed:            'Mark as Failed',
  pending:           'Reset to Pending',
  cancelled:         'Cancel Order',
}

export default function OrderDetailPage() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [updating, setUpdating] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.orders.get(id)
      setOrder(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (status) => {
    if (status === 'cancelled') { setCancelModal(true); return }
    setUpdating(true)
    try {
      const res = await api.orders.updateStatus(id, status)
      setOrder(res.data)
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    setUpdating(true)
    try {
      const res = await api.orders.cancel(id, cancelReason)
      setOrder(res.data)
      setCancelModal(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-white/5 rounded w-48" />
      <div className="h-48 bg-white/5 rounded-2xl" />
      <div className="h-64 bg-white/5 rounded-2xl" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <XCircle className="w-10 h-10 text-red-400" />
      <p className="text-red-400">{error}</p>
      <Link to="/admin/orders" className="text-sm text-gray-400 hover:text-white">← Back to orders</Link>
    </div>
  )

  const nextStatuses = TRANSITIONS[order.status] || []
  const payment = order.payments?.[order.payments.length - 1]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/orders" className="text-gray-500 hover:text-green-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Orders
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-700" />
        <span className="text-gray-300 font-mono">{order.reference}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-white font-bold text-2xl font-mono">{order.reference}</h1>
            <StatusBadge status={order.status} size="md" />
          </div>
          <p className="text-gray-500 text-sm">
            Placed {new Date(order.created_at).toLocaleString('en-KE', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>

        {/* Status actions */}
        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map(s => (
              <Btn
                key={s}
                variant={s === 'cancelled' ? 'danger' : s === 'completed' ? 'primary' : 'secondary'}
                onClick={() => handleStatusChange(s)}
                loading={updating}
              >
                {STATUS_LABELS[s] || s}
              </Btn>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order items */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-green-400" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product?.image_url
                      ? <img src={item.product.image_url} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                      : <Package className="w-5 h-5 text-gray-600 m-auto mt-3" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{item.product_name_snapshot}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity} × {fmt(item.unit_price)}</p>
                  </div>
                  <span className="text-white font-semibold text-sm">{fmt(item.total_price)}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Delivery</span>
                <span className={order.delivery_fee == 0 ? 'text-green-400' : ''}>{order.delivery_fee == 0 ? 'FREE' : fmt(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-white/10 pt-2">
                <span>Total</span><span>{fmt(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          {payment && (
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-400" /> Payment
                </h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Status</p>
                  <span className={`font-semibold ${payment.status === 'completed' ? 'text-green-400' : payment.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Method</p>
                  <p className="text-white font-semibold">M-Pesa</p>
                </div>
                {payment.mpesa_receipt_number && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">M-Pesa Receipt</p>
                    <p className="text-green-400 font-mono font-semibold">{payment.mpesa_receipt_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-white">{payment.phone_number}</p>
                </div>
                {payment.result_desc && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">M-Pesa Response</p>
                    <p className="text-gray-400 text-xs">{payment.result_desc}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column — customer info */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Customer</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-white font-semibold">{order.customer_name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <a href={`tel:${order.customer_phone}`} className="hover:text-green-400 transition-colors">{order.customer_phone}</a>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <a href={`mailto:${order.customer_email}`} className="hover:text-green-400 transition-colors truncate">{order.customer_email}</a>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{order.delivery_address}</p>
                  {order.delivery_location && <p className="text-gray-600 text-xs mt-0.5">{order.delivery_location}</p>}
                </div>
              </div>
              {order.notes && (
                <div className="bg-white/5 rounded-xl p-3 text-xs text-gray-400 mt-2">
                  <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Notes</p>
                  {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Timeline</h2>
            </div>
            <div className="px-5 py-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-white">Order placed</p>
                    <p className="text-gray-600 text-xs">{new Date(order.created_at).toLocaleString('en-KE')}</p>
                  </div>
                </div>
                {payment?.created_at && (
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${payment.status === 'completed' ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <div>
                      <p className="text-white">Payment {payment.status}</p>
                      <p className="text-gray-600 text-xs">{new Date(payment.created_at).toLocaleString('en-KE')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <p className={order.status === 'completed' ? 'text-white' : 'text-gray-600'}>
                    {order.status === 'completed' ? 'Delivered' : 'Pending delivery'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" size="sm">
        <p className="text-gray-400 text-sm mb-4">
          This will cancel the order and restore stock for all items. The customer will be notified by email.
        </p>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Reason (optional)</label>
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            rows={3}
            placeholder="e.g. Customer requested cancellation"
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Btn variant="ghost" onClick={() => setCancelModal(false)}>Keep Order</Btn>
          <Btn variant="danger" onClick={handleCancel} loading={updating}>Cancel Order</Btn>
        </div>
      </Modal>
    </div>
  )
}
