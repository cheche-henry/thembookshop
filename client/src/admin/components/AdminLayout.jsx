import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X,
  BookOpen, ChevronRight, Bell, Settings, User
} from 'lucide-react'
import { useAuthStore } from '../context/authStore'

const navItems = [
  { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/admin/orders',   label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/products', label: 'Products',   icon: Package },
  { to: '/admin/settings', label: 'Settings',   icon: Settings },
]

function NavItem({ item, collapsed, onClick }) {
  const location = useLocation()
  const active = item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to)

  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
        active
          ? 'bg-green-500/20 text-green-400 font-semibold'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
      {!collapsed && <span className="text-sm">{item.label}</span>}
      {active && !collapsed && <ChevronRight className="w-3.5 h-3.5 ml-auto text-green-500" />}
    </Link>
  )
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/25">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-none">Them Bookshop</p>
          <p className="text-green-400 text-xs mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} item={item} onClick={() => setSidebarOpen(false)} />
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{admin?.name || 'Admin'}</p>
            <p className="text-gray-500 text-xs truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 border-r border-white/10 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-gray-900 border-r border-white/10 flex flex-col z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-gray-500 hover:text-green-400 transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-green-500/30"
            >
              View Store →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
