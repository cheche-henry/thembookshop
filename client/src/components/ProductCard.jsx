import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, BookOpen } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { useToast } from './ui/Toast'
import { formatKES, badgeColor } from '../utils/format'
import { productLevel, productSubject } from '../utils/catalogue'

export default function ProductCard({ product }) {
  const items = useCartStore((s) => s.items)
  const addToCart = useCartStore((s) => s.addToCart)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const [imgError, setImgError] = useState(false)
  const { toast } = useToast()

  const cartItem = items.find((item) => item.id === product.id)
  const levelLabel = productLevel(product)
  const subjectLabel = productSubject(product)
  const meta = [levelLabel, subjectLabel || product.subcategory || product.category].filter(Boolean).join(' · ')
  const productHref = `/product/${product.id}`

  const handleAdd = () => {
    if (product.stock_quantity === 0) return
    addToCart(product)
    toast({ title: 'Added to cart', description: product.name })
  }

  const handleDecrease = () => {
    if (cartItem.quantity <= 1) removeFromCart(product.id)
    else updateQuantity(product.id, cartItem.quantity - 1)
  }

  const handleIncrease = () => {
    updateQuantity(product.id, cartItem.quantity + 1)
  }

  const inCart = cartItem && cartItem.quantity > 0

  return (
    <div className="group flex flex-col border border-line bg-surface transition-colors duration-150 hover:border-line-strong">
      <Link to={productHref} className="relative block aspect-[2/3] overflow-hidden bg-muted-surface p-3">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-line-strong" aria-hidden="true" />
          </span>
        )}

        {product.badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${badgeColor(product.badge)}`}>
            {product.badge}
          </span>
        )}

        {product.stock_quantity === 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-paper/75">
            <span className="rounded-sm bg-ink px-2 py-1 text-[11px] font-semibold text-white">Out of stock</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="min-h-[2.5rem] text-sm font-medium leading-snug text-ink">
          <Link
            to={productHref}
            className="line-clamp-2 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:underline"
          >
            {product.name}
          </Link>
        </h3>
        {meta && <p className="mt-1 truncate text-xs text-muted">{meta}</p>}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-[15px] font-semibold tabular-nums text-ink">
            {formatKES(product.price)}
          </span>

          {inCart ? (
            <div className="flex items-center rounded-md border border-line-strong">
              <button
                type="button"
                onClick={handleDecrease}
                className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-semibold tabular-nums text-ink" aria-live="polite">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={product.stock_quantity !== undefined && cartItem.quantity >= product.stock_quantity}
                className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock_quantity === 0}
              className="flex h-8 items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-xs font-medium text-ink transition-colors hover:border-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
