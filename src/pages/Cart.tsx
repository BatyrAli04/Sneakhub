import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, plural } from '../lib/format'
import { FREE_DELIVERY_FROM } from '../lib/orders'
import { productTitle } from '../data/products'
import SneakerArt from '../components/SneakerArt'

export default function Cart() {
  const { lines, count, subtotal, setQty, remove, clear } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  if (lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-mist"><ShoppingBag className="size-10" /></span>
        <h1 className="mt-8 font-display text-3xl font-bold sm:text-4xl">Корзина пуста</h1>
        <p className="mt-3 max-w-md text-neutral-500">Загляните в каталог — там хиты продаж, новинки и модели со скидкой.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/catalog" className="btn-primary">Перейти в каталог <ArrowRight className="size-4" /></Link>
          <Link to="/catalog?badge=SALE" className="btn-ghost">Смотреть Sale</Link>
        </div>
      </div>
    )
  }

  const left = Math.max(0, FREE_DELIVERY_FROM - subtotal)
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)
  const savings = lines.reduce((a, l) => a + (l.product.oldPrice ? (l.product.oldPrice - l.product.price) * l.qty : 0), 0)

  const removeLine = (productId: string, size: number, title: string) => {
    remove(productId, size)
    toast({ kind: 'success', text: `${title} удалён из корзины` })
  }

  return (
    <div className="container-x pt-8 sm:pt-12">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Корзина</h1>
          <p className="mt-2 text-neutral-500">{count} {plural(count, 'товар', 'товара', 'товаров')}</p>
        </div>
        <button onClick={() => { clear(); toast({ kind: 'success', text: 'Корзина очищена' }) }} className="text-sm font-bold text-neutral-500 hover:text-red-600">
          Очистить
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}`} className="flex gap-4 py-6 first:pt-0 sm:gap-6">
              <Link to={`/product/${l.productId}`} className="shrink-0 overflow-hidden rounded-2xl" style={{ background: l.product.palette.bg }}>
                <SneakerArt palette={l.product.palette} silhouette={l.product.silhouette} background={false} className="size-24 p-1.5 sm:h-32 sm:w-40" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{l.product.brand}</p>
                    <Link to={`/product/${l.productId}`} className="block truncate font-extrabold hover:text-accent sm:text-lg">{l.product.model}</Link>
                    <p className="text-sm text-neutral-500">{l.product.colorway} · EU {l.size}</p>
                  </div>
                  <button onClick={() => removeLine(l.productId, l.size, productTitle(l.product))} className="-mr-2 -mt-1 rounded-full p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Удалить ${productTitle(l.product)}`}>
                    <Trash2 className="size-5" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div>
                    <div className="flex items-center rounded-full border border-line p-1">
                      <button onClick={() => (l.qty <= 1 ? removeLine(l.productId, l.size, productTitle(l.product)) : setQty(l.productId, l.size, l.qty - 1))} className="grid size-8 place-items-center rounded-full hover:bg-mist" aria-label="Уменьшить">
                        {l.qty <= 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                      </button>
                      <span className="w-8 text-center text-sm font-extrabold">{l.qty}</span>
                      <button onClick={() => setQty(l.productId, l.size, l.qty + 1)} disabled={l.qty >= l.maxQty} className="grid size-8 place-items-center rounded-full hover:bg-mist disabled:opacity-30" aria-label="Увеличить"><Plus className="size-3.5" /></button>
                    </div>
                    {l.qty >= l.maxQty && <p className="mt-1 text-xs text-neutral-500">Максимум: {l.maxQty} шт.</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold">{formatPrice(l.lineTotal)}</p>
                    {l.qty > 1 && <p className="text-xs text-neutral-500">{formatPrice(l.product.price)} / шт.</p>}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-mist p-6">
            <h2 className="font-display text-xl font-bold">Итого</h2>
            <div className="mt-5 rounded-2xl bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Truck className="size-4 text-accent" />
                {left > 0 ? <>До бесплатной доставки: {formatPrice(left)}</> : 'Бесплатная доставка ✓'}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Товары ({count})</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
              {savings > 0 && <div className="flex justify-between text-accent"><dt>Ваша скидка</dt><dd className="font-semibold">−{formatPrice(savings)}</dd></div>}
              <div className="flex justify-between"><dt className="text-neutral-500">Доставка</dt><dd className="font-semibold">рассчитаем на следующем шаге</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="font-bold">К оплате</span>
              <span className="font-display text-2xl font-bold">{formatPrice(subtotal)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-accent mt-6 w-full py-4 text-base">Оформить заказ <ArrowRight className="size-5" /></button>
            <Link to="/catalog" className="mt-3 block text-center text-sm font-bold text-neutral-500 hover:text-ink">Продолжить покупки</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
