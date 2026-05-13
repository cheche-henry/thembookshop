export default function Field({ label, children, error, hint }) {
  return (
    <div>
      <label className="block font-semibold text-sm text-gray-700 mb-1.5" style={{fontFamily:'Nunito,sans-serif'}}>{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  )
}
