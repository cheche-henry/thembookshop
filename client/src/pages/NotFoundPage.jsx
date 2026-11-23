import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The link may be broken, or the page may have moved. The shop is a good place to start again.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="btn-primary">Browse the shop</Link>
          <Link to="/" className="btn-secondary">Go home</Link>
        </div>
      </div>
    </div>
  )
}
