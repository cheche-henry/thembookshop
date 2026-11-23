import { forwardRef, useId } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

function Label({ htmlFor, children, optional }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">
      {children}
      {optional && <span className="ml-1.5 font-normal text-muted">optional</span>}
    </label>
  )
}

function Help({ id, error, hint }) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs text-danger">
        <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </p>
    )
  }
  if (hint) return <p id={id} className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>
  return null
}

const controlBase =
  'w-full rounded-md border bg-surface text-sm text-ink placeholder:text-muted/70 transition-colors ' +
  'focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20 ' +
  'disabled:cursor-not-allowed disabled:bg-muted-surface disabled:text-muted'

export function Field({ label, htmlFor, error, hint, optional, className = '', children }) {
  const helpId = error || hint ? `${htmlFor || 'field'}-help` : undefined
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor} optional={optional}>{label}</Label>}
      {children}
      <Help id={helpId} error={error} hint={hint} />
    </div>
  )
}

export const Input = forwardRef(function Input(
  { label, error, hint, optional, id, className = '', trailing, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId
  const helpId = error || hint ? `${inputId}-help` : undefined

  return (
    <div>
      {label && <Label htmlFor={inputId} optional={optional}>{label}</Label>}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpId}
          className={`h-11 px-3 ${controlBase} ${error ? 'border-danger bg-[#fdf3f2]' : 'border-line'} ${trailing ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      <Help id={helpId} error={error} hint={hint} />
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, hint, optional, id, className = '', children, ...props },
  ref
) {
  const autoId = useId()
  const selectId = id || autoId
  const helpId = error || hint ? `${selectId}-help` : undefined

  return (
    <div>
      {label && <Label htmlFor={selectId} optional={optional}>{label}</Label>}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpId}
          className={`h-11 appearance-none pl-3 pr-9 ${controlBase} ${error ? 'border-danger bg-[#fdf3f2]' : 'border-line'} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      <Help id={helpId} error={error} hint={hint} />
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, optional, id, className = '', ...props },
  ref
) {
  const autoId = useId()
  const textareaId = id || autoId
  const helpId = error || hint ? `${textareaId}-help` : undefined

  return (
    <div>
      {label && <Label htmlFor={textareaId} optional={optional}>{label}</Label>}
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={helpId}
        className={`px-3 py-2.5 ${controlBase} ${error ? 'border-danger bg-[#fdf3f2]' : 'border-line'} ${className}`}
        {...props}
      />
      <Help id={helpId} error={error} hint={hint} />
    </div>
  )
})

export default Field
