import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Search, SlidersHorizontal, X } from 'lucide-react'
import { useFilters } from '../hooks/useFilters'
import FilterSidebar from '../components/FilterSidebar'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/SkeletonCard'
import { EmptySearch } from '../components/EmptyState'
import Pagination from '../components/ui/Pagination'
import { Button } from '../components/ui/Button'

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const initial = {
    search:      searchParams.get('search') || '',
    category:    searchParams.get('category') || 'all',
    subcategory: searchParams.get('subcategory') || 'all',
    stage:       searchParams.get('stage') || 'all',
    classLevel:  searchParams.get('class_level') || 'all',
    subject:     searchParams.get('subject') || 'all',
    subsubject:  searchParams.get('subsubject') || 'all',
    page:        Math.max(1, Number(searchParams.get('page')) || 1),
  }

  const {
    search, setSearch,
    category, setCategory,
    subcategory, setSubcategory,
    stage, setStage,
    classLevel, setClassLevel,
    subject, setSubject,
    subsubject, setSubsubject,
    products, loading, error,
    meta, facets, page, setPage,
    reset, refetch, hasFilters,
  } = useFilters(initial)

  const resultCount = meta?.total_count ?? products.length
  const resultLabel = loading
    ? 'Loading products'
    : `${resultCount} ${resultCount === 1 ? 'product' : 'products'}`

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-[34px]">Shop</h1>
        </div>
        <p className="text-sm text-muted" aria-live="polite">{resultLabel}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles, subjects and class levels"
            aria-label="Search products"
            className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-10 text-sm text-ink placeholder:text-muted/80 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted hover:bg-muted-surface hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 text-sm font-medium text-ink lg:hidden"
          aria-haspopup="dialog"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-brand-700" aria-label="Filters applied" />}
        </button>
      </div>

      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {category !== 'all' && <Chip label={category} onRemove={() => setCategory('all')} />}
          {subcategory !== 'all' && <Chip label={subcategory} onRemove={() => setSubcategory('all')} />}
          {stage !== 'all' && <Chip label={stage} onRemove={() => setStage('all')} />}
          {classLevel !== 'all' && <Chip label={classLevel} onRemove={() => setClassLevel('all')} />}
          {subject !== 'all' && <Chip label={subject} onRemove={() => setSubject('all')} />}
          {subsubject !== 'all' && <Chip label={subsubject} onRemove={() => setSubsubject('all')} />}
          {search && <Chip label={`“${search}”`} onRemove={() => setSearch('')} />}
          <button
            type="button"
            onClick={reset}
            className="ml-1 text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-10">
        <FilterSidebar
          category={category} setCategory={setCategory}
          subcategory={subcategory} setSubcategory={setSubcategory}
          stage={stage} setStage={setStage}
          classLevel={classLevel} setClassLevel={setClassLevel}
          subject={subject} setSubject={setSubject}
          subsubject={subsubject} setSubsubject={setSubsubject}
          facets={facets}
          hasFilters={hasFilters} reset={reset}
          mobileOpen={mobileFiltersOpen}
          setMobileOpen={setMobileFiltersOpen}
        />

        <div className="min-w-0 flex-1">
          {error && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-danger/30 bg-[#fdf3f2] px-4 py-3 text-sm text-danger">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {error}
              </span>
              <Button variant="secondary" size="sm" onClick={refetch}>Try again</Button>
            </div>
          )}

          {loading ? (
            <SkeletonGrid count={8} />
          ) : products.length === 0 ? (
            <EmptySearch onReset={reset} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination meta={meta} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface px-2 py-1 text-xs text-body">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded p-0.5 text-muted transition-colors hover:bg-muted-surface hover:text-ink"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
