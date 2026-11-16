import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const stockOf = (item) => {
  if (item?.stock_quantity === undefined || item?.stock_quantity === null) return null
  const value = Number(item.stock_quantity)
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null
}

const clampQuantity = (quantity, stock) => {
  const value = Math.max(1, Math.floor(Number(quantity) || 1))
  return stock === null ? value : Math.min(value, Math.max(stock, 0))
}

export const useCartStore = create(persist((set, get) => ({
  items: [],

  addToCart: (product, quantity = 1) => {
    const { items } = get()
    const stock = stockOf(product)
    if (stock === 0) return

    const existing = items.find((i) => i.id === product.id)
    if (existing) {
      const nextQty = clampQuantity(existing.quantity + quantity, stock ?? stockOf(existing))
      set({ items: items.map((i) => i.id === product.id ? { ...i, ...product, quantity: nextQty } : i) })
    } else {
      set({ items: [...items, { ...product, quantity: clampQuantity(quantity, stock) }] })
    }
  },

  removeFromCart: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

  updateQuantity: (id, quantity) => {
    set({
      items: get().items.map((item) => {
        if (item.id !== id) return item
        return { ...item, quantity: clampQuantity(quantity, stockOf(item)) }
      }),
    })
  },

  clearCart: () => set({ items: [] }),
}), { name: 'them-bookshop-cart', version: 1 }))
