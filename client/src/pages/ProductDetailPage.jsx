import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Tag, BookOpen, GraduationCap, ChevronRight, AlertCircle } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { formatKES, badgeColor } from '../utils/format'
import ProductCard from '../components/ProductCard'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ProductDetailPage() {
  const { id }        = useParams()
  const addToCart     = useCartStore((s) => s.addToCart)
  const [qty, setQty] = useState(1)
  const [added, setAdded]     = useState(false)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
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

        const relRes = await fetch(`${API_BASE}/api/v1/products?category=${encodeURIComponent(data.data.category)}&per_page=5`)
        const relData = await relRes.json()
        if (!cancelled) setRelated((relData.data || []).filter(p => p.id !== Number(id)).slice(0, 4))
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
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-24 bg-gray-100 rounded" />
          <div className="h-8 bg-gray-100 rounded w-32" />
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-500 mb-4">{error || 'Product not found'}</p>
      <Link to="/shop" className="btn-primary">Back to Shop</Link>
    </div>
  )

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-display">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/shop" className="hover:text-brand-600 transition-colors">Shop</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-600 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
            {product.image_url && !imgError ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-gray-200" />
              </div>
            )}
          </div>
          {product.badge && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold absolute top-4 left-4 shadow ${badgeColor(product.badge)}`}>
              {product.badge}
            </span>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl">
              <span className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
              <Tag className="w-3 h-3 mr-1" />{product.category}
            </span>
            {product.class_level && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                <GraduationCap className="w-3 h-3 mr-1" />{product.class_level}
              </span>
            )}
            {product.subject && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <BookOpen className="w-3 h-3 mr-1" />{product.subject}
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
            {product.description || 'No description available.'}
          </p>

          <div className="text-3xl font-display font-bold text-green-600 mb-2">
            {formatKES(product.price)}
          </div>

          {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
            <p className="text-amber-600 text-sm font-semibold mb-4">
              ⚠️ Only {product.stock_quantity} left in stock
            </p>
          )}

          {/* Qty selector */}
          {product.stock_quantity > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-display font-semibold text-gray-600">Quantity:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-display font-bold text-gray-800">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`flex items-center justify-center gap-2 font-display font-bold py-3.5 px-8 rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock_quantity === 0 ? 'Out of Stock' : added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            {added && (
              <Link to="/cart" className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-display font-bold py-3.5 px-8 rounded-xl transition-all duration-200 text-base">
                View Cart →
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 space-y-1.5 font-display">
            <p>🚚 Free delivery on orders over KES 2,000</p>
            <p>📱 Pay via M-Pesa at checkout</p>
            <p>✅ Government-approved edition</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
