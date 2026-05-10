import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, TrendingUp, Package, AlertTriangle,
  Clock, CheckCircle, XCircle, DollarSign, ArrowRight, RefreshCw
} from 'lucide-react'
import { api } from '../utils/api'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { Table, Th, Td, Tr } from '../components/AdminTable'

const fmt = (n) => `KES ${Number(n || 0).toLocaleString('en-KE')}`

export default function DashboardPage() {
  const [stats, setStats]         = useState(null)
  const [recentOrders, setRecent] = useState([])
  const [lowStock, setLowStock]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

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
      setRecent(ordersRes.data || [])
      setLowStock(stockRes.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <XCircle className="w-10 h-10 text-red-400" />
      <p className="text-red-400">{error}</p>
      <button onClick={load} className="text-sm text-gray-400 hover:text-white flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Retry</button>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back — here's what's happening today</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Revenue stats */}
      <div>
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Revenue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Revenue Today"      value={fmt(stats?.revenue_today)}       icon={DollarSign}  color="green"  loading={loading} />
          <StatCard label="Revenue This Month" value={fmt(stats?.revenue_this_month)}  icon={TrendingUp}  color="blue"   loading={loading} />
          <StatCard label="All-Time Revenue"   value={fmt(stats?.revenue_total)}       icon={TrendingUp}  color="purple" loading={loading} />
        </div>
      </div>

      {/* Order stats */}
      <div>
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders"    value={stats?.total_orders}       icon={ShoppingBag}  color="blue"   loading={loading} />
          <StatCard label="Orders Today"    value={stats?.orders_today}       icon={Clock}        color="amber"  loading={loading} />
          <StatCard label="Awaiting Payment" value={stats?.payment_initiated} icon={Clock}        color="amber"  loading={loading} />
          <StatCard label="Paid"            value={stats?.paid_orders}        icon={CheckCircle}  color="blue"   loading={loading} />
          <StatCard label="Processing"      value={stats?.processing_orders}  icon={Package}      color="purple" loading={loading} />
          <StatCard label="Completed"       value={stats?.completed_orders}   icon={CheckCircle}  color="green"  loading={loading} />
          <StatCard label="Failed"          value={stats?.failed_orders}      icon={XCircle}      color="red"    loading={loading} />
          <StatCard label="Cancelled"       value={stats?.cancelled_orders}   icon={XCircle}      color="red"    loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
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
                Array.from({ length: 5 }).map((_, i) => (
                  <Tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Td key={j}><div className="h-4 bg-white/5 rounded animate-pulse w-20" /></Td>
                    ))}
                  </Tr>
                ))
              ) : recentOrders.length === 0 ? (
                <Tr><Td colSpan={4} className="text-center text-gray-600 py-8">No orders yet</Td></Tr>
              ) : recentOrders.map(order => (
                <Tr key={order.id} onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                  <Td><span className="font-mono text-xs text-green-400">{order.reference}</span></Td>
                  <Td>
                    <p className="text-white text-sm font-medium">{order.customer_name}</p>
                    <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                  </Td>
                  <Td><span className="text-white font-semibold">{fmt(order.total_amount)}</span></Td>
                  <Td><StatusBadge status={order.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Low Stock Alert */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock
            </h2>
            <Link to="/admin/products" className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-white/5 rounded w-32 animate-pulse" />
                    <div className="h-5 bg-white/5 rounded w-12 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500/40 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">All products well stocked</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {lowStock.map(p => (
                  <Link key={p.id} to={`/admin/products/${p.id}/edit`} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-white text-sm font-medium truncate group-hover:text-green-400 transition-colors">{p.name}</p>
                      <p className="text-gray-600 text-xs">{p.category}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.stock_quantity === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {p.stock_quantity === 0 ? 'OUT' : `${p.stock_quantity} left`}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Product summary */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{stats?.total_products ?? '—'}</p>
              <p className="text-gray-500 text-xs">Active Products</p>
            </div>
            <div className="bg-gray-900 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-red-400 font-bold text-lg">{stats?.out_of_stock_products ?? '—'}</p>
              <p className="text-gray-500 text-xs">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
