import React from 'react';
import Icons from '../common/Icons';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Icons.Book className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">
                THEM<span className="text-primary-600">BOOKSHOP</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Kenya's leading online bookstore for school textbooks, revision materials, and stationery. 
              We support the CBC and 8-4-4 curriculum with quality educational resources.
            </p>
            <div className="flex gap-3">
              {/* Social Links - Placeholder */}
              <a href="#facebook" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Facebook">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#twitter" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Twitter">
                <span className="text-xs font-bold">t</span>
              </a>
              <a href="#instagram" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Instagram">
                <span className="text-xs font-bold">in</span>
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Customer Service</h4>
            <div className="flex flex-col gap-2 text-sm">
              <button className="text-left hover:text-white transition-colors py-1">Contact Us</button>
              <button className="text-left hover:text-white transition-colors py-1">Shipping Policy</button>
              <button className="text-left hover:text-white transition-colors py-1">Returns & Refunds</button>
              <button className="text-left hover:text-white transition-colors py-1">FAQ</button>
              <button className="text-left hover:text-white transition-colors py-1">Track Order</button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => onNavigate?.("shop")} className="text-left hover:text-white transition-colors py-1">Primary Textbooks</button>
              <button onClick={() => onNavigate?.("shop")} className="text-left hover:text-white transition-colors py-1">Secondary Textbooks</button>
              <button onClick={() => onNavigate?.("shop")} className="text-left hover:text-white transition-colors py-1">Revision Materials</button>
              <button onClick={() => onNavigate?.("shop")} className="text-left hover:text-white transition-colors py-1">Stationery</button>
              <button onClick={() => onNavigate?.("shop")} className="text-left hover:text-white transition-colors py-1">School Bags</button>
            </div>
          </div>

          {/* Newsletter & Payments */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Newsletter</h4>
            <p className="text-xs text-gray-400 mb-4">Subscribe for exclusive deals and educational tips.</p>
            <form className="flex mb-6" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-800 border-none outline-none text-sm px-4 py-2 rounded-l-md w-full focus:ring-1 focus:ring-primary-600 placeholder-gray-500"
                aria-label="Email for newsletter"
              />
              <button 
                type="submit" 
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md text-sm font-bold hover:bg-primary-700 transition-colors"
              >
                JOIN
              </button>
            </form>
            <div>
               <p className="text-xs text-gray-500 mb-2">We Accept:</p>
               <div className="flex gap-2">
                 <div className="bg-white px-3 py-1.5 rounded text-[10px] font-bold text-green-700 flex items-center gap-1">
                   <span className="w-2 h-2 bg-green-500 rounded-full"></span> M-PESA
                 </div>
                 <div className="bg-white px-3 py-1.5 rounded text-[10px] font-bold text-blue-700">VISA</div>
                 <div className="bg-white px-3 py-1.5 rounded text-[10px] font-bold text-orange-600">MASTERCARD</div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {currentYear} Them Bookshop Ltd. All rights reserved. 
              Prices are in Kenyan Shillings (KES).
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <button className="hover:text-gray-300 transition-colors">Privacy Policy</button>
              <button className="hover:text-gray-300 transition-colors">Terms of Service</button>
              <button className="hover:text-gray-300 transition-colors">Sitemap</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}