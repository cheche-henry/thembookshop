import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

const shopLinks = [
  { label: 'All products', to: '/shop' },
  { label: 'Textbooks', to: '/shop?category=Books&subcategory=Textbooks' },
  { label: 'Revision & exam prep', to: '/shop?subcategory=Revision+%26+Exam+Prep' },
  { label: 'Stationery', to: '/shop?category=Stationery' },
]

const levelLinks = [
  { label: 'PP1 – PP2', to: '/shop?stage=Pre-Primary' },
  { label: 'Grade 1 – 3', to: '/shop?stage=Lower%20Primary' },
  { label: 'Grade 4 – 6', to: '/shop?stage=Upper%20Primary' },
  { label: 'Form 1 – 4', to: '/shop?stage=Secondary%20(8-4-4)' },
]

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-white">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 lg:max-w-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-700">
                <BookOpen className="h-[18px] w-[18px] text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-semibold text-white">Them Bookshop</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Textbooks, readers, revision guides and stationery for Kenyan primary and secondary learners.
            </p>
            <dl className="mt-6 space-y-1.5 text-sm text-white/70">
              <div className="flex gap-2">
                <dt className="text-white/40">Payment</dt>
                <dd>M-Pesa at checkout</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-white/40">Delivery</dt>
                <dd>Free on all orders</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="eyebrow text-white/40">Shop</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-white/40">Browse by level</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {levelLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Them Bookshop. All rights reserved.</p>
          <p>Prices in Kenyan shillings.</p>
        </div>
      </div>
    </footer>
  )
}
