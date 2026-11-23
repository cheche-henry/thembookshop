import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Search, Smartphone, Truck } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/SkeletonCard'
import { CLASS_LEVELS } from '../utils/catalogue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const PROMISES = [
  { icon: Smartphone, title: 'Pay with M-Pesa', body: 'Checkout sends a payment request straight to your phone.' },
  { icon: Truck, title: 'Free delivery', body: 'Delivery is included on every order.' },
  { icon: BookOpen, title: 'Browse by grade', body: 'Filter the catalogue by class level and subject.' },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [facets, setFacets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [listRes, facetRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/products?per_page=8`),
          fetch(`${API_BASE}/api/v1/products/facets`),
        ])
        const list = await listRes.json()
        const facetData = await facetRes.json()
        if (cancelled) return
        setProducts(list.data || [])
        if (facetData.success) setFacets(facetData.data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/shop?search=${encodeURIComponent(value)}` : '/shop')
  }

  const levels = facets?.levels?.length
    ? facets.levels
    : CLASS_LEVELS.map((name) => ({ name, count: null }))

  const subjects = facets?.subjects?.length ? facets.subjects.slice(0, 8) : []
  const covers = products.filter((product) => product.image_url).slice(0, 3)

  return (
    <div>
      {/* Front table */}
      <section className="border-b border-line bg-paper">
        <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">School books and supplies · Kenya</p>
            <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.12] tracking-[-0.015em] text-ink sm:text-[44px]">
              Books for the school year, in one place.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
              Textbooks, readers, revision guides and stationery for primary and secondary learners.
              Find what you need by title, subject or class level.
            </p>

            <form onSubmit={handleSearch} role="search" className="mt-8 flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for a title, subject or grade"
                  aria-label="Search the catalogue"
                  className="h-12 w-full rounded-md border border-line-strong bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
                />
              </div>
              <button
                type="submit"
                className="h-12 rounded-md bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-muted">Jump to</span>
              <Link to="/shop?category=Books&subcategory=Textbooks" className="text-brand-800 underline-offset-4 hover:underline">Textbooks</Link>
              <Link to="/shop?subcategory=Revision+%26+Exam+Prep" className="text-brand-800 underline-offset-4 hover:underline">Revision</Link>
              <Link to="/shop?category=Stationery" className="text-brand-800 underline-offset-4 hover:underline">Stationery</Link>
            </div>
          </div>

          <div className="hidden lg:block">
            {covers.length > 0 ? (
              <div className="grid grid-cols-3 items-end gap-4">
                {covers.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="block border border-line bg-surface p-2 transition-colors hover:border-line-strong"
                  >
                    <div className="aspect-[2/3] bg-muted-surface">
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col justify-between border border-line bg-surface p-8">
                <BookOpen className="h-8 w-8 text-line-strong" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-semibold text-ink">The shelves are open.</p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                    Browse the catalogue by department, class level or subject.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shop by level */}
      <section className="container-page py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Class levels</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-[28px]">Shop by grade</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-brand-800 hover:underline">
            All products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 border-t border-line sm:grid-cols-3 lg:grid-cols-6">
          {levels.map((level) => (
            <Link
              key={level.name}
              to={`/shop?class_level=${encodeURIComponent(level.name)}`}
              className="flex items-baseline justify-between gap-2 border-b border-line py-3 text-sm text-body transition-colors hover:text-brand-800"
            >
              <span>{level.name}</span>
              {level.count != null && <span className="text-xs tabular-nums text-muted">{level.count}</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by subject */}
      {subjects.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="container-page py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Subjects</p>
                <h2 className="mt-2 text-2xl font-semibold sm:text-[28px]">Shop by subject</h2>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-brand-800 hover:underline">
                See the catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-8 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map((subject) => (
                <Link
                  key={subject.name}
                  to={`/shop?subject=${encodeURIComponent(subject.name)}`}
                  className="flex items-baseline justify-between gap-2 border-b border-line py-3 text-sm text-body transition-colors hover:text-brand-800"
                >
                  <span>{subject.name}</span>
                  <span className="text-xs tabular-nums text-muted">{subject.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalogue */}
      <section className="container-page py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-[28px]">Books and supplies</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-brand-800 hover:underline">
            View all products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : error ? (
            <div className="border border-line bg-surface px-6 py-10 text-center">
              <p className="text-sm text-muted">The catalogue could not be loaded. Check your connection and try again.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 text-sm font-medium text-brand-800 hover:underline"
              >
                Reload the page
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
              <p className="text-sm text-muted">No products are listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* What we can promise */}
      <section className="border-t border-line bg-surface">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-700" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
