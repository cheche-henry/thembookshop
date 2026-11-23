import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:       'bg-brand-700 text-white hover:bg-brand-800',
  secondary:     'border border-line-strong bg-surface text-ink hover:border-brand-700 hover:text-brand-800',
  ghost:         'text-muted hover:bg-muted-surface hover:text-ink',
  danger:        'bg-danger text-white hover:bg-[#8d221c]',
  'danger-ghost':'text-danger hover:bg-[#f8e9e7]',
  link:          'text-brand-700 underline-offset-4 hover:underline',
}

const sizes = {
  sm:   'h-9 px-3 text-[13px]',
  md:   'h-10 px-4 text-sm',
  lg:   'h-12 px-6 text-[15px]',
  icon: 'h-10 w-10',
}

export function buttonStyles({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  )
}
