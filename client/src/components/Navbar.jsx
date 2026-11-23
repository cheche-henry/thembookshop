import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, BookOpen, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '../context/cartStore'

const links = [
  { label: 'Shop', to: '/shop' },
  { label: 'Textbooks', to: '/shop?category=Books&subcategory=Textbooks' },
  { label: 'Revision', to: '/shop?subcategory=Revision+%26+Exam+Prep' },
  { label: 'Stationery', to: '/shop?category=Stationery' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0))
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  const handleSearch = (event) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    navigate(`/shop?search=${encodeURIComponent(query)}`)
    setMobileOpen(false)
  }

  const isActive = (to) => {
    if (to === '/shop') return location.pathname === '/shop' && !location.search
    return false
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="container-page">
        <div className="flex h-16 items-center gap-4 lg:h-[72px]">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2.5" aria-label="Them Bookshop home">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-800">
              <BookOpen className="h-[18px] w-[18px] text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-[19px] font-semibold leading-none tracking-[-0.01em] text-ink">
              Them <span className="text-brand-800">Bookshop</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 justify-center md:flex" role="search">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search titles, subjects, grades"
                aria-label="Search products"
                className="h-10 w-full rounded-md border border-line bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-brand-700 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-700/20"
              />
            </div>
          </form>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(link.to)
                    ? 'font-medium text-brand-800'
                    : 'text-body hover:bg-muted-surface hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <Link
              to="/cart"
              className="relative flex h-10 items-center gap-2 rounded-md border border-line-strong px-3 text-sm font-medium text-ink transition-colors hover:border-brand-700 hover:text-brand-800"
              aria-label={`Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-semibold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-muted-surface lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div id="mobile-nav" className="border-t border-line py-4 lg:hidden">
            <form onSubmit={handleSearch} role="search" className="mb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search titles, subjects, grades"
                  aria-label="Search products"
                  className="h-11 w-full rounded-md border border-line bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-brand-700 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-700/20"
                />
              </div>
            </form>

            <nav className="flex flex-col" aria-label="Mobile">
              <Link to="/" className="rounded-md px-3 py-2.5 text-sm text-body hover:bg-muted-surface hover:text-ink">Home</Link>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-md px-3 py-2.5 text-sm text-body hover:bg-muted-surface hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/cart" className="rounded-md px-3 py-2.5 text-sm text-body hover:bg-muted-surface hover:text-ink">
                Cart{totalItems > 0 ? ` (${totalItems})` : ''}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
