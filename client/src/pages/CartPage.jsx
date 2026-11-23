import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Smartphone } from 'lucide-react'
import { useCartStore } from '../context/cartStore'
import { useToast } from '../components/ui/Toast'
import CartItem from '../components/CartItem'
import { EmptyCart } from '../components/EmptyState'
import Modal from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { formatKES } from '../utils/format'

const STEPS = [
  'Enter your delivery details.',
  'Receive the M-Pesa prompt on your phone.',
  'Enter your M-Pesa PIN.',
  'Your order is confirmed after payment.',
]

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const [confirmClear, setConfirmClear] = useState(false)
  const { toast } = useToast()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="mb-8">
          <p className="eyebrow">Your order</p>
          <h1 className="mt-2 text-3xl font-semibold">Cart</h1>
        </div>
        <EmptyCart />
      </div>
    )
  }

  const handleClear = () => {
    clearCart()
    setConfirmClear(false)
    toast({ title: 'Cart cleared' })
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your order</p>
          <h1 className="mt-2 text-3xl font-semibold">
            Cart <span className="text-lg font-normal text-muted">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="text-sm text-muted underline-offset-4 hover:text-danger hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="mb-8 flex items-start gap-3 border-l-2 border-brand-700 bg-brand-50 px-4 py-3.5">
        <Smartphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-800" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-brand-900">Payment is by M-Pesa</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-brand-800">
            At checkout you will receive a payment request on your phone. An order is only confirmed once payment is completed.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => <CartItem key={item.id} item={item} />)}
        </div>

        <aside>
          <div className="border border-line bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="text-base font-semibold text-ink">Order summary</h2>

            <div className="mt-4 space-y-2 border-b border-line pb-4 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-muted">
                  <span className="min-w-0 truncate">{item.name} × {item.quantity}</span>
                  <span className="flex-shrink-0 tabular-nums text-body">{formatKES(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-body">{formatKES(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-success">Free</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm font-medium text-ink">Total</span>
              <span className="text-xl font-semibold tabular-nums text-ink">{formatKES(total)}</span>
            </div>

            <Link
              to="/checkout"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-700 text-[15px] font-medium text-white transition-colors hover:bg-brand-800"
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <div className="mt-6 border-t border-line pt-4">
              <p className="text-xs font-medium text-ink">What happens next</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-muted">
                {STEPS.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>

            <Link to="/shop" className="mt-4 block text-center text-sm text-brand-800 underline-offset-4 hover:underline">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear your cart?"
        description="Every item will be removed. This cannot be undone."
        size="sm"
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>Keep items</Button>
          <Button variant="danger" onClick={handleClear}>Clear cart</Button>
        </div>
      </Modal>
    </div>
  )
}
