import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, AlertCircle } from 'lucide-react'
import { useFilters } from '../hooks/useFilters'
import FilterSidebar from '../components/FilterSidebar'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/SkeletonCard'
import { EmptySearch } from '../components/EmptyState'

export default function ShopPage() {
  const [searchParams]         = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Read initial values from URL params
  const initialSearch   = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'all'

  const {
    search, setSearch,
    category, setCategory,
    classLevel, setClassLevel,
    subject, setSubject,
    products, loading, error,
    meta, page, setPage,
    reset, hasFilters,
  } = useFilters(initialSearch, initialCategory)

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Our Products</h1>
        <p className="text-gray-500 text-sm">
          {loading
            ? 'Loading…'
            : meta
              ? `${meta.total_count} product${meta.total_count !== 1 ? 's' : ''} found`
              : `${products.length} product${products.length !== 1 ? 's' : ''} found`
          }
        </p>
      </div>

      {/* Search bar + mobile filter button */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, subjects, class levels…"
            className="input pl-10 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center gap-2 btn-secondary text-sm py-2 px-4"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
        </button>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category !== 'all' && <Chip label={category} onRemove={() => setCategory('all')} />}
          {classLevel !== 'all' && <Chip label={classLevel} onRemove={() => setClassLevel('all')} />}
          {subject !== 'all' && <Chip label={subject} onRemove={() => setSubject('all')} />}
          {search && <Chip label={`"${search}"`} onRemove={() => setSearch('')} />}
          <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 underline font-display">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          category={category} setCategory={setCategory}
          classLevel={classLevel} setClassLevel={setClassLevel}
          subject={subject} setSubject={setSubject}
          hasFilters={hasFilters} reset={reset}
          mobileOpen={mobileFiltersOpen}
          setMobileOpen={setMobileFiltersOpen}
        />

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* API error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <SkeletonGrid count={8} />
          ) : products.length === 0 ? (
            <EmptySearch onReset={reset} />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                        p === page
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-display font-semibold px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
