import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import type { Product } from '../types'
import { formatPrice } from '../lib/format'
import { productTitle, totalStock } from '../data/products'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import SneakerArt from './SneakerArt'
import Badges from './Badges'

export default function ProductCard({ product: p }: { product: Product }) {
  const [picking, setPicking] = useState(false)
  const { add } = useCart()
  const toast = useToast()
  const inStock = totalStock(p) > 0
  const available = p.sizes.filter((s) => s.stock > 0)

  const addSize = (size: number) => {
    const r = add(p.id, size, 1)
    setPicking(false)
    toast(r.ok
      ? { kind: 'success', text: r.message ?? `${productTitle(p)}, EU ${size} — в корзине`, action: { label: 'Корзина', to: '/cart' } }
      : { kind: 'error', text: r.message ?? 'Не удалось добавить' })
  }

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3.4] overflow-hidden rounded-3xl" style={{ background: p.palette.bg }}>
        <Link to={`/product/${p.id}`} aria-label={productTitle(p)} className="absolute inset-0">
          <SneakerArt
            palette={p.palette}
            silhouette={p.silhouette}
            background={false}
            title={`${productTitle(p)} — демо-изображение`}
            className="absolute inset-0 size-full p-3 transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-[1.06]"
          />
        </Link>
        <Badges badges={p.badges} className="absolute left-3 top-3" />

        {/* быстрый выбор размера */}
        {inStock && (
          <div className={`absolute inset-x-3 bottom-3 transition-all duration-300 ${picking ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
            <div className="rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur">
              <div className="mb-2 flex items-center justify-between text-xs font-bold">
                Выберите размер EU
                <button onClick={() => setPicking(false)} aria-label="Закрыть выбор размера" className="rounded-full p-1 hover:bg-mist"><X className="size-4" /></button>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {p.sizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => addSize(s.size)}
                    className="rounded-lg border border-line py-1.5 text-xs font-bold transition hover:border-ink hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:text-neutral-300 disabled:line-through disabled:hover:bg-transparent"
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{p.brand}</p>
            <h3 className="mt-1 truncate text-base font-extrabold">
              <Link to={`/product/${p.id}`} className="hover:text-accent">{p.model}</Link>
            </h3>
            <p className="truncate text-sm text-neutral-500">{p.colorway}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`font-extrabold ${p.oldPrice ? 'text-accent' : ''}`}>{formatPrice(p.price)}</p>
            {p.oldPrice && <p className="text-xs text-neutral-400 line-through">{formatPrice(p.oldPrice)}</p>}
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          {inStock ? (
            <>Размеры: <span className="font-semibold text-neutral-700">{available.map((s) => s.size).join(', ')}</span></>
          ) : (
            <span className="font-semibold text-red-600">Нет в наличии</span>
          )}
        </p>

        <button
          onClick={() => setPicking((v) => !v)}
          disabled={!inStock}
          className="btn-primary mt-4 w-full py-3"
        >
          <Plus className="size-4" /> В корзину
        </button>
      </div>
    </article>
  )
}
