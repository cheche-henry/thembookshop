import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let nextId = 0

const tones = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error:   { icon: AlertCircle,  className: 'text-danger' },
  info:    { icon: Info,         className: 'text-brand-700' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(({ title, description, tone = 'success', duration = 4000 }) => {
    const id = ++nextId
    setToasts((current) => [...current, { id, title, description, tone }])
    timers.current.set(id, setTimeout(() => dismiss(id), duration))
    return id
  }, [dismiss])

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map(({ id, title, description, tone }) => {
          const config = tones[tone] || tones.info
          const Icon = config.icon
          return (
            <div
              key={id}
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-overlay"
            >
              <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${config.className}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{title}</p>
                {description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="-m-1 rounded p-1 text-muted transition-colors hover:bg-muted-surface hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside a ToastProvider')
  return context
}
