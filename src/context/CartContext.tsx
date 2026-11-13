import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getProduct, stockFor } from '../data/products'
import { readStorage, writeStorage } from '../lib/format'
import type { CartItem, Product } from '../types'

const KEY = 'sneakhub:cart:v1'

export interface CartLine extends CartItem {
  product: Product
  lineTotal: number
  maxQty: number
}

interface CartCtx {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (productId: string, size: number, qty: number) => { ok: boolean; added: number; message?: string }
  setQty: (productId: string, size: number, qty: number) => void
  remove: (productId: string, size: number) => void
  clear: () => void
  qtyInCart: (productId: string, size: number) => number
  storageOk: boolean
}

const Ctx = createContext<CartCtx | null>(null)

function sanitize(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((i): i is CartItem => !!i && typeof i.productId === 'string' && typeof i.size === 'number' && typeof i.qty === 'number')
    .filter((i) => {
      const p = getProduct(i.productId)
      return p && stockFor(p, i.size) > 0 && i.qty > 0
    })
    .map((i) => ({ ...i, qty: Math.min(Math.floor(i.qty), stockFor(getProduct(i.productId)!, i.size)) }))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => sanitize(readStorage(KEY, [])))
  const [storageOk, setStorageOk] = useState(true)

  useEffect(() => {
    setStorageOk(writeStorage(KEY, items))
  }, [items])

  // синхронизация между вкладками
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(sanitize(readStorage(KEY, [])))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const qtyInCart = useCallback(
    (productId: string, size: number) => items.find((i) => i.productId === productId && i.size === size)?.qty ?? 0,
    [items],
  )

  const add: CartCtx['add'] = (productId, size, qty) => {
    const p = getProduct(productId)
    if (!p) return { ok: false, added: 0, message: 'Товар не найден' }
    const stock = stockFor(p, size)
    if (stock <= 0) return { ok: false, added: 0, message: 'Этого размера нет в наличии' }
    const current = qtyInCart(productId, size)
    const canAdd = Math.max(0, Math.min(qty, stock - current))
    if (canAdd === 0) return { ok: false, added: 0, message: `В корзине уже весь доступный остаток (${stock} шт.)` }
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === productId && i.size === size)
      if (exists) return prev.map((i) => (i === exists ? { ...i, qty: i.qty + canAdd } : i))
      return [...prev, { productId, size, qty: canAdd }]
    })
    return { ok: true, added: canAdd, message: canAdd < qty ? `Добавлено ${canAdd} шт. — больше нет в наличии` : undefined }
  }

  const setQty: CartCtx['setQty'] = (productId, size, qty) => {
    const p = getProduct(productId)
    if (!p) return
    const q = Math.max(1, Math.min(Math.floor(qty) || 1, stockFor(p, size)))
    setItems((prev) => prev.map((i) => (i.productId === productId && i.size === size ? { ...i, qty: q } : i)))
  }

  const remove: CartCtx['remove'] = (productId, size) =>
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))

  const clear = () => setItems([])

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((i) => {
        const product = getProduct(i.productId)
        if (!product) return []
        return [{ ...i, product, lineTotal: product.price * i.qty, maxQty: stockFor(product, i.size) }]
      }),
    [items],
  )

  const value: CartCtx = {
    lines,
    count: lines.reduce((a, l) => a + l.qty, 0),
    subtotal: lines.reduce((a, l) => a + l.lineTotal, 0),
    add,
    setQty,
    remove,
    clear,
    qtyInCart,
    storageOk,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used inside CartProvider')
  return c
}
