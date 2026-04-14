import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/common/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Icons from '../components/common/Icons';
import { PRODUCTS, CATEGORIES, CLASS_LEVELS, SUBJECTS } from '../data/mockProducts';

export default function ShopPage({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", classLevel: "", subject: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Listen for global search events from Navbar
  useEffect(() => {
    const handler = (e) => setSearch(e.detail || "");
    window.addEventListener("global-search", handler);
    return () => window.removeEventListener("global-search", handler);
  }, []);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = search === "" || 
        p.name.toLowerCase().includes(searchLower) || 
        p.subject.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower);
      
      const matchesCategory = filters.category === "" || p.category === filters.category;
      const matchesClass = filters.classLevel === "" || p.classLevel === filters.classLevel;
      const matchesSubject = filters.subject === "" || p.subject === filters.subject;
      
      return matchesSearch && matchesCategory && matchesClass && matchesSubject;
    });
  }, [search, filters]);

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
          Category
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              checked={filters.category === ""} 
              onChange={() => setFilters({ ...filters, category: "" })} 
              className="text-primary-600 focus:ring-primary-500" 
            />
            <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
              All Categories
            </span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="category" 
                checked={filters.category === cat} 
                onChange={() => setFilters({ ...filters, category: cat })} 
                className="text-primary-600 focus:ring-primary-500" 
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Class Level Filter */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
          Class Level
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="classLevel" 
              checked={filters.classLevel === ""} 
              onChange={() => setFilters({ ...filters, classLevel: "" })} 
              className="text-primary-600 focus:ring-primary-500" 
            />
            <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
              All Levels
            </span>
          </label>
          {CLASS_LEVELS.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="classLevel" 
                checked={filters.classLevel === level} 
                onChange={() => setFilters({ ...filters, classLevel: level })} 
                className="text-primary-600 focus:ring-primary-500" 
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject Filter */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
          Subject
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="subject" 
              checked={filters.subject === ""} 
              onChange={() => setFilters({ ...filters, subject: "" })} 
              className="text-primary-600 focus:ring-primary-500" 
            />
            <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
              All Subjects
            </span>
          </label>
          {SUBJECTS.filter(s => s !== "N/A").map((sub) => (
            <label key={sub} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="subject" 
                checked={filters.subject === sub} 
                onChange={() => setFilters({ ...filters, subject: sub })} 
                className="text-primary-600 focus:ring-primary-500" 
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                {sub}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button 
        onClick={() => setFilters({ category: "", classLevel: "", subject: "" })} 
        className="w-full text-sm text-primary-600 font-bold uppercase hover:underline"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 uppercase tracking-wide" aria-label="Breadcrumb">
        <button 
          onClick={() => onNavigate?.("home")} 
          className="hover:text-primary-600 transition-colors"
          aria-label="Go to home"
        >
          Home
        </button>
        <Icons.ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-bold" aria-current="page">Shop</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="lg:hidden flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-sm shadow-sm w-full mb-4"
          aria-expanded={showFilters}
          aria-controls="mobile-filters"
        >
          <Icons.Filter />
          <span className="font-bold uppercase text-sm">Filter Products</span>
          {(filters.category || filters.classLevel || filters.subject) && (
            <span className="bg-primary-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {[filters.category, filters.classLevel, filters.subject].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Mobile Filters Overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setShowFilters(false)}
              aria-hidden="true"
            />
            <div 
              id="mobile-filters"
              className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto animate-slide-in shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold uppercase">Filters</h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                >
                  <Icons.X />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide">Filters</h2>
            <FilterSidebar />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Search & Results Count */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search by title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                aria-label="Search products"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> results
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <LoadingSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState 
              message="No products found" 
              subtext="Try adjusting your filters or search terms" 
              action={() => { 
                setSearch(""); 
                setFilters({ category: "", classLevel: "", subject: "" }); 
              }} 
              actionLabel="Clear Filters" 
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
          
          {/* Pagination Mockup */}
          {!loading && filteredProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex gap-2" aria-label="Pagination">
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  disabled
                  aria-label="Previous page"
                >
                  <Icons.ArrowLeft />
                </button>
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded border border-primary-600 bg-primary-600 text-white font-bold"
                  aria-current="page"
                >
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium">
                  3
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50" aria-label="Next page">
                  <Icons.ArrowRight />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}