const config = {
  pending:           { label: 'Pending',           cls: 'bg-gray-500/20 text-gray-300' },
  payment_initiated: { label: 'Awaiting Payment',  cls: 'bg-amber-500/20 text-amber-300' },
  paid:              { label: 'Paid',              cls: 'bg-blue-500/20 text-blue-300' },
  processing:        { label: 'Processing',        cls: 'bg-purple-500/20 text-purple-300' },
  completed:         { label: 'Completed',         cls: 'bg-green-500/20 text-green-300' },
  failed:            { label: 'Failed',            cls: 'bg-red-500/20 text-red-300' },
  cancelled:         { label: 'Cancelled',         cls: 'bg-gray-600/30 text-gray-400' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const c = config[status] || { label: status, cls: 'bg-gray-500/20 text-gray-300' }
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${c.cls} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {c.label}
    </span>
  )
}
