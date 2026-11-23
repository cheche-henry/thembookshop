import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw, Search } from 'lucide-react'
import { api } from '../utils/api'
import { Table, Th, Td, Tr } from '../components/AdminTable'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Form'
import { Button } from '../../components/ui/Button'

const STATUSES = ['', 'pending', 'payment_initiated', 'paid', 'processing', 'completed', 'failed', 'cancelled']
const fmt = (value) => `KES ${Number(value || 0).toLocaleString('en-KE')}`
const label = (value) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState({ page: 1, per_page: 20, status: '', q: '' })

  const navigate = useNavigate()
  const paramsRef = useRef(params)
  const debounceRef = useRef(null)

  paramsRef.current = params

  const load = async (current = paramsRef.current) => {
    setLoading(true)
    setError(null)
    try {
      const clean = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== ''))
      const res = await api.orders.list(clean)
      setOrders(res.data || [])
      setMeta(res.meta || null)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(paramsRef.current)
    return () => clearTimeout(debounceRef.current)
  }, [])

  const update = (changes, { debounce = false } = {}) => {
    const next = { ...paramsRef.current, ...changes, page: changes.page ?? 1 }
    setParams(next)
    paramsRef.current = next
    clearTimeout(debounceRef.current)
    if (debounce) debounceRef.current = setTimeout(() => load(next), 300)
    else load(next)
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Orders</h1>
          <p className="mt-1 text-sm text-muted">
            {meta ? `${meta.total_count} ${meta.total_count === 1 ? 'order' : 'orders'}` : 'Loading orders'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => load()} loading={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={params.q}
            onChange={(event) => update({ q: event.target.value }, { debounce: true })}
            placeholder="Search by name, phone or reference"
            aria-label="Search orders"
            className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={params.status}
            onChange={(event) => update({ status: event.target.value })}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUSES.filter(Boolean).map((status) => (
              <option key={status} value={status}>{label(status)}</option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-danger/30 bg-[#fdf3f2] px-4 py-3 text-sm text-danger" role="alert">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </span>
          <Button variant="secondary" size="sm" onClick={() => load()}>Try again</Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Reference</Th>
            <Th>Customer</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, row) => (
              <Tr key={row}>
                {Array.from({ length: 5 }).map((__, cell) => (
                  <Td key={cell}><div className="h-4 w-24 animate-pulse rounded-sm bg-muted-surface" /></Td>
                ))}
              </Tr>
            ))
          ) : orders.length === 0 ? (
            <Tr>
              <Td colSpan={5} className="py-10 text-center text-muted">
                No orders match these filters.
              </Td>
            </Tr>
          ) : orders.map((order) => (
            <Tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}>
              <Td><span className="font-mono text-xs text-brand-800">{order.reference}</span></Td>
              <Td>
                <p className="font-medium text-ink">{order.customer_name}</p>
                <p className="text-xs text-muted">{order.customer_phone}</p>
              </Td>
              <Td><span className="font-medium tabular-nums text-ink">{fmt(order.total_amount)}</span></Td>
              <Td><StatusBadge status={order.status} /></Td>
              <Td>
                <span className="text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Pagination meta={meta} onPageChange={(page) => update({ page })} />
    </div>
  )
}
