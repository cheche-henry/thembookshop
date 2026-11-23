export default function StatCard({ label, value, icon: Icon, loading, hint, valueClassName = 'text-ink' }) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-muted">{label}</p>
        {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-muted" aria-hidden="true" />}
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="skeleton h-7 w-24 rounded-sm" />
          <div className="skeleton h-3 w-16 rounded-sm" />
        </div>
      ) : (
        <p className={`mt-2 text-2xl font-semibold tabular-nums ${valueClassName}`}>{value ?? '—'}</p>
      )}

      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
