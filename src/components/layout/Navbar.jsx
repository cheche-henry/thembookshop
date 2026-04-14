import React, { useState } from 'react';
import Icons from '../common/Icons';
import useCartStore from '../../store/useCartStore';
import { CATEGORIES } from '../../data/mockProducts';

export default function Navbar({ onNavigate }) {
  const cartCount = useCartStore((s) => s.getCartCount());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      onNavigate?.("shop");
      window.dispatchEvent(new CustomEvent("global-search", { detail: search }));
      setSearch("");
    }
  };

  const handleCategoryClick = (category) => {
    onNavigate?.("shop");
    // Could dispatch filter event here for future implementation
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* Top Bar - Contact & Promo */}
      <div className="bg-blue-900 text-white text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Icons.Phone className="w-3 h-3" /> +254 700 123 456
            </span>
            <span className="hidden lg:inline">✉️ info@thembookshop.co.ke</span>
          </div>
          <div className="flex gap-4">
            <span className="font-medium">🚚 Free Delivery for orders over KES 5,000</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate?.("home")} 
            className="flex items-center gap-3 group"
            aria-label="Them Bookshop Home"
          >
            <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
              <Icons.Book className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-extrabold text-gray-900 leading-none tracking-tight">
                THEM<span className="text-primary-600">BOOKSHOP</span>
              </span>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Educational Supplies</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 ml-8">
            <button 
              onClick={() => onNavigate?.("home")} 
              className="text-sm font-bold text-gray-900 hover:text-primary-600 uppercase tracking-wide transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="text-sm font-bold text-gray-900 hover:text-primary-600 uppercase tracking-wide transition-colors"
            >
              Shop All
            </button>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button 
                className="text-sm font-bold text-gray-900 hover:text-primary-600 uppercase tracking-wide transition-colors flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Categories <Icons.ChevronRight className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                {CATEGORIES.map((cat, index) => (
                  <button 
                    key={cat} 
                    onClick={() => handleCategoryClick(cat)}
                    className={`block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors ${
                      index < CATEGORIES.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="text-sm font-bold text-gray-900 hover:text-primary-600 uppercase tracking-wide transition-colors"
            >
              New Arrivals
            </button>
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="text-sm font-bold text-primary-600 uppercase tracking-wide transition-colors"
            >
              Offers
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-1.5 w-64 focus-within:ring-1 focus-within:ring-primary-500 focus-within:bg-white transition-all">
              <Icons.Search className="text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-400"
                aria-label="Search products"
              />
            </form>

            {/* Cart Button */}
            <button 
              onClick={() => onNavigate?.("cart")} 
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <Icons.Cart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenu(!mobileMenu)} 
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label={mobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-fadeIn bg-white">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-md px-3 py-2 mb-4 mx-4">
              <Icons.Search className="text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="bg-transparent border-none outline-none ml-2 w-full text-sm"
                aria-label="Search products"
              />
            </form>
            <div className="flex flex-col gap-1 px-4">
              <button 
                onClick={() => { onNavigate?.("home"); setMobileMenu(false); }} 
                className="text-left px-4 py-3 text-gray-900 font-bold hover:bg-gray-50 rounded-lg transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => { onNavigate?.("shop"); setMobileMenu(false); }} 
                className="text-left px-4 py-3 text-gray-900 font-bold hover:bg-gray-50 rounded-lg transition-colors"
              >
                Shop All
              </button>
              <button 
                onClick={() => { onNavigate?.("cart"); setMobileMenu(false); }} 
                className="text-left px-4 py-3 text-gray-900 font-bold hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cart ({cartCount})
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Secondary Nav - Popular Tags */}
      <div className="hidden lg:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 py-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Popular:</span>
            {[
              "Grade 1 Books", 
              "Form 1 Books", 
              "KCPE Revision", 
              "KCSE Revision", 
              "Math Sets", 
              "Calculators"
            ].map((tag, i) => (
              <button 
                key={i} 
                onClick={() => onNavigate?.("shop")} 
                className="text-xs font-medium text-gray-700 hover:text-primary-600 whitespace-nowrap transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}