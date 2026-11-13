import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Truck, RotateCcw, BadgeCheck, Ruler } from 'lucide-react'
import { CATEGORY_LABELS, PRODUCTS, getProduct, productTitle, stockFor, totalStock } from '../data/products'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import SneakerArt, { type ArtView } from '../components/SneakerArt'
import Badges from '../components/Badges'
import ProductCard from '../components/ProductCard'
import NotFound from './NotFound'

const VIEWS: { v: ArtView; l: string }[] = [
  { v: 'side', l: 'Сбоку' },
  { v: 'mirror', l: 'С другой стороны' },
  { v: 'top', l: 'Ракурс' },
  { v: 'detail', l: 'Деталь мыска' },
]

export default function ProductPage() {
  const { id = '' } = useParams()
  const product = getProduct(id)
  const { add, qtyInCart } = useCart()
  const toast = useToast()

  const [view, setView] = useState(0)
  const [size, setSize] = useState<number | null>(null)
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    setView(0); setSize(null); setQty(1); setSizeError(false)
    if (product) document.title = `${productTitle(product)} — SNEAKHUB`
    return () => { document.title = 'SNEAKHUB — магазин кроссовок' }
  }, [id])

  if (!product) return <NotFound title="Товар не найден" text="Возможно, модель снята с продажи или ссылка указана неверно." />

  const p = product
  const total = totalStock(p)
  const stock = size ? stockFor(p, size) : 0
  const inCart = size ? qtyInCart(p.id, size) : 0
  const maxAdd = Math.max(0, stock - inCart)
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0

  const similar = PRODUCTS.filter((x) => x.id !== p.id)
    .map((x) => ({ x, score: (x.category === p.category ? 2 : 0) + (x.brand === p.brand ? 1.5 : 0) - Math.abs(x.price - p.price) / 50000 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.x)

  const pickSize = (s: number) => {
    setSize(s); setSizeError(false)
    setQty((q) => Math.max(1, Math.min(q, stockFor(p, s) - qtyInCart(p.id, s))))
  }

  const addToCart = () => {
    if (!size) { setSizeError(true); return }
    const r = add(p.id, size, qty)
    toast(r.ok
      ? { kind: 'success', text: r.message ?? `Добавлено: ${productTitle(p)}, EU ${size} × ${r.added}`, action: { label: 'Корзина', to: '/cart' } }
      : { kind: 'error', text: r.message ?? 'Не удалось добавить' })
    if (r.ok) setQty(1)
  }

  const nav = (d: number) => setView((v) => (v + d + VIEWS.length) % VIEWS.length)

  return (
    <div className="container-x pt-6 sm:pt-10">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500" aria-label="Хлебные крошки">
        <Link to="/" className="hover:text-ink">Главная</Link> /
        <Link to="/catalog" className="hover:text-ink">Каталог</Link> /
        <Link to={`/catalog?brand=${encodeURIComponent(p.brand)}`} className="hover:text-ink">{p.brand}</Link> /
        <span className="font-semibold text-ink">{p.model}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* ГАЛЕРЕЯ */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="group relative aspect-[4/3.2] overflow-hidden rounded-[2rem]" style={{ background: p.palette.bg }}>
            <SneakerArt key={view} palette={p.palette} silhouette={p.silhouette} view={VIEWS[view].v} background={false} className="absolute inset-0 size-full animate-fade-up p-6 sm:p-10" title={`${productTitle(p)} — ${VIEWS[view].l} (демо-изображение)`} />
            <Badges badges={p.badges} className="absolute left-5 top-5" />
            <span className="absolute bottom-4 left-5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-neutral-600 backdrop-blur">Демо-изображение</span>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button onClick={() => nav(-1)} className="grid size-11 place-items-center rounded-full bg-white shadow-md transition hover:bg-ink hover:text-white" aria-label="Предыдущее фото"><ChevronLeft className="size-5" /></button>
              <button onClick={() => nav(1)} className="grid size-11 place-items-center rounded-full bg-white shadow-md transition hover:bg-ink hover:text-white" aria-label="Следующее фото"><ChevronRight className="size-5" /></button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {VIEWS.map((v, i) => (
              <button
                key={v.v}
                onClick={() => setView(i)}
                aria-label={v.l}
                aria-current={i === view}
                className={`aspect-square overflow-hidden rounded-2xl border-2 transition ${i === view ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'}`}
                style={{ background: p.palette.bg }}
              >
                <SneakerArt palette={p.palette} silhouette={p.silhouette} view={v.v} background={false} className="size-full p-1.5" />
              </button>
            ))}
          </div>
        </div>

        {/* ИНФО */}
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[.2em] text-neutral-500">{p.brand} · {CATEGORY_LABELS[p.category]}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{p.model}</h1>
          <p className="mt-2 text-neutral-500">{p.colorway}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className={`font-display text-3xl font-bold ${p.oldPrice ? 'text-accent' : ''}`}>{formatPrice(p.price)}</span>
            {p.oldPrice && (
              <>
                <span className="text-lg text-neutral-400 line-through">{formatPrice(p.oldPrice)}</span>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-extrabold text-accent">−{discount}%</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-400">Демонстрационная цена, не является публичной офертой</p>

          <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${total > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            <span className={`size-2 rounded-full ${total > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {total > 0 ? (size ? (stock > 3 ? `EU ${size}: в наличии` : `EU ${size}: осталось ${stock} шт.`) : 'В наличии') : 'Нет в наличии'}
          </p>

          {/* РАЗМЕР */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-extrabold">Размер EU</h2>
              <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500"><Ruler className="size-4" /> Размер в размер</span>
            </div>
            <div className={`grid grid-cols-4 gap-2 rounded-2xl sm:grid-cols-6 ${sizeError ? 'ring-2 ring-red-500 ring-offset-4' : ''}`} role="radiogroup" aria-label="Выбор размера">
              {p.sizes.map((s) => (
                <button
                  key={s.size}
                  role="radio"
                  aria-checked={size === s.size}
                  disabled={s.stock === 0}
                  onClick={() => pickSize(s.size)}
                  className={`relative rounded-xl border py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:bg-mist disabled:text-neutral-300 ${size === s.size ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'}`}
                >
                  <span className={s.stock === 0 ? 'line-through' : ''}>{s.size}</span>
                  {s.stock > 0 && s.stock <= 2 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" title="Мало осталось" />}
                </button>
              ))}
            </div>
            {sizeError && <p className="mt-3 text-sm font-semibold text-red-600">Выберите размер, чтобы добавить товар в корзину</p>}
            <p className="mt-3 flex items-center gap-2 text-xs text-neutral-500"><span className="size-1.5 rounded-full bg-accent" /> — осталось 1–2 пары</p>
          </div>

          {/* КОЛ-ВО + КНОПКА */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center justify-between rounded-full border border-line p-1.5 sm:w-40">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="grid size-11 place-items-center rounded-full transition hover:bg-mist disabled:opacity-30" aria-label="Уменьшить количество"><Minus className="size-4" /></button>
              <span className="w-8 text-center font-extrabold" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} disabled={!!size && qty >= maxAdd} className="grid size-11 place-items-center rounded-full transition hover:bg-mist disabled:opacity-30" aria-label="Увеличить количество"><Plus className="size-4" /></button>
            </div>
            <button onClick={addToCart} disabled={total === 0 || (!!size && maxAdd === 0)} className="btn-accent flex-1 py-4 text-base">
              <ShoppingBag className="size-5" />
              {total === 0 ? 'Нет в наличии' : size && maxAdd === 0 ? 'Весь остаток уже в корзине' : `Добавить в корзину${size ? ` · ${formatPrice(p.price * qty)}` : ''}`}
            </button>
          </div>
          {size && inCart > 0 && (
            <p className="mt-3 text-sm text-neutral-500">В корзине уже {inCart} шт. размера EU {size}. <Link to="/cart" className="font-bold text-accent hover:underline">Перейти в корзину</Link></p>
          )}

          <div className="mt-8 grid gap-3 rounded-3xl bg-mist p-5 text-sm sm:grid-cols-3">
            <div className="flex gap-3"><Truck className="size-5 shrink-0 text-accent" /><span>Доставка по Казахстану от 1 дня</span></div>
            <div className="flex gap-3"><RotateCcw className="size-5 shrink-0 text-accent" /><span>Обмен и возврат 14 дней</span></div>
            <div className="flex gap-3"><BadgeCheck className="size-5 shrink-0 text-accent" /><span>Проверка подлинности</span></div>
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl font-bold">Описание</h2>
            <p className="mt-3 leading-relaxed text-neutral-600">{p.description}</p>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {p.specs.map((s) => (
                <div key={s.label} className="flex justify-between gap-6 py-3 text-sm">
                  <dt className="text-neutral-500">{s.label}</dt>
                  <dd className="text-right font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">Похожие модели</h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {similar.map((x) => <ProductCard key={x.id} product={x} />)}
        </div>
      </section>
    </div>
  )
}
