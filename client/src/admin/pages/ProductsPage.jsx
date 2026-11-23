import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, Edit, Package, Plus, RefreshCw, Search, Trash2,
} from 'lucide-react'
import { api } from '../utils/api'
import { Table, Th, Td, Tr } from '../components/AdminTable'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Form'
import { useToast } from '../../components/ui/Toast'
import { DEPARTMENTS, SUBJECTS, TAXONOMY } from '../../utils/catalogue'

const fmt = (value) => `KES ${Number(value || 0).toLocaleString('en-KE')}`

function StockPill({ quantity }) {
  const value = Number(quantity ?? 0)
  const tone =
    value === 0
      ? 'bg-[#fdf3f2] text-danger'
      : value <= 5
        ? 'bg-[#fbf3e3] text-warning'
        : 'bg-brand-50 text-brand-800'

  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {value === 0 ? 'Out of stock' : `${value} in stock`}
    </span>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [params, setParams] = useState({
    page: 1, per_page: 25, q: '', category: '', subcategory: '', subject: '',
  })

  const navigate = useNavigate()
  const { toast } = useToast()
  const loadIdRef = useRef(0)
  const paramsRef = useRef(params)
  const debounceRef = useRef(null)

  paramsRef.current = params

  const subcategoryOptions = params.category ? (TAXONOMY[params.category] || []) : []

  const load = useCallback(async (current = paramsRef.current) => {
    const id = ++loadIdRef.current
    setLoading(true)
    setError(null)

    try {
      const clean = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== ''))
      const res = await api.products.list(clean)
      if (id !== loadIdRef.current) return
      setProducts(res.data || [])
      setMeta(res.meta || null)
    } catch (loadError) {
      if (id !== loadIdRef.current) return
      setError(loadError.message)
    } finally {
      if (id === loadIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(paramsRef.current)
    return () => clearTimeout(debounceRef.current)
  }, [load])

  const update = (changes, { debounce = false } = {}) => {
    const next = { ...paramsRef.current, ...changes, page: changes.page ?? 1 }
    setParams(next)
    paramsRef.current = next
    clearTimeout(debounceRef.current)
    if (debounce) debounceRef.current = setTimeout(() => load(next), 300)
    else load(next)
  }

  const handleDelete = async () => {
    if (!confirmTarget) return
    const product = confirmTarget
    setDeleting(product.id)

    try {
      await api.products.delete(product.id)
      setConfirmTarget(null)
      toast({ title: 'Product deleted', description: product.name })
      load(paramsRef.current)
    } catch (deleteError) {
      toast({ title: 'Product could not be deleted', description: deleteError.message, tone: 'error' })
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = Boolean(params.q || params.category || params.subcategory || params.subject)

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {meta ? `${meta.total_count} ${meta.total_count === 1 ? 'product' : 'products'}` : 'Loading products'}
          </p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={params.q}
            onChange={(event) => update({ q: event.target.value }, { debounce: true })}
            placeholder="Search by title or description"
            aria-label="Search products"
            className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
          <div className="lg:w-44">
            <Select
              value={params.category}
              onChange={(event) => update({ category: event.target.value, subcategory: '' })}
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>

          <div className="lg:w-48">
            <Select
              value={params.subcategory}
              onChange={(event) => update({ subcategory: event.target.value })}
              disabled={!params.category}
              aria-label="Filter by subcategory"
            >
              <option value="">{params.category ? 'All subcategories' : 'Choose a department'}</option>
              {subcategoryOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>

          <div className="lg:w-40">
            <Select
              value={params.subject}
              onChange={(event) => update({ subject: event.target.value })}
              aria-label="Filter by subject"
            >
              <option value="">All subjects</option>
              {SUBJECTS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => load(paramsRef.current)}
          loading={loading}
          className="lg:w-auto"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-danger/30 bg-[#fdf3f2] px-4 py-3 text-sm text-danger" role="alert">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </span>
          <Button variant="secondary" size="sm" onClick={() => load(paramsRef.current)}>Try again</Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Catalogue</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, row) => (
              <Tr key={row}>
                {Array.from({ length: 6 }).map((__, cell) => (
                  <Td key={cell}><div className="h-4 w-24 animate-pulse rounded-sm bg-muted-surface" /></Td>
                ))}
              </Tr>
            ))
          ) : products.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="py-12 text-center">
                <Package className="mx-auto h-7 w-7 text-line-strong" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted">
                  {hasFilters ? 'No products match these filters.' : 'No products have been added yet.'}
                </p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/admin/products/new')}>
                  Add a product
                </Button>
              </Td>
            </Tr>
          ) : products.map((product) => (
            <Tr key={product.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-10 flex-shrink-0 overflow-hidden border border-line bg-muted-surface">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="h-full w-full object-contain" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-line-strong" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-56 truncate text-[13px] font-medium text-ink">{product.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {[product.level_label || product.class_level, product.subject_label || product.subject]
                        .filter(Boolean)
                        .join(' · ') || 'No level or subject set'}
                    </p>
                  </div>
                </div>
              </Td>
              <Td>
                <p className="text-[13px] text-body">{product.subcategory || product.category}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {product.category}{product.stage ? ` · ${product.stage}` : ''}
                </p>
              </Td>
              <Td><span className="font-medium tabular-nums text-ink">{fmt(product.price)}</span></Td>
              <Td><StockPill quantity={product.stock_quantity} /></Td>
              <Td>
                <span className={`inline-flex items-center gap-1.5 text-xs ${product.active ? 'text-success' : 'text-muted'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${product.active ? 'bg-success' : 'bg-line-strong'}`} aria-hidden="true" />
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-muted-surface hover:text-ink"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(product)}
                    disabled={deleting === product.id}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-[#f8e9e7] hover:text-danger disabled:opacity-40"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Pagination meta={meta} onPageChange={(page) => update({ page })} />

      <Modal
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        title="Delete this product?"
        description="The product and its image are removed from the catalogue. This cannot be undone."
        size="sm"
      >
        <div className="border border-line bg-paper px-4 py-3">
          <p className="text-sm font-medium text-ink">{confirmTarget?.name}</p>
          {confirmTarget && (
            <p className="mt-0.5 text-xs text-muted">
              {confirmTarget.subcategory || confirmTarget.category} · {fmt(confirmTarget.price)}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmTarget(null)}>Keep product</Button>
          <Button variant="danger" onClick={handleDelete} loading={Boolean(deleting)}>
            Delete product
          </Button>
        </div>
      </Modal>
    </div>
  )
}
