import { PackageSearch, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
export function EmptySearch({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <PackageSearch className="w-16 h-16 text-gray-200 mb-4"/>
      <h3 className="font-bold text-xl text-gray-700 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>No products found</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">We couldn't find any products matching your filters. Try adjusting your search or clear filters.</p>
      <button onClick={onReset} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all">Clear Filters</button>
    </div>
  )
}
export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingCart className="w-16 h-16 text-gray-200 mb-4"/>
      <h3 className="font-bold text-xl text-gray-700 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>Your cart is empty</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">You haven't added anything yet. Head to the shop to find books and stationery!</p>
      <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all">Browse the Shop</Link>
    </div>
  )
}
