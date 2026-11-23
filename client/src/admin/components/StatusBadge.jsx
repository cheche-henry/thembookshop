const config = {
  pending:           { label: 'Pending',          dot: 'bg-muted',      cls: 'bg-muted-surface text-muted' },
  payment_initiated: { label: 'Awaiting payment', dot: 'bg-warning',    cls: 'bg-[#fbf3e3] text-warning' },
  paid:              { label: 'Paid',             dot: 'bg-[#2B5C86]',  cls: 'bg-[#eaf1f5] text-[#2B5C86]' },
  processing:        { label: 'Processing',       dot: 'bg-accent',     cls: 'bg-accent-soft text-accent' },
  completed:         { label: 'Completed',        dot: 'bg-success',    cls: 'bg-brand-50 text-brand-800' },
  failed:            { label: 'Failed',           dot: 'bg-danger',     cls: 'bg-[#fdf3f2] text-danger' },
  cancelled:         { label: 'Cancelled',        dot: 'bg-muted',      cls: 'bg-muted-surface text-muted' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const item = config[status] || { label: status, dot: 'bg-muted', cls: 'bg-muted-surface text-muted' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm font-medium ${item.cls} ${
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} aria-hidden="true" />
      {item.label}
    </span>
  )
}
