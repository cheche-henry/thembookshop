import { Component } from 'react'
import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-5">
          <div className="w-full max-w-md border border-line bg-surface p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Something went wrong</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {this.props.fallback || 'An unexpected error occurred. Refresh the page to try again.'}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => window.location.reload()} className="btn-primary">
                Refresh page
              </button>
              <Link to="/" className="btn-secondary">Go home</Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
