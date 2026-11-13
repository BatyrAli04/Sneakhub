import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BadgeCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { BRANDS, PRODUCTS } from '../data/products'
import ProductCard from '../components/ProductCard'
import SneakerArt from '../components/SneakerArt'
import { formatPrice } from '../lib/format'

const heroProduct = PRODUCTS.find((p) => p.id === 'nike-air-max-90') ?? PRODUCTS[0]
const sideProduct = PRODUCTS.find((p) => p.id === 'new-balance-9060') ?? PRODUCTS[1]

const bestsellers = PRODUCTS.filter((p) => p.badges.includes('BESTSELLER')).sort((a, b) => b.popularity - a.popularity).slice(0, 4)
const newArrivals = [...PRODUCTS].filter((p) => p.badges.includes('NEW')).sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)).slice(0, 4)

const PERKS = [
  { icon: BadgeCheck, title: 'Только оригинал', text: 'Каждая пара проходит проверку подлинности перед отправкой.' },
  { icon: Truck, title: 'Доставка по Казахстану', text: 'Курьер по Алматы и Астане за 1–2 дня, почта — по всей стране.' },
  { icon: RotateCcw, title: 'Возврат 14 дней', text: 'Не подошёл размер — обменяем или вернём деньги.' },
  { icon: ShieldCheck, title: 'Безопасная оплата', text: 'Картой онлайн или при получении. В демо-версии — тестовый режим.' },
]

function SectionHead({ eyebrow, title, to, cta }: { eyebrow: string; title: string; to: string; cta: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.25em] text-accent">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <Link to={to} className="group hidden shrink-0 items-center gap-2 text-sm font-bold sm:flex">
        {cta}
        <span className="grid size-9 place-items-center rounded-full border border-line transition group-hover:border-ink group-hover:bg-ink group-hover:text-white">
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="container-x pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink text-white sm:rounded-[2.5rem]">
          <div className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-accent/90 blur-[2px] sm:size-[36rem] lg:right-10" />
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:18px_18px] lg:block" />

          <div className="relative grid items-center gap-6 px-6 pb-10 pt-12 sm:px-12 lg:grid-cols-[1.05fr_1fr] lg:px-16 lg:py-20">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80">
                <span className="size-1.5 rounded-full bg-accent" /> Новая коллекция · осень–зима
              </p>
              <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
                Твой стиль начинается с&nbsp;<span className="text-accent lg:text-white">первого шага</span>
              </h1>
              <p className="mt-6 max-w-md text-base text-white/70 sm:text-lg">
                Nike, Adidas, New Balance, ASICS, Puma и другие бренды — с доставкой по всему Казахстану.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/catalog" className="btn-accent px-7 py-4 text-base lg:bg-white lg:text-ink lg:hover:bg-accent lg:hover:text-white">
                  Смотреть коллекцию <ArrowRight className="size-5" />
                </Link>
                <Link to="/catalog?badge=SALE" className="btn border border-white/20 px-7 py-4 text-base text-white hover:border-white">
                  Распродажа
                </Link>
              </div>
              <dl className="mt-10 flex gap-8 text-sm sm:gap-12">
                {[
                  [`${PRODUCTS.length}+`, 'моделей в каталоге'],
                  [`${BRANDS.length}`, 'брендов'],
                  ['36–46', 'размеры EU'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-display text-2xl font-bold">{n}</dt>
                    <dd className="mt-1 text-white/55">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <Link to={`/product/${heroProduct.id}`} className="block" aria-label={`${heroProduct.brand} ${heroProduct.model}`}>
                <SneakerArt
                  palette={heroProduct.palette}
                  silhouette={heroProduct.silhouette}
                  background={false}
                  className="w-full animate-float drop-shadow-[0_40px_40px_rgba(0,0,0,.45)]"
                  title={`${heroProduct.brand} ${heroProduct.model} — демо-изображение`}
                />
              </Link>
              <Link
                to={`/product/${heroProduct.id}`}
                className="absolute bottom-0 left-0 flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-4 text-ink shadow-xl backdrop-blur transition hover:-translate-y-0.5 sm:bottom-4"
              >
                <span className="grid size-11 place-items-center rounded-xl" style={{ background: heroProduct.palette.bg }}>
                  <SneakerArt palette={heroProduct.palette} silhouette={heroProduct.silhouette} background={false} className="w-10" />
                </span>
                <span>
                  <span className="block text-xs font-bold text-neutral-500">{heroProduct.brand}</span>
                  <span className="block text-sm font-extrabold">{heroProduct.model} · {formatPrice(heroProduct.price)}</span>
                </span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS MARQUEE */}
      <section className="mt-16">
        <div className="container-x">
          <SectionHead eyebrow="Бренды" title="Популярные бренды" to="/catalog" cta="Все бренды" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {BRANDS.slice(0, 5).map((b, i) => {
              const count = PRODUCTS.filter((p) => p.brand === b).length
              return (
                <Link
                  key={b}
                  to={`/catalog?brand=${encodeURIComponent(b)}`}
                  className={`group relative flex h-32 flex-col justify-between overflow-hidden rounded-3xl border border-line p-5 transition hover:-translate-y-1 hover:border-ink hover:shadow-xl ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">{b}</span>
                  <span className="flex items-center justify-between text-sm text-neutral-500">
                    {count} {count === 1 ? 'модель' : count < 5 ? 'модели' : 'моделей'}
                    <ArrowUpRight className="size-5 transition group-hover:rotate-45 group-hover:text-accent" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="mt-6 overflow-hidden border-y border-line bg-mist py-4">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-lg font-bold uppercase tracking-wider text-neutral-400">
            {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
              <Link key={i} to={`/catalog?brand=${encodeURIComponent(b)}`} className="flex items-center gap-10 hover:text-ink">
                {b} <span className="text-accent">✦</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-x mt-20">
        <SectionHead eyebrow="Bestseller" title="Хиты продаж" to="/catalog?badge=BESTSELLER" cta="Все хиты" />
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container-x mt-20">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-mist md:grid-cols-2">
          <div className="relative z-10 p-8 sm:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[.25em] text-accent">Sale</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Скидки до&nbsp;20% на&nbsp;любимую классику</h2>
            <p className="mt-4 max-w-sm text-neutral-600">Dunk, Forum, Suede, Club C и другие модели по сниженным ценам, пока есть размеры.</p>
            <Link to="/catalog?badge=SALE" className="btn-primary mt-8">Перейти в Sale <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative min-h-56">
            <div className="absolute right-[-20%] top-1/2 size-[26rem] -translate-y-1/2 rounded-full bg-accent" />
            <SneakerArt palette={sideProduct.palette} silhouette={sideProduct.silhouette} view="mirror" background={false} className="relative h-full w-full -rotate-6 p-6 drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-x mt-20">
        <SectionHead eyebrow="Just dropped" title="Новые поступления" to="/catalog?badge=NEW" cta="Все новинки" />
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Link to="/catalog" className="btn-ghost w-full">Весь каталог <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      {/* PERKS */}
      <section className="container-x mt-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group rounded-3xl border border-line p-6 transition hover:border-ink">
              <span className="grid size-12 place-items-center rounded-2xl bg-mist transition group-hover:bg-accent group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
