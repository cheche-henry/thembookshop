import { ChevronLeft, ChevronRight } from 'lucide-react'

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
        {Array.from({ length: Math.min(total_pages, 7) }, (_, i) => {
          const page = i + 1
          return (
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
        })}
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
