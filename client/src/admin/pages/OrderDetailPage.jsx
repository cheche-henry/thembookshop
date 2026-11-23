import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, CreditCard, Mail, MapPin, Package, Phone, XCircle,
} from 'lucide-react'
import { api } from '../utils/api'
import { useToast } from '../../components/ui/Toast'
import StatusBadge from '../components/StatusBadge'
import { Button } from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const fmt = (value) => `KES ${Number(value || 0).toLocaleString('en-KE')}`

const TRANSITIONS = {
  pending:           ['payment_initiated', 'paid', 'failed', 'cancelled'],
  payment_initiated: ['paid', 'failed', 'cancelled'],
  paid:              ['processing', 'cancelled'],
  processing:        ['completed', 'cancelled'],
  completed:         [],
  failed:            ['pending', 'cancelled'],
  cancelled:         [],
}

const STATUS_LABELS = {
  payment_initiated: 'Mark awaiting payment',
  paid:              'Mark as paid',
  processing:        'Mark as processing',
  completed:         'Mark as completed',
  failed:            'Mark as failed',
  pending:           'Reset to pending',
  cancelled:         'Cancel order',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.orders.get(id)
      setOrder(res.data)
      document.title = `${res.data.reference} | Them Bookshop Admin`
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (status) => {
    if (status === 'cancelled') {
      setCancelModal(true)
      return
    }

    setUpdating(true)
    try {
      const res = await api.orders.updateStatus(id, status)
      setOrder(res.data)
      toast({ title: 'Order updated', description: `Status set to ${status.replace(/_/g, ' ')}.` })
    } catch (updateError) {
      toast({ title: 'Status could not be updated', description: updateError.message, tone: 'error' })
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
      setCancelReason('')
      toast({ title: 'Order cancelled', description: 'Stock has been restored.' })
    } catch (cancelError) {
      toast({ title: 'Order could not be cancelled', description: cancelError.message, tone: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl space-y-4" aria-busy="true">
        <div className="skeleton h-5 w-48 rounded-sm" />
        <div className="skeleton h-28 rounded-md" />
        <div className="skeleton h-72 rounded-md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md border border-line bg-surface p-8 text-center">
        <XCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted">{error}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button variant="secondary" onClick={load}>Try again</Button>
          <Button variant="ghost" onClick={() => navigate('/admin/orders')}>Back to orders</Button>
        </div>
      </div>
    )
  }

  const nextStatuses = TRANSITIONS[order.status] || []
  const payment = order.payments?.[order.payments.length - 1]

  return (
    <div className="max-w-5xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/admin/orders" className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-mono text-ink">{order.reference}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-mono text-2xl font-semibold text-ink">{order.reference}</h1>
            <StatusBadge status={order.status} size="md" />
          </div>
          <p className="mt-1 text-sm text-muted">
            Placed {new Date(order.created_at).toLocaleString('en-KE', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>

        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === 'cancelled' ? 'danger-ghost' : status === 'completed' ? 'primary' : 'secondary'}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
              >
                {STATUS_LABELS[status] || status}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Package className="h-4 w-4 text-muted" aria-hidden="true" /> Order items
              </h2>
            </div>

            <ul className="divide-y divide-line">
              {order.order_items?.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="h-14 w-10 flex-shrink-0 overflow-hidden border border-line bg-muted-surface">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-line-strong" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{item.product_name_snapshot}</p>
                    <p className="mt-0.5 text-xs text-muted">Qty {item.quantity} × {fmt(item.unit_price)}</p>
                  </div>
                  <span className="flex-shrink-0 text-[13px] font-medium tabular-nums text-ink">{fmt(item.total_price)}</span>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt><dd className="tabular-nums">{fmt(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Delivery</dt>
                <dd className={order.delivery_fee == 0 ? 'text-success' : 'tabular-nums'}>
                  {order.delivery_fee == 0 ? 'Free' : fmt(order.delivery_fee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-medium text-ink">
                <dt>Total</dt><dd className="tabular-nums">{fmt(order.total_amount)}</dd>
              </div>
            </dl>
          </section>

          {payment && (
            <section className="border border-line bg-surface">
              <div className="border-b border-line px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <CreditCard className="h-4 w-4 text-muted" aria-hidden="true" /> Payment
                </h2>
              </div>
              <dl className="grid grid-cols-2 gap-4 px-5 py-4 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Status</dt>
                  <dd className="mt-1 font-medium text-ink">{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Method</dt>
                  <dd className="mt-1 text-ink">M-Pesa</dd>
                </div>
                {payment.mpesa_receipt_number && (
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Receipt</dt>
                    <dd className="mt-1 font-mono text-ink">{payment.mpesa_receipt_number}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Phone</dt>
                  <dd className="mt-1 text-ink">{payment.phone_number}</dd>
                </div>
                {payment.result_desc && (
                  <div className="col-span-2">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">M-Pesa response</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-muted">{payment.result_desc}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-sm font-semibold text-ink">Customer</h2>
            </div>
            <div className="space-y-3 px-5 py-4">
              <p className="text-sm font-medium text-ink">{order.customer_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href={`tel:${order.customer_phone}`} className="hover:text-ink">{order.customer_phone}</a>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${order.customer_email}`} className="truncate hover:text-ink">{order.customer_email}</a>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-body">{order.delivery_address}</p>
                  {order.delivery_location && <p className="mt-0.5 text-xs">{order.delivery_location}</p>}
                </div>
              </div>
              {order.notes && (
                <div className="border-t border-line pt-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Notes</p>
                  <p className="mt-1 text-xs leading-relaxed text-body">{order.notes}</p>
                </div>
              )}
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-sm font-semibold text-ink">Timeline</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-700" aria-hidden="true" />
                <div>
                  <p className="text-ink">Order placed</p>
                  <p className="text-xs text-muted">{new Date(order.created_at).toLocaleString('en-KE')}</p>
                </div>
              </div>
              {payment?.created_at && (
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${payment.status === 'completed' ? 'bg-success' : 'bg-line-strong'}`} aria-hidden="true" />
                  <div>
                    <p className="text-ink">Payment {payment.status}</p>
                    <p className="text-xs text-muted">{new Date(payment.created_at).toLocaleString('en-KE')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${order.status === 'completed' ? 'bg-success' : 'bg-line-strong'}`} aria-hidden="true" />
                <p className={order.status === 'completed' ? 'text-ink' : 'text-muted'}>
                  {order.status === 'completed' ? 'Delivered' : 'Pending delivery'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel this order?"
        description="Stock will be restored for every item. The customer is notified by email."
        size="sm"
      >
        <div>
          <label htmlFor="cancel-reason" className="mb-1.5 block text-[13px] font-medium text-ink">
            Reason <span className="font-normal text-muted">optional</span>
          </label>
          <textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            rows={3}
            placeholder="Customer requested cancellation"
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancelModal(false)}>Keep order</Button>
          <Button variant="danger" onClick={handleCancel} loading={updating}>Cancel order</Button>
        </div>
      </Modal>
    </div>
  )
}
