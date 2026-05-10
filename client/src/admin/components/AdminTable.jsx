export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-white/10 ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900/80 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-gray-300 border-t border-white/5 ${className}`}>
      {children}
    </td>
  )
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`bg-gray-900 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-800/60' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}
