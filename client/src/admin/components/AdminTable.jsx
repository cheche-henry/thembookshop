export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-md border border-line bg-surface ${className}`}>
      <table className="w-full min-w-[680px] text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`border-b border-line bg-paper px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-muted ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`border-b border-line px-4 py-3 align-middle text-[13px] text-body ${className}`}>
      {children}
    </td>
  )
}

export function Tr({ children, onClick, className = '' }) {
  const interactive = Boolean(onClick)

  return (
    <tr
      onClick={onClick}
      onKeyDown={interactive ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick(event)
        }
      } : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`transition-colors ${interactive ? 'cursor-pointer hover:bg-paper focus-visible:bg-paper' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}
