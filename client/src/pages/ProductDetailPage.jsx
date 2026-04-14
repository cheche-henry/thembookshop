import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice, generateSKU } from '../utils/helpers';
import Icons from '../components/common/Icons';
import ProductCard from '../components/common/ProductCard';
import EmptyState from '../components/common/EmptyState';
import useCartStore from '../store/useCartStore';
import { PRODUCTS } from '../data/mockProducts';

export default function ProductDetailPage({ productId }) {
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState 
          message="Product not found" 
          subtext="The product you're looking for doesn't exist." 
          action={() => navigate('/shop')} 
          actionLabel="Back to Shop" 
        />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = PRODUCTS.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 uppercase tracking-wide" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <Icons.ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
        <Icons.ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-bold truncate" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-8 flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-w-full max-h-[500px] object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          
          {/* Rating & Stock */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => <Icons.Star key={i} className="w-4 h-4" />)}
            </div>
            <span className="text-sm text-gray-500">(124 Reviews)</span>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <Icons.Check className="w-4 h-4" /> In Stock
            </span>
          </div>

          {/* Price */}
          <div className="text-4xl font-bold text-primary-600 mb-6">
            {formatPrice(product.price)}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-8 text-lg">
            {product.description}
          </p>

          {/* Product Meta */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {product.classLevel !== "N/A" && product.classLevel !== "All Levels" && (
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Class Level</span>
                <span className="font-semibold text-gray-900">{product.classLevel}</span>
              </div>
            )}
            {product.subject !== "N/A" && (
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Subject</span>
                <span className="font-semibold text-gray-900">{product.subject}</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-sm w-max" role="group" aria-label="Quantity selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="px-4 py-3 hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Icons.Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-gray-900" aria-live="polite">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="px-4 py-3 hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Icons.Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
                added 
                  ? "bg-green-600 text-white" 
                  : "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg"
              }`}
              aria-live="polite"
            >
              {added ? (
                <><Icons.Check className="w-5 h-5" /> Added to Cart</>
              ) : (
                <><Icons.Cart className="w-5 h-5" /> Add to Cart</>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6 space-y-2 text-sm text-gray-500">
            <p>
              <span className="font-bold text-gray-900">SKU:</span> {generateSKU(product.name, product.id)}
            </p>
            <p>
              <span className="font-bold text-gray-900">Category:</span> {product.category}
            </p>
            <p>
              <span className="font-bold text-gray-900">Tags:</span> School, Education, {product.subject}
            </p>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onNavigate={(page, id) => navigate(page === 'product' ? `/product/${id}` : `/${page}`)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}