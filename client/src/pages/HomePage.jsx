import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Package, Star, Truck, Shield, Phone } from 'lucide-react'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

const featuredCategories = [
  {
    title: 'Primary School',
    subtitle: 'Grade 1 – 6',
    description: 'CBC-aligned textbooks and materials for junior learners',
    emoji: '📚',
    color: 'from-sky-400 to-sky-500',
    bg: 'bg-sky-50',
    link: '/shop?category=Textbooks&level=primary',
  },
  {
    title: 'Secondary School',
    subtitle: 'Form 1 – 4',
    description: 'KCSE prep books, textbooks, and revision guides',
    emoji: '🎓',
    color: 'from-brand-400 to-brand-600',
    bg: 'bg-brand-50',
    link: '/shop?category=Textbooks&level=secondary',
  },
  {
    title: 'Stationery',
    subtitle: 'All Grades',
    description: 'Exercise books, pens, geometry sets, school bags & more',
    emoji: '✏️',
    color: 'from-amber-400 to-amber-500',
    bg: 'bg-amber-50',
    link: '/shop?category=Exercise+Books',
  },
]

const highlights = [
  { icon: Truck, title: 'Countrywide Delivery', desc: 'We deliver to all 47 counties in Kenya' },
  { icon: Shield, title: 'Genuine Products', desc: 'All books are government-approved editions' },
  { icon: Phone, title: 'M-Pesa Payments', desc: 'Easy and secure mobile money checkout' },
  { icon: Star, title: 'Trusted by Schools', desc: 'Serving 10,000+ students across Kenya' },
]

const featured = products.filter((p) => p.badge === 'Best Seller').slice(0, 4)
const newArrivals = products.filter((p) => p.badge === 'New' || p.badge === 'New Edition').slice(0, 4)

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-sky-700 text-white">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-display font-semibold mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Back to School 2025 — Up to 20% Off Selected Items
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
              All Your School<br />Needs in One Place
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
              Quality textbooks, exercise books, stationery, and school supplies — delivered to your door anywhere in Kenya.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-brand-700 font-display font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?category=Revision+Books" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-display font-semibold px-6 py-3 rounded-xl transition-colors border border-white/30">
                Revision Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Back to School Banner ─────────────────────────────── */}
      <div className="bg-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display font-bold text-amber-900 text-sm">
            🎒 Back to School Sale — Stock up now before school reopens!
          </p>
          <Link to="/shop" className="text-xs font-display font-bold text-amber-900 underline hover:no-underline">
            View All Offers →
          </Link>
        </div>
      </div>

      {/* ── Trust Highlights ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="font-display font-bold text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Featured Categories ───────────────────────────────── */}
        <section className="py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.title}
                to={cat.link}
                className={`${cat.bg} rounded-xl2 p-6 hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1`}
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="font-display font-bold text-gray-800 text-lg">{cat.title}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-2">{cat.subtitle}</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{cat.description}</p>
                <div className="flex items-center gap-1 text-brand-600 text-sm font-display font-bold group-hover:gap-2 transition-all">
                  Browse <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Best Sellers ──────────────────────────────────────── */}
        <section className="py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="text-sm text-gray-500 mt-1">Most popular items this term</p>
            </div>
            <Link to="/shop" className="text-brand-600 font-display font-semibold text-sm hover:text-brand-800 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* ── Promo Banner ──────────────────────────────────────── */}
        <section className="py-8">
          <div className="bg-gradient-to-r from-sky-100 to-brand-100 rounded-xl2 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">📦</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">
                Buy More, Save More
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Purchase 5 or more items and get free delivery anywhere in Kenya. Perfect for school supply runs!
              </p>
            </div>
            <Link to="/shop" className="btn-primary whitespace-nowrap">
              Shop Now
            </Link>
          </div>
        </section>

        {/* ── New Arrivals ──────────────────────────────────────── */}
        <section className="py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="text-sm text-gray-500 mt-1">Latest additions to our store</p>
            </div>
            <Link to="/shop" className="text-brand-600 font-display font-semibold text-sm hover:text-brand-800 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
