import { Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { formatKES } from '../utils/format'
import { Link } from 'react-router-dom'
export default function CartItem({ item }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
      <Link to={`/product/${item.id}`} className="flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-gray-50"/>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.id}`}><h3 className="font-bold text-gray-800 text-sm leading-snug hover:text-green-600 transition-colors line-clamp-2" style={{fontFamily:'Nunito,sans-serif'}}>{item.name}</h3></Link>
        <p className="text-xs text-gray-400 mt-0.5">{item.category}{item.classLevel ? ` · ${item.classLevel}` : ''}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 transition-colors text-gray-600"><Minus className="w-3.5 h-3.5"/></button>
            <span className="w-8 text-center font-bold text-sm text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600"><Plus className="w-3.5 h-3.5"/></button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-green-600" style={{fontFamily:'Nunito,sans-serif'}}>{formatKES(item.price * item.quantity)}</span>
            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </div>
  )
}
