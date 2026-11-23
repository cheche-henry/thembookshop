import { ChevronLeft, ChevronRight } from 'lucide-react'

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current, current - 1, current + 1])
  const list = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)

  const result = []
  list.forEach((page, index) => {
    if (index > 0 && page - list[index - 1] > 1) result.push('gap')
    result.push(page)
  })
  return result
}

export default function Pagination({ meta, onPageChange, className = '' }) {
  if (!meta || meta.total_pages <= 1) return null

  const { current_page: current, total_pages: total, total_count: count, per_page: perPage } = meta
  const from = (current - 1) * perPage + 1
  const to = Math.min(current * perPage, count)

  const navButton =
    'flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav className={`mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 ${className}`} aria-label="Pagination">
      <p className="text-xs text-muted">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of{' '}
        <span className="font-medium text-ink">{count}</span>
      </p>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          className={navButton}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageWindow(current, total).map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="w-6 text-center text-xs text-muted" aria-hidden="true">…</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === current ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-md px-2 text-xs font-medium transition-colors ${
                page === current
                  ? 'bg-brand-700 text-white'
                  : 'text-muted hover:bg-muted-surface hover:text-ink'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= total}
          className={navButton}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
