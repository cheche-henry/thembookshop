import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Phone, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/SkeletonCard'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const featuredCategories = [
  {
    title: 'Primary School', subtitle: 'Grade 1 – 6',
    description: 'CBC-aligned textbooks and materials for junior learners',
    emoji: '📚', bg: 'bg-sky-50',
    link: '/shop?category=Textbooks',
  },
  {
    title: 'Secondary School', subtitle: 'Form 1 – 4',
    description: 'KCSE prep books, textbooks, and revision guides',
    emoji: '🎓', bg: 'bg-green-50',
    link: '/shop?category=Revision+Books',
  },
  {
    title: 'Stationery', subtitle: 'All Grades',
    description: 'Exercise books, pens, geometry sets, school bags & more',
    emoji: '✏️', bg: 'bg-amber-50',
    link: '/shop?category=Exercise+Books',
  },
]

const highlights = [
  { icon: Truck,  title: 'Countrywide Delivery', desc: 'We deliver to all 47 counties in Kenya' },
  { icon: Shield, title: 'Genuine Products',     desc: 'All books are government-approved editions' },
  { icon: Phone,  title: 'M-Pesa Payments',      desc: 'Easy and secure mobile money checkout' },
  { icon: Star,   title: 'Trusted by Schools',   desc: 'Serving 10,000+ students across Kenya' },
]

function useHomeProducts() {
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/v1/products?per_page=4`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/products?per_page=4&page=2`).then(r => r.json()),
    ]).then(([best, newOnes]) => {
      setBestSellers(best.data || [])
      setNewArrivals(newOnes.data || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { bestSellers, newArrivals, loading }
}

export default function HomePage() {
  const { bestSellers, newArrivals, loading } = useHomeProducts()

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-sky-700 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-semibold mb-6" style={{fontFamily:'Nunito,sans-serif'}}>
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Back to School 2025 — Up to 20% Off Selected Items
            </div>
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
              All Your School<br />Needs in One Place
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
              Quality textbooks, exercise books, stationery, and school supplies — delivered to your door anywhere in Kenya.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg" style={{fontFamily:'Nunito,sans-serif'}}>
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?category=Revision+Books" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/30" style={{fontFamily:'Nunito,sans-serif'}}>
                Revision Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <div className="bg-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold text-amber-900 text-sm" style={{fontFamily:'Nunito,sans-serif'}}>
            🎒 Back to School Sale — Stock up now before school reopens!
          </p>
          <Link to="/shop" className="text-xs font-bold text-amber-900 underline hover:no-underline" style={{fontFamily:'Nunito,sans-serif'}}>
            View All Offers →
          </Link>
        </div>
      </div>

      {/* Trust highlights */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm" style={{fontFamily:'Nunito,sans-serif'}}>{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Categories */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6" style={{fontFamily:'Nunito,sans-serif'}}>Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredCategories.map((cat) => (
              <Link key={cat.title} to={cat.link} className={`${cat.bg} rounded-2xl p-6 hover:shadow-md transition-all duration-300 group hover:-translate-y-1`}>
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="font-bold text-gray-800 text-lg" style={{fontFamily:'Nunito,sans-serif'}}>{cat.title}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-2">{cat.subtitle}</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{cat.description}</p>
                <div className="flex items-center gap-1 text-green-600 text-sm font-bold group-hover:gap-2 transition-all" style={{fontFamily:'Nunito,sans-serif'}}>
                  Browse <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>Featured Products</h2>
              <p className="text-sm text-gray-500 mt-1">From our store</p>
            </div>
            <Link to="/shop" className="text-green-600 font-semibold text-sm hover:text-green-800 flex items-center gap-1" style={{fontFamily:'Nunito,sans-serif'}}>
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? <SkeletonGrid count={4} /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Promo banner */}
        <section className="py-8">
          <div className="bg-gradient-to-r from-sky-100 to-green-100 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">📦</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-2xl text-gray-800 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>Buy More, Save More</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Purchase items worth KES 2,000 or more and get free delivery anywhere in Kenya!
              </p>
            </div>
            <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap shadow-sm" style={{fontFamily:'Nunito,sans-serif'}}>
              Shop Now
            </Link>
          </div>
        </section>

        {/* More Products */}
        {!loading && newArrivals.length > 0 && (
          <section className="py-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>More Products</h2>
                <p className="text-sm text-gray-500 mt-1">Keep exploring</p>
              </div>
              <Link to="/shop" className="text-green-600 font-semibold text-sm hover:text-green-800 flex items-center gap-1" style={{fontFamily:'Nunito,sans-serif'}}>
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
