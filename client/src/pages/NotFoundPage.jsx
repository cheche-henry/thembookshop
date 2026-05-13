import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <BookOpen className="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h1 className="font-bold text-4xl text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 text-sm mb-2">This page doesn't exist.</p>
        <p className="text-gray-400 text-xs mb-8">The link you followed may be broken, or the page may have been removed.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
