import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, BookOpen, Settings, User, ExternalLink,
} from 'lucide-react'
import { useAuthStore } from '../context/authStore'

const navItems = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/orders',   label: 'Orders',    icon: ShoppingBag },
  { to: '/admin/products', label: 'Products',  icon: Package },
  { to: '/admin/settings', label: 'Settings',  icon: Settings },
]

const sectionTitles = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/products': 'Products',
  '/admin/settings': 'Settings',
}

function NavItem({ item, onClick }) {
  const location = useLocation()
  const active = item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to)

  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
        active
          ? 'bg-white/10 font-medium text-white'
          : 'text-white/55 hover:bg-white/5 hover:text-white'
      }`}
    >
      <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-brand-300' : 'text-white/40'}`} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const currentTitle = sectionTitles[location.pathname]
    || (location.pathname.startsWith('/admin/orders') ? 'Orders' : 'Products')

  const Sidebar = ({ onNavigate }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand-600">
          <BookOpen className="h-[18px] w-[18px] text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold leading-none text-white">Them Bookshop</p>
          <p className="mt-1 text-[11px] text-white/40">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {navItems.map((item) => <NavItem key={item.to} item={item} onClick={onNavigate} />)}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-md bg-white/5 px-3 py-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-white/10">
            <User className="h-3.5 w-3.5 text-white/60" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">{admin?.name || 'Admin'}</p>
            <p className="truncate text-[11px] text-white/40">{admin?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-white/55 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <a href="#admin-main" className="skip-link">Skip to content</a>

      <aside className="hidden w-60 flex-shrink-0 border-r border-white/10 bg-[#16201B] lg:flex lg:flex-col">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-ink/50"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative flex h-full w-64 flex-col bg-[#16201B]">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-muted-surface hover:text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <p className="text-[13px] font-medium text-ink">{currentTitle}</p>

          <Link
            to="/"
            target="_blank"
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-brand-800"
          >
            View store <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </header>

        <main id="admin-main" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
