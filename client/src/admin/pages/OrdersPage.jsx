import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, RefreshCw, ChevronDown } from 'lucide-react'
import { api } from '../utils/api'
import { Table, Th, Td, Tr } from '../components/AdminTable'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'

const STATUSES = ['', 'pending', 'payment_initiated', 'paid', 'processing', 'completed', 'failed', 'cancelled']
const fmt = (n) => `KES ${Number(n || 0).toLocaleString('en-KE')}`

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [params, setParams]   = useState({ page: 1, per_page: 20, status: '', q: '' })
  const navigate              = useNavigate()

  const load = async (p = params) => {
    setLoading(true)
    try {
      const clean = Object.fromEntries(Object.entries(p).filter(([,v]) => v !== ''))
      const res   = await api.orders.list(clean)
      setOrders(res.data || [])
      setMeta(res.meta || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const update = (changes) => {
    const next = { ...params, ...changes, page: changes.page ?? 1 }
    setParams(next)
    load(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {meta ? `${meta.total_count} total orders` : 'Loading…'}
          </p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={params.q}
            onChange={e => update({ q: e.target.value })}
            placeholder="Search by name, phone, reference…"
            className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={params.status}
            onChange={e => update({ status: e.target.value })}
            className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all appearance-none pr-9"
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button
            key={s || 'all'}
            onClick={() => update({ status: s })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              params.status === s
                ? 'bg-green-500/20 text-green-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table>
        <thead>
          <tr>
            <Th>Reference</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <Td key={j}><div className="h-4 bg-white/5 rounded animate-pulse" /></Td>
                ))}
              </Tr>
            ))
          ) : orders.length === 0 ? (
            <Tr><Td colSpan={6} className="text-center text-gray-600 py-12">No orders found</Td></Tr>
          ) : orders.map(order => (
            <Tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}>
              <Td><span className="font-mono text-xs text-green-400">{order.reference}</span></Td>
              <Td>
                <p className="text-white font-medium text-sm">{order.customer_name}</p>
                <p className="text-gray-500 text-xs">{order.customer_phone}</p>
              </Td>
              <Td><span className="text-gray-400 text-xs">—</span></Td>
              <Td><span className="text-white font-semibold">{fmt(order.total_amount)}</span></Td>
              <Td><StatusBadge status={order.status} /></Td>
              <Td>
                <span className="text-gray-500 text-xs">
                  {new Date(order.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Pagination meta={meta} onPageChange={page => update({ page })} />
    </div>
  )
}
