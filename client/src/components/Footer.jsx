import { Link } from 'react-router-dom'
import { BookOpen, Phone, MapPin, Mail } from 'lucide-react'
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
              <div><span className="font-bold text-white text-lg block leading-none" style={{fontFamily:'Nunito,sans-serif'}}>Them Bookshop</span><span className="text-xs text-green-400 block">All Your School Needs</span></div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">Kenya's trusted school supply store. Quality textbooks, stationery, and learning materials for primary and secondary students.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4" style={{fontFamily:'Nunito,sans-serif'}}>Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[{to:'/',l:'Home'},{to:'/shop',l:'All Products'},{to:'/cart',l:'My Cart'}].map(x=>(
                <li key={x.to}><Link to={x.to} className="hover:text-green-400 transition-colors">{x.l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4" style={{fontFamily:'Nunito,sans-serif'}}>Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Primary Books','Secondary Books','Revision Guides','Exercise Books','School Bags','Geometry Sets'].map(c=>(
                <li key={c}><Link to="/shop" className="hover:text-green-400 transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4" style={{fontFamily:'Nunito,sans-serif'}}>Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><span>+254 700 000 000<br/><span className="text-xs text-gray-500">Mon–Sat 8am–6pm</span></span></li>
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><span>Nairobi, Kenya<br/><span className="text-xs text-gray-500">Delivery countrywide</span></span></li>
              <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><span>hello@thembookshop.co.ke</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2025 Them Bookshop. All rights reserved.</p>
          <p>We accept M-Pesa · Delivery Countrywide 🇰🇪</p>
        </div>
      </div>
    </footer>
  )
}
