import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// ── Store layout ──────────────────────────────────────────────────────────────
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminLayout from './admin/components/AdminLayout'
import AdminRoute from './admin/components/AdminRoute'
import LoginPage from './admin/pages/LoginPage'
import DashboardPage from './admin/pages/DashboardPage'
import OrdersPage from './admin/pages/OrdersPage'
import OrderDetailPage from './admin/pages/OrderDetailPage'
import ProductsPage from './admin/pages/ProductsPage'
import ProductFormPage from './admin/pages/ProductFormPage'
import SettingsPage from './admin/pages/SettingsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ── Public admin login (no layout) ───────────────────────────── */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ── Protected admin routes ───────────────────────────────────── */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route index                         element={<DashboardPage />} />
                <Route path="orders"                 element={<OrdersPage />} />
                <Route path="orders/:id"             element={<OrderDetailPage />} />
                <Route path="products"               element={<ProductsPage />} />
                <Route path="products/new"           element={<ProductFormPage />} />
                <Route path="products/:id/edit"      element={<ProductFormPage />} />
                <Route path="settings"               element={<SettingsPage />} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
        } />

        {/* ── Public store routes ──────────────────────────────────────── */}
        <Route path="/*" element={
          <StoreLayout>
            <Routes>
              <Route path="/"            element={<HomePage />} />
              <Route path="/shop"        element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart"        element={<CartPage />} />
              <Route path="/checkout"    element={<CheckoutPage />} />
            </Routes>
          </StoreLayout>
        } />
      </Routes>
    </>
  )
}
