import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CheckCircle, Clock, DollarSign, RefreshCw, ShoppingBag, XCircle,
} from 'lucide-react'
import { api } from '../utils/api'
import { useToast } from '../../components/ui/Toast'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { Table, Th, Td, Tr } from '../components/AdminTable'
import { Button } from '../../components/ui/Button'

const fmt = (value) => `KES ${Number(value || 0).toLocaleString('en-KE')}`

export default function DashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, ordersRes, stockRes] = await Promise.all([
        api.orders.stats(),
        api.orders.list({ per_page: 6 }),
        api.products.lowStock(),
      ])
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data || [])
      setLowStock(stockRes.data || [])
    } catch (loadError) {
      setError(loadError.message)
      toast({ title: 'Dashboard could not be loaded', description: loadError.message, tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })

  const pipeline = [
    { label: 'Total', value: stats?.total_orders },
    { label: 'Paid', value: stats?.paid_orders },
    { label: 'Processing', value: stats?.processing_orders },
    { label: 'Completed', value: stats?.completed_orders },
    { label: 'Failed', value: stats?.failed_orders },
    { label: 'Cancelled', value: stats?.cancelled_orders },
  ]

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">{today}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 border border-danger/30 bg-[#fdf3f2] px-4 py-3 text-sm text-danger">
          <XCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <section aria-labelledby="revenue-heading">
        <h2 id="revenue-heading" className="eyebrow mb-3">Revenue</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Today" value={fmt(stats?.revenue_today)} icon={DollarSign} loading={loading} />
          <StatCard label="This month" value={fmt(stats?.revenue_this_month)} icon={DollarSign} loading={loading} />
          <StatCard label="Orders today" value={stats?.orders_today} icon={ShoppingBag} loading={loading} />
          <StatCard label="Awaiting payment" value={stats?.payment_initiated} icon={Clock} loading={loading} />
        </div>
      </section>

      <section aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading" className="eyebrow mb-3">Order pipeline</h2>
        <div className="grid grid-cols-2 divide-y divide-line border border-line bg-surface sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6 lg:divide-x">
          {pipeline.map((item) => (
            <div key={item.label} className="px-4 py-3.5">
              <p className="text-lg font-semibold tabular-nums text-ink">
                {loading ? <span className="inline-block h-5 w-8 animate-pulse bg-muted-surface" /> : (item.value ?? '—')}
              </p>
              <p className="mt-0.5 text-xs text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2" aria-labelledby="recent-orders-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-orders-heading" className="text-sm font-semibold text-ink">Recent orders</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs text-brand-800 hover:underline">
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, row) => (
                  <Tr key={row}>
                    {Array.from({ length: 4 }).map((__, cell) => (
                      <Td key={cell}><div className="h-4 w-20 animate-pulse rounded-sm bg-muted-surface" /></Td>
                    ))}
                  </Tr>
                ))
              ) : recentOrders.length === 0 ? (
                <Tr><Td colSpan={4} className="py-10 text-center text-muted">No orders yet.</Td></Tr>
              ) : recentOrders.map((order) => (
                <Tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}>
                  <Td><span className="font-mono text-xs text-brand-800">{order.reference}</span></Td>
                  <Td>
                    <p className="font-medium text-ink">{order.customer_name}</p>
                    <p className="text-xs text-muted">{order.customer_phone}</p>
                  </Td>
                  <Td><span className="font-medium tabular-nums text-ink">{fmt(order.total_amount)}</span></Td>
                  <Td><StatusBadge status={order.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </section>

        <section aria-labelledby="stock-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="stock-heading" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" /> Low stock
            </h2>
            <Link to="/admin/products" className="text-xs text-brand-800 hover:underline">Manage</Link>
          </div>

          <div className="border border-line bg-surface">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="h-4 w-32 animate-pulse rounded-sm bg-muted-surface" />
                    <div className="h-5 w-12 animate-pulse rounded-sm bg-muted-surface" />
                  </div>
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-success/50" aria-hidden="true" />
                <p className="mt-2 text-sm text-muted">No products are low on stock.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {lowStock.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-muted">{product.subcategory || product.category}</p>
                      </div>
                      <span className={`flex-shrink-0 text-[11px] font-medium ${
                        product.stock_quantity === 0 ? 'text-danger' : 'text-warning'
                      }`}>
                        {product.stock_quantity === 0 ? 'Out' : `${product.stock_quantity} left`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 divide-x divide-line border border-line bg-surface">
            <div className="px-4 py-3">
              <p className="text-lg font-semibold tabular-nums text-ink">{stats?.total_products ?? '—'}</p>
              <p className="text-xs text-muted">Active products</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-lg font-semibold tabular-nums text-danger">{stats?.out_of_stock_products ?? '—'}</p>
              <p className="text-xs text-muted">Out of stock</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
