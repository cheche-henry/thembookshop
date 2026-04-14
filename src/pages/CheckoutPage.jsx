import React, { useState } from 'react';
import { formatPrice, validatePhone } from '../utils/helpers';
import Icons from '../components/common/Icons';
import EmptyState from '../components/common/EmptyState';
import useCartStore from '../store/useCartStore';

export default function CheckoutPage({ onNavigate }) {
  const cart = useCartStore((s) => s.cart);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = getCartTotal();

  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if cart is empty and no order placed
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 min-h-[60vh]">
        <EmptyState 
          message="Your cart is empty" 
          subtext="Add some items before checkout." 
          action={() => onNavigate?.("shop")} 
          actionLabel="Shop Now" 
        />
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!validatePhone(form.phone)) {
      errs.phone = "Enter valid M-Pesa number (07XXXXXXXX or 01XXXXXXXX)";
    }
    if (!form.location.trim()) errs.location = "Delivery location is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // TODO: Backend integration point
    // 1. Create order in database
    // 2. Trigger M-Pesa STK Push via Daraja API
    // 3. Handle callback/webhook for payment confirmation
    
    setOrderPlaced(true);
    clearCart();
    setSubmitting(false);
  };

  // Order Success View
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-2">Thank you, <span className="font-semibold">{form.name}</span>!</p>
          <p className="text-gray-600 mb-6">
            You will receive an M-Pesa prompt on <span className="font-semibold">{form.phone}</span> shortly. 
            Once payment is confirmed, your order will be delivered to <span className="font-semibold">{form.location}</span>.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-200">
            <p className="text-sm text-gray-500 mb-1 uppercase font-bold">Order Total</p>
            <p className="text-2xl font-bold text-primary-600">{formatPrice(total)}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate?.("shop")} 
              className="bg-primary-600 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors w-full"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => window.print()}
              className="text-gray-600 font-medium py-2 hover:text-gray-900 transition-colors text-sm"
            >
              Print Order Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 uppercase tracking-wide">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Customer Information */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-200 pb-4">
                Billing Details
              </h2>
              <div className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1 uppercase">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icons.User className="w-4 h-4" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-sm outline-none transition-all ${
                        errors.name 
                          ? "border-red-500 ring-1 ring-red-500" 
                          : "border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      }`}
                      placeholder="John Doe"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-xs mt-1" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1 uppercase">
                    Phone Number (M-Pesa) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icons.Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ 
                        ...form, 
                        phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) 
                      })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-sm outline-none transition-all ${
                        errors.phone 
                          ? "border-red-500 ring-1 ring-red-500" 
                          : "border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      }`}
                      placeholder="0712345678"
                      maxLength={10}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                    />
                  </div>
                  {errors.phone ? (
                    <p id="phone-error" className="text-red-500 text-xs mt-1" role="alert">
                      {errors.phone}
                    </p>
                  ) : (
                    <p id="phone-hint" className="text-xs text-gray-500 mt-1">
                      We'll send an M-Pesa payment prompt to this number
                    </p>
                  )}
                </div>

                {/* Delivery Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-1 uppercase">
                    Delivery Location *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icons.Location className="w-4 h-4" />
                    </div>
                    <input
                      id="location"
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-sm outline-none transition-all ${
                        errors.location 
                          ? "border-red-500 ring-1 ring-red-500" 
                          : "border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      }`}
                      placeholder="e.g., Westlands, Nairobi"
                      aria-invalid={!!errors.location}
                      aria-describedby={errors.location ? "location-error" : undefined}
                    />
                  </div>
                  {errors.location && (
                    <p id="location-error" className="text-red-500 text-xs mt-1" role="alert">
                      {errors.location}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-200 pb-4">
                Payment Method
              </h2>
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded border border-green-200">
                <div className="w-16 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
                  M-PESA
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">M-Pesa</p>
                  <p className="text-xs text-gray-500">Pay securely via M-Pesa mobile money</p>
                </div>
                <div className="text-green-600">
                  <Icons.Check className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                <strong>Note:</strong> M-Pesa integration will be connected to the backend later. 
                This is a UI demo. In production, clicking "Place Order" will trigger an STK Push to your phone.
              </p>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                submitting 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg"
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>Place Order - {formatPrice(total)}</>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-200 pb-4">
              Your Order
            </h2>
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover mix-blend-multiply"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900 whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-bold text-primary-600 text-xl">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              🔒 Your payment is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}