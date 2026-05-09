import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, BookOpen, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '../context/cartStore'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setMobileOpen(false) }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-lg text-green-700 block" style={{fontFamily:'Nunito,sans-serif'}}>Them</span>
              <span className="font-semibold text-xs text-green-500 block -mt-0.5" style={{fontFamily:'Nunito,sans-serif'}}>Bookshop</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm bg-gray-50" placeholder="Search books, stationery…" />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            {[{label:'Home',to:'/'},{label:'Shop',to:'/shop'}].map(l => (
              <Link key={l.to} to={l.to} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${location.pathname===l.to ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`} style={{fontFamily:'Nunito,sans-serif'}}>{l.label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl transition-colors shadow-sm">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-semibold text-sm hidden sm:block" style={{fontFamily:'Nunito,sans-serif'}}>Cart</span>
              {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center shadow">{totalItems}</span>}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm bg-gray-50" placeholder="Search…" />
              </div>
              <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-xl text-sm font-semibold">Go</button>
            </form>
            {[{label:'Home',to:'/'},{label:'Shop',to:'/shop'}].map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-xl font-semibold text-sm ${location.pathname===l.to ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`} style={{fontFamily:'Nunito,sans-serif'}}>{l.label}</Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
