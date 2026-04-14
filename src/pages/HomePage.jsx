import React, { useState, useEffect } from 'react';
import ProductCard from '../components/common/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Icons from '../components/common/Icons';
import { PRODUCTS } from '../data/mockProducts';

export default function HomePage({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initial load simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      title: "Back to School 2026",
      subtitle: "Get everything you need for the new term",
      cta: "Shop Now",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=500&fit=crop"
    },
    {
      title: "KCPE & KCSE Revision",
      subtitle: "Top-rated revision books to boost your grades",
      cta: "View Revision Guides",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=500&fit=crop"
    },
    {
      title: "Quality Stationery",
      subtitle: "From pens to geometry sets, we have it all",
      cta: "Browse Stationery",
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&h=500&fit=crop"
    }
  ];

  const featuredProducts = PRODUCTS.slice(0, 8);
  const revisionProducts = PRODUCTS.filter(p => p.category === "Revision").slice(0, 4);
  const newArrivals = PRODUCTS.slice(10, 14);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[400px] bg-gray-200 rounded-lg mb-12 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <LoadingSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Slider */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover" 
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl text-white space-y-4 animate-fade-in">
                  <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">{slide.title}</h2>
                  <p className="text-lg md:text-xl text-gray-200">{slide.subtitle}</p>
                  <button 
                    onClick={() => onNavigate?.("shop")}
                    className="bg-primary-600 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors mt-4 inline-flex items-center gap-2"
                  >
                    {slide.cta} <Icons.ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentSlide 
                  ? "bg-white w-8" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Value Props Strip */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Icons.Truck />, title: "Fast Delivery", desc: "Nationwide" },
              { icon: <Icons.Shield />, title: "Original Books", desc: "100% Genuine" },
              { icon: <Icons.CreditCard />, title: "Best Prices", desc: "Competitive Rates" },
              { icon: <Icons.Phone />, title: "M-Pesa Payment", desc: "Secure Checkout" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-2xl text-primary-600">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wide border-l-4 border-primary-600 pl-4">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Primary", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop" },
              { name: "Secondary", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=200&fit=crop" },
              { name: "Revision", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=200&fit=crop" },
              { name: "Storybooks", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop" },
              { name: "Stationery", img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=200&h=200&fit=crop" },
              { name: "Bags", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop" }
            ].map((cat, i) => (
              <button 
                key={i} 
                onClick={() => onNavigate?.("shop")} 
                className="group flex flex-col items-center"
                aria-label={`Shop ${cat.name} category`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 border border-gray-200 group-hover:border-primary-600 transition-colors">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    loading="lazy"
                  />
                </div>
                <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase text-sm">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Featured Products</h2>
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="text-primary-600 font-bold text-sm hover:underline uppercase inline-flex items-center gap-1"
            >
              View All <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-lg overflow-hidden relative h-64 md:h-80">
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover opacity-30" 
              alt="Revision bundle promotion"
              loading="lazy"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <span className="text-yellow-400 font-bold uppercase tracking-widest mb-2">Limited Offer</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Revision Books Bundle</h2>
              <p className="text-gray-200 mb-6 max-w-lg">
                Get complete revision kits for KCPE and KCSE at discounted prices. 
                Prepare effectively for your exams.
              </p>
              <button 
                onClick={() => onNavigate?.("shop")} 
                className="bg-white text-blue-900 px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
              >
                Shop Bundles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Revision Materials */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Exam Revision Materials</h2>
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="text-primary-600 font-bold text-sm hover:underline uppercase inline-flex items-center gap-1"
            >
              View All <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {revisionProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">New Arrivals</h2>
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="text-primary-600 font-bold text-sm hover:underline uppercase inline-flex items-center gap-1"
            >
              View All <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}