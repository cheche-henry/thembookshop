import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, BookOpen } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { formatKES } from '../utils/format'

export default function CartItem({ item }) {
  const [imgError, setImgError] = useState(false)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeFromCart = useCartStore((s) => s.removeFromCart)

  const stock = Number.isFinite(Number(item.stock_quantity)) ? Number(item.stock_quantity) : null
  const atStockLimit = stock !== null && item.quantity >= stock
  const meta = [item.subcategory || item.category, item.level_label || item.class_level].filter(Boolean).join(' · ')

  return (
    <div className="flex gap-4 py-5">
      <Link
        to={`/product/${item.id}`}
        className="w-[68px] flex-shrink-0 border border-line bg-muted-surface p-1 sm:w-20"
      >
        <div className="aspect-[2/3]">
          {item.image_url && !imgError ? (
            <img
              src={item.image_url}
              alt={item.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-6 w-6 text-line-strong" aria-hidden="true" />
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${item.id}`}>
              <h3 className="text-sm font-medium leading-snug text-ink hover:text-brand-800">{item.name}</h3>
            </Link>
            {meta && <p className="mt-1 text-xs text-muted">{meta}</p>}
            {stock !== null && stock > 0 && stock <= 10 && (
              <p className="mt-1 text-xs text-warning">Only {stock} left in stock</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="-m-1.5 flex-shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-[#f8e9e7] hover:text-danger"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center rounded-md border border-line-strong">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink disabled:opacity-40"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-xs font-semibold tabular-nums text-ink" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={atStockLimit}
              title={atStockLimit ? 'No more stock available' : undefined}
              className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums text-ink">{formatKES(item.price * item.quantity)}</p>
            {item.quantity > 1 && (
              <p className="mt-0.5 text-xs tabular-nums text-muted">{formatKES(item.price)} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
