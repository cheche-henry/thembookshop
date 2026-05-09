import { Link } from 'react-router-dom'
import { ShoppingCart, Tag } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { formatKES, badgeColor } from '../utils/format'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const addToCart = useCartStore((s) => s.addToCart)
  const [added, setAdded] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden bg-gray-50 h-48">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {product.badge && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold absolute top-3 left-3 shadow-sm ${badgeColor(product.badge)}`}>{product.badge}</span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-green-600 transition-colors line-clamp-2" style={{fontFamily:'Nunito,sans-serif'}}>{product.name}</h3>
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500"><Tag className="w-3 h-3 mr-1"/>{product.category}</span>
          {product.classLevel && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600">{product.classLevel}</span>}
          {product.subject && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">{product.subject}</span>}
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-bold text-green-600 text-base" style={{fontFamily:'Nunito,sans-serif'}}>{formatKES(product.price)}</span>
          <button onClick={handleAdd} className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${added ? 'bg-green-100 text-green-700' : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'}`} style={{fontFamily:'Nunito,sans-serif'}}>
            <ShoppingCart className="w-3.5 h-3.5"/>{added ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  )
}
