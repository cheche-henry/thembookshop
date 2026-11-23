import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle, BookOpen, Check, ChevronRight, GraduationCap, Minus, Plus, ShoppingCart,
} from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { useToast } from '../components/ui/Toast'
import { formatKES, badgeColor } from '../utils/format'
import { productLevel, productSubject } from '../utils/catalogue'
import ProductCard from '../components/ProductCard'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ProductDetailPage() {
  const { id } = useParams()
  const addToCart = useCartStore((s) => s.addToCart)
  const inCart = useCartStore((s) => s.items.find((item) => item.id === Number(id)))
  const { toast } = useToast()

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setImgError(false)
    setQty(1)

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/products/${id}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Product not found')
        if (cancelled) return
        setProduct(data.data)
        document.title = `${data.data.name} | Them Bookshop`

        const relatedParams = new URLSearchParams({ per_page: '6' })
        if (data.data.subcategory) relatedParams.set('subcategory', data.data.subcategory)
        else if (data.data.category) relatedParams.set('category', data.data.category)

        const relRes = await fetch(`${API_BASE}/api/v1/products?${relatedParams}`)
        const relData = await relRes.json()
        if (!cancelled) setRelated((relData.data || []).filter((item) => item.id !== Number(id)).slice(0, 4))
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  const handleAddToCart = () => {
    if (!product || product.stock_quantity === 0) return
    addToCart(product, qty)
    setAdded(true)
    toast({ title: 'Added to cart', description: `${qty} × ${product.name}` })
  }

  if (loading) {
    return (
      <div className="container-page py-8 sm:py-10" aria-busy="true">
        <div className="mb-8 h-4 w-64 rounded-sm bg-muted-surface" />
        <div className="grid gap-10 md:grid-cols-2">
          <div className="skeleton aspect-[2/3] w-full max-w-sm" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded-sm bg-muted-surface" />
            <div className="h-5 w-1/2 rounded-sm bg-muted-surface" />
            <div className="h-24 w-full rounded-sm bg-muted-surface" />
            <div className="h-7 w-32 rounded-sm bg-muted-surface" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md border border-line bg-surface px-8 py-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold">Product unavailable</h1>
          <p className="mt-2 text-sm text-muted">{error || 'This product could not be found.'}</p>
          <Link to="/shop" className="btn-primary mt-6">Back to the shop</Link>
        </div>
      </div>
    )
  }

  const levelLabel = productLevel(product)
  const subjectLabel = productSubject(product)
  const inStock = product.stock_quantity > 0
  const lowStock = inStock && product.stock_quantity <= 10

  const crumbHref = product.subcategory
    ? `/shop?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`
    : `/shop?category=${encodeURIComponent(product.category || '')}`

  return (
    <div className="container-page py-6 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        {product.category && (
          <>
            <Link to={crumbHref} className="hover:text-ink">{product.subcategory || product.category}</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        )}
        <span className="max-w-[18rem] truncate text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative w-full max-w-sm overflow-hidden border border-line bg-surface p-4">
            <div className="aspect-[2/3] bg-muted-surface">
              {product.image_url && !imgError ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-14 w-14 text-line-strong" aria-hidden="true" />
                </div>
              )}
            </div>

            {product.badge && (
              <span className={`absolute left-6 top-6 rounded-sm px-2 py-0.5 text-[11px] font-semibold ${badgeColor(product.badge)}`}>
                {product.badge}
              </span>
            )}

            {!inStock && (
              <div className="absolute inset-4 flex items-center justify-center bg-paper/80">
                <span className="rounded-sm bg-ink px-3 py-1.5 text-xs font-semibold text-white">Out of stock</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {levelLabel && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                {levelLabel}
              </span>
            )}
            {subjectLabel && <span>{subjectLabel}</span>}
            {product.stage && <span>{product.stage}</span>}
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[38px]">
            {product.name}
          </h1>

          <p className="mt-4 text-2xl font-semibold tabular-nums text-ink">{formatKES(product.price)}</p>

          <p className={`mt-2 flex items-center gap-1.5 text-sm ${lowStock ? 'text-warning' : inStock ? 'text-success' : 'text-danger'}`}>
            {inStock ? <Check className="h-4 w-4" aria-hidden="true" /> : <AlertCircle className="h-4 w-4" aria-hidden="true" />}
            {inStock
              ? lowStock ? `Only ${product.stock_quantity} left in stock` : 'In stock'
              : 'Currently out of stock'}
          </p>

          <div className="mt-6 border-t border-line pt-6">
            <p className="text-sm leading-relaxed text-body">
              {product.description || 'No description is available for this title yet.'}
            </p>
          </div>

          {inStock && (
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-md border border-line-strong">
                <button
                  type="button"
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                  disabled={qty <= 1}
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums text-ink" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((value) => Math.min(product.stock_quantity, value + 1))}
                  disabled={qty >= product.stock_quantity}
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <span className="text-xs text-muted">Quantity</span>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-brand-700 px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {added ? <Check className="h-5 w-5" aria-hidden="true" /> : <ShoppingCart className="h-5 w-5" aria-hidden="true" />}
              {inStock ? (added ? 'Added to cart' : 'Add to cart') : 'Out of stock'}
            </button>

            {(added || inCart) && (
              <Link
                to="/cart"
                className="inline-flex h-12 items-center justify-center rounded-md border border-line-strong px-6 text-[15px] font-medium text-ink transition-colors hover:border-brand-700 hover:text-brand-800"
              >
                View cart
              </Link>
            )}
          </div>

          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-muted">Payment</dt>
              <dd className="text-ink">M-Pesa at checkout</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-ink">Free on all orders</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-muted">Order updates</dt>
              <dd className="text-ink">Email after payment</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Related titles</h2>
            <Link to={crumbHref} className="text-sm text-brand-800 hover:underline">See the shelf</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  )
}
