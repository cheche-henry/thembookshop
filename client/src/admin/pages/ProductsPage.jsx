import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, RefreshCw, Edit, Trash2, Package, ChevronDown } from 'lucide-react'
import { api } from '../utils/api'
import { Table, Th, Td, Tr } from '../components/AdminTable'
import Pagination from '../components/Pagination'
import { Btn } from '../components/AdminInput'

const fmt = (n) => `KES ${Number(n || 0).toLocaleString('en-KE')}`

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [params, setParams]     = useState({ page: 1, per_page: 25, q: '', category: '' })
  const navigate                = useNavigate()

  const load = async (p = params) => {
    setLoading(true)
    try {
      const clean = Object.fromEntries(Object.entries(p).filter(([,v]) => v !== ''))
      const res   = await api.products.list(clean)
      setProducts(res.data || [])
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

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeleting(product.id)
    try {
      await api.products.delete(product.id)
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta ? `${meta.total_count} products` : 'Loading…'}</p>
        </div>
        <Btn onClick={() => navigate('/admin/products/new')}>
          <Plus className="w-4 h-4" /> Add Product
        </Btn>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={params.q}
            onChange={e => update({ q: e.target.value })}
            placeholder="Search products…"
            className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={params.category}
            onChange={e => update({ category: e.target.value })}
            className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none pr-9"
          >
            <option value="">All Categories</option>
            {['Textbooks','Revision Books','Storybooks','Exercise Books','Pens & Pencils','Geometry Sets','Rulers','School Bags'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        <button onClick={() => load()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
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
          ) : products.length === 0 ? (
            <Tr><Td colSpan={6} className="text-center text-gray-600 py-12">
              No products found.{' '}
              <button onClick={() => navigate('/admin/products/new')} className="text-green-400 hover:underline">Add one →</button>
            </Td></Tr>
          ) : products.map(p => (
            <Tr key={p.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      : <Package className="w-5 h-5 text-gray-600 m-auto mt-2.5" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate max-w-48">{p.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      {p.class_level && <span className="text-xs text-gray-600">{p.class_level}</span>}
                      {p.subject && <span className="text-xs text-gray-600">· {p.subject}</span>}
                    </div>
                  </div>
                </div>
              </Td>
              <Td><span className="text-gray-400 text-xs">{p.category}</span></Td>
              <Td><span className="text-white font-semibold">{fmt(p.price)}</span></Td>
              <Td>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  p.stock_quantity === 0    ? 'bg-red-500/20 text-red-400' :
                  p.stock_quantity <= 5     ? 'bg-amber-500/20 text-amber-400' :
                                              'bg-green-500/20 text-green-400'
                }`}>
                  {p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} in stock`}
                </span>
              </Td>
              <Td>
                <span className={`text-xs font-semibold ${p.active ? 'text-green-400' : 'text-gray-600'}`}>
                  {p.active ? 'Active' : 'Inactive'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deleting === p.id}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Pagination meta={meta} onPageChange={page => update({ page })} />
    </div>
  )
}
