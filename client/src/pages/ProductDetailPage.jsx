import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Plus, Minus, Tag, BookOpen, GraduationCap, ChevronRight } from 'lucide-react'
import { products } from '../data/products'
import { useCartStore } from '../context/cartStore'
import { formatKES, badgeColor } from '../utils/format'
import ProductCard from '../components/ProductCard'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.addToCart)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const product = products.find((p) => p.id === Number(id))
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg mb-4">Product not found.</p>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

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
          <div className="aspect-square bg-gray-50 rounded-xl2 overflow-hidden shadow-card">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.badge && (
            <span className={`badge absolute top-4 left-4 shadow ${badgeColor(product.badge)}`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge bg-gray-100 text-gray-500">
              <Tag className="w-3 h-3 mr-1" />{product.category}
            </span>
            {product.classLevel && (
              <span className="badge bg-sky-100 text-sky-700">
                <GraduationCap className="w-3 h-3 mr-1" />{product.classLevel}
              </span>
            )}
            {product.subject && (
              <span className="badge bg-brand-100 text-brand-700">
                <BookOpen className="w-3 h-3 mr-1" />{product.subject}
              </span>
            )}
          </div>

          <h1 className="font-display font-900 text-2xl md:text-3xl text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
            {product.description}
          </p>

          <div className="text-3xl font-display font-bold text-brand-600 mb-6">
            {formatKES(product.price)}
          </div>

          {/* Qty selector */}
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
                onClick={() => setQty((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 font-display font-bold py-3.5 px-8 rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-base ${
                added
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-brand-500 hover:bg-brand-600 text-white hover:shadow-md'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            {added && (
              <Link to="/cart" className="btn-outline flex items-center justify-center gap-2 text-base">
                View Cart →
              </Link>
            )}
          </div>

          {/* Trust */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 space-y-1.5 font-display">
            <p>🚚 Free delivery on orders over KES 2,000</p>
            <p>📱 Pay via M-Pesa at checkout</p>
            <p>✅ Government-approved edition</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
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
