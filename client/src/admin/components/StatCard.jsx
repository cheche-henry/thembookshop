export default function StatCard({ label, value, icon: Icon, color = 'green', sub, loading }) {
  const colors = {
    green:  'bg-green-500/10 text-green-400 border-green-500/20',
    blue:   'bg-blue-500/10  text-blue-400  border-blue-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red:    'bg-red-500/10   text-red-400   border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-24 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
          <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </>
      )}
    </div>
  )
}
