import { ChevronLeft, ChevronRight } from 'lucide-react'

// Compact pagination: 1 … 4 5 6 … 20
function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current, current - 1, current + 1])
  const list = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)

  const result = []
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
}

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total_pages <= 1) return null
  const { current_page, total_pages, total_count, per_page } = meta
  const from = (current_page - 1) * per_page + 1
  const to   = Math.min(current_page * per_page, total_count)

  return (
    <div className="flex items-center justify-between px-1 mt-4">
      <p className="text-xs text-gray-500">
        Showing <span className="text-gray-300">{from}–{to}</span> of <span className="text-gray-300">{total_count}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageWindow(current_page, total_pages).map((page, i) =>
          page === '…' ? (
            <span key={`gap-${i}`} className="w-6 text-center text-gray-600 text-xs">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                page === current_page
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === total_pages}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
