import React, { useState } from 'react';
import { formatPrice } from '../../utils/helpers';
import Icons from './Icons';
import useCartStore from '../../store/useCartStore';

export default function ProductCard({ product, onNavigate }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e?.stopPropagation?.();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleQuickView = (e) => {
    e?.stopPropagation?.();
    onNavigate?.("product", product.id);
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-primary-200 flex flex-col h-full">
      <div 
        className="relative overflow-hidden cursor-pointer bg-gray-50 aspect-[3/4]" 
        onClick={() => onNavigate?.("product", product.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate?.("product", product.id)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
          loading="lazy" 
        />
        {product.category === "Revision" && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
            Best Seller
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
           <button 
             onClick={handleQuickView} 
             className="w-full bg-white text-gray-900 text-xs font-bold py-2 rounded shadow hover:bg-gray-100 transition-colors"
           >
             Quick View
           </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{product.category}</span>
        </div>
        <h3 
          className="font-semibold text-gray-900 mb-1 text-sm leading-snug line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors flex-1" 
          onClick={() => onNavigate?.("product", product.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate?.("product", product.id)}
        >
          {product.name}
        </h3>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div className="flex flex-col">
             <span className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</span>
             {product.price > 500 && (
               <span className="text-[10px] text-gray-400 line-through">
                 {formatPrice(Math.round(product.price * 1.1))}
               </span>
             )}
          </div>
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`p-2 rounded-full transition-all duration-200 ${
              added 
                ? "bg-green-500 text-white" 
                : "bg-gray-100 text-gray-900 hover:bg-primary-600 hover:text-white"
            }`}
          >
            {added ? <Icons.Check className="w-4 h-4" /> : <Icons.Cart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}