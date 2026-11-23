import { Link } from 'react-router-dom'
import { PackageSearch, ShoppingCart } from 'lucide-react'
import { Button } from './ui/Button'

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-start border border-dashed border-line-strong bg-surface px-6 py-12 sm:items-center sm:px-10 sm:py-16 sm:text-center ${className}`}>
      {Icon && (
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-line bg-muted-surface">
          <Icon className="h-5 w-5 text-muted" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function EmptySearch({ onReset }) {
  return (
    <EmptyState
      icon={PackageSearch}
      title="No products match these filters"
      description="Try a different search term, or clear a filter to widen the results."
      action={<Button variant="secondary" onClick={onReset}>Clear filters</Button>}
    />
  )
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      description="Browse the shop to find textbooks, readers and stationery for the school year."
      action={<Link to="/shop" className="btn-secondary">Browse the shop</Link>}
    />
  )
}
