import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import Icons from '../components/common/Icons';
import EmptyState from '../components/common/EmptyState';
import useCartStore from '../store/useCartStore';

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.cart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const getCartTotal = useCartStore((s) => s.getCartTotal);

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 min-h-[60vh]">
        <EmptyState 
          message="Your cart is empty" 
          subtext="Looks like you haven't added anything yet." 
          action={() => navigate('/shop')} 
          actionLabel="Start Shopping" 
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 uppercase tracking-wide">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th scope="col" className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover mix-blend-multiply"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center border border-gray-300 rounded-sm w-max bg-white" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Icons.Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Icons.Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Icons.Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-200 pb-4">
              Cart Totals
            </h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-bold text-primary-600 text-xl">{formatPrice(total)}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')} 
              className="w-full bg-primary-600 text-white py-4 rounded-sm font-bold uppercase tracking-wider hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Checkout <Icons.ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-4 flex justify-center gap-2">
               <div className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-green-600">M-PESA</div>
               <div className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-blue-600">VISA</div>
               <div className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-orange-600">MASTERCARD</div>
            </div>
            <button 
              onClick={() => navigate('/shop')}
              className="w-full mt-4 text-primary-600 font-medium py-2 hover:text-primary-700 transition-colors text-sm"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}