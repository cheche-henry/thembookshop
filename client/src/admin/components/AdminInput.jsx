export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full bg-gray-800 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all ${className}`}
        {...props}
      />
      {hint  && !error && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full bg-gray-800 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>}
      <textarea
        className={`w-full bg-gray-800 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function Btn({ children, variant = 'primary', loading, className = '', ...props }) {
  const variants = {
    primary:  'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20',
    secondary:'bg-white/10 hover:bg-white/15 text-white',
    danger:   'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
    ghost:    'text-gray-400 hover:text-white hover:bg-white/5',
  }
  return (
    <button
      disabled={loading || props.disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
