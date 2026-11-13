import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX, SlidersHorizontal, X, Search } from 'lucide-react'
import { ALL_SIZES, BRANDS, CATEGORY_LABELS, PRODUCTS } from '../data/products'
import ProductCard from '../components/ProductCard'
import { formatPrice, plural } from '../lib/format'
import type { Badge, Category } from '../types'

type Sort = 'popular' | 'price-asc' | 'price-desc' | 'new'
const SORTS: { v: Sort; l: string }[] = [
  { v: 'popular', l: 'По популярности' },
  { v: 'price-asc', l: 'Сначала дешевле' },
  { v: 'price-desc', l: 'Сначала дороже' },
  { v: 'new', l: 'Сначала новые' },
]
const BADGE_LABELS: Record<Badge, string> = { NEW: 'Новинки', SALE: 'Распродажа', BESTSELLER: 'Хиты продаж' }

const PRICE_MIN = Math.min(...PRODUCTS.map((p) => p.price))
const PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price))

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim()

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [drawer, setDrawer] = useState(false)

  const q = params.get('q') ?? ''
  const brands = list(params.get('brand'))
  const cats = list(params.get('cat')) as Category[]
  const sizes = list(params.get('size')).map(Number).filter((n) => !Number.isNaN(n))
  const badge = params.get('badge') as Badge | null
  const sort = (params.get('sort') as Sort) || 'popular'
  const minP = Number(params.get('min')) || ''
  const maxP = Number(params.get('max')) || ''

  // локальные значения полей цены, чтобы не дёргать URL на каждый символ
  const [priceDraft, setPriceDraft] = useState({ min: String(minP), max: String(maxP) })
  useEffect(() => setPriceDraft({ min: String(minP), max: String(maxP) }), [minP, maxP])
  const [qDraft, setQDraft] = useState(q)
  useEffect(() => setQDraft(q), [q])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  const update = (patch: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(',') : v
      if (val) next.set(k, val)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }
  const toggle = <T extends string | number>(key: string, arr: T[], v: T) =>
    update({ [key]: (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]).map(String) })

  const applyPrice = () => {
    let a = parseInt(priceDraft.min.replace(/\D/g, '')) || 0
    let b = parseInt(priceDraft.max.replace(/\D/g, '')) || 0
    if (a && b && a > b) [a, b] = [b, a]
    update({ min: a ? String(a) : null, max: b ? String(b) : null })
  }

  const results = useMemo(() => {
    const nq = norm(q)
    const words = nq ? nq.split(' ') : []
    let r = PRODUCTS.filter((p) => {
      if (words.length) {
        const hay = norm(`${p.brand} ${p.model} ${p.colorway} ${CATEGORY_LABELS[p.category]}`)
        if (!words.every((w) => hay.includes(w))) return false
      }
      if (brands.length && !brands.includes(p.brand)) return false
      if (cats.length && !cats.includes(p.category)) return false
      if (badge && !p.badges.includes(badge)) return false
      if (sizes.length && !p.sizes.some((s) => s.stock > 0 && sizes.includes(s.size))) return false
      if (minP && p.price < minP) return false
      if (maxP && p.price > maxP) return false
      return true
    })
    r = [...r].sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'new': return +new Date(b.addedAt) - +new Date(a.addedAt)
        default: return b.popularity - a.popularity
      }
    })
    return r
  }, [q, brands.join(), cats.join(), sizes.join(), badge, minP, maxP, sort])

  const activeChips: { label: string; clear: () => void }[] = [
    ...(q ? [{ label: `«${q}»`, clear: () => update({ q: null }) }] : []),
    ...(badge ? [{ label: BADGE_LABELS[badge] ?? badge, clear: () => update({ badge: null }) }] : []),
    ...brands.map((b) => ({ label: b, clear: () => toggle('brand', brands, b) })),
    ...cats.map((c) => ({ label: CATEGORY_LABELS[c] ?? c, clear: () => toggle('cat', cats, c) })),
    ...sizes.map((s) => ({ label: `EU ${s}`, clear: () => toggle('size', sizes, s) })),
    ...(minP || maxP ? [{ label: `${minP ? 'от ' + formatPrice(minP) : ''} ${maxP ? 'до ' + formatPrice(maxP) : ''}`.trim(), clear: () => update({ min: null, max: null }) }] : []),
  ]
  const resetAll = () => setParams(new URLSearchParams(sort !== 'popular' ? { sort } : {}), { replace: true })

  const title = badge ? BADGE_LABELS[badge] : brands.length === 1 && !cats.length ? brands[0] : 'Каталог кроссовок'

  const Filters = (
    <div className="space-y-8">
      <FilterGroup title="Подборка">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BADGE_LABELS) as Badge[]).map((b) => (
            <button key={b} onClick={() => update({ badge: badge === b ? null : b })} className={`chip ${badge === b ? 'chip-on' : ''}`}>
              {BADGE_LABELS[b]}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Бренд">
        <div className="space-y-1">
          {BRANDS.map((b) => {
            const n = PRODUCTS.filter((p) => p.brand === b).length
            return (
              <label key={b} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-mist">
                <input type="checkbox" checked={brands.includes(b)} onChange={() => toggle('brand', brands, b)} className="size-4 accent-[#FF5A1F]" />
                <span className="flex-1 text-sm font-semibold">{b}</span>
                <span className="text-xs text-neutral-400">{n}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Категория">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <button key={c} onClick={() => toggle('cat', cats, c)} className={`chip ${cats.includes(c) ? 'chip-on' : ''}`}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Размер EU">
        <div className="grid grid-cols-4 gap-2">
          {ALL_SIZES.map((s) => (
            <button key={s} onClick={() => toggle('size', sizes, s)} className={`rounded-xl border py-2.5 text-sm font-bold transition ${sizes.includes(s) ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'}`}>
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">Показываем модели, где размер есть в наличии</p>
      </FilterGroup>

      <FilterGroup title="Цена, ₸">
        <form onSubmit={(e) => { e.preventDefault(); applyPrice() }} className="space-y-3">
          <div className="flex items-center gap-2">
            <input inputMode="numeric" className="input py-2.5 text-sm" placeholder={`от ${PRICE_MIN.toLocaleString('ru-RU')}`} value={priceDraft.min} onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value.replace(/\D/g, '') }))} onBlur={applyPrice} aria-label="Минимальная цена" />
            <span className="text-neutral-400">—</span>
            <input inputMode="numeric" className="input py-2.5 text-sm" placeholder={`до ${PRICE_MAX.toLocaleString('ru-RU')}`} value={priceDraft.max} onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value.replace(/\D/g, '') }))} onBlur={applyPrice} aria-label="Максимальная цена" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[[0, 40000, 'до 40 000'], [40000, 60000, '40–60 тыс.'], [60000, 80000, '60–80 тыс.'], [80000, 0, 'от 80 000']].map(([a, b, l]) => (
              <button type="button" key={l} onClick={() => update({ min: a ? String(a) : null, max: b ? String(b) : null })} className={`chip px-3 py-1.5 text-xs ${minP === (a || '') && maxP === (b || '') ? 'chip-on' : ''}`}>
                {l}
              </button>
            ))}
          </div>
        </form>
      </FilterGroup>
    </div>
  )

  return (
    <div className="container-x pt-8 sm:pt-12">
      <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.25em] text-accent">SNEAKHUB</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 text-neutral-500">
            {results.length} {plural(results.length, 'модель', 'модели', 'моделей')} · цены демонстрационные
          </p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); update({ q: qDraft.trim() || null }) }} className="relative w-full md:max-w-sm" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
          <input value={qDraft} onChange={(e) => setQDraft(e.target.value)} placeholder="Найти: Samba, 550, Jordan…" className="input rounded-full pl-12 pr-24" aria-label="Поиск по каталогу" />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-accent">Найти</button>
        </form>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2 no-scrollbar">{Filters}</div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button onClick={() => setDrawer(true)} className="btn-ghost py-2.5 lg:hidden">
              <SlidersHorizontal className="size-4" /> Фильтры {activeChips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-white">{activeChips.length}</span>}
            </button>
            <div className="flex flex-1 flex-wrap gap-2">
              {activeChips.map((c) => (
                <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-bold hover:bg-line">
                  {c.label} <X className="size-3.5" />
                </button>
              ))}
              {activeChips.length > 1 && (
                <button onClick={resetAll} className="px-2 text-xs font-bold text-accent hover:underline">Сбросить всё</button>
              )}
            </div>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="hidden text-neutral-500 sm:inline">Сортировка:</span>
              <select value={sort} onChange={(e) => update({ sort: e.target.value === 'popular' ? null : e.target.value })} className="rounded-full border border-line bg-white px-4 py-2.5 font-bold outline-none focus:border-ink">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl bg-mist px-6 py-20 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-white"><SearchX className="size-7" /></span>
              <h2 className="mt-6 font-display text-2xl font-bold">Ничего не нашлось</h2>
              <p className="mt-2 max-w-sm text-neutral-500">Попробуйте изменить запрос или ослабить фильтры — например, выбрать другой размер или ценовой диапазон.</p>
              <button onClick={() => setParams(new URLSearchParams(), { replace: true })} className="btn-primary mt-8">Сбросить фильтры</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* мобильная панель фильтров */}
      <div className={`fixed inset-0 z-50 transition-[visibility] lg:hidden ${drawer ? 'visible' : 'pointer-events-none invisible delay-300'}`} aria-hidden={!drawer}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${drawer ? 'opacity-100' : 'opacity-0'}`} onClick={() => setDrawer(false)} />
        <div className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[2rem] bg-white transition-transform duration-300 ${drawer ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-bold">Фильтры</h2>
            <button onClick={() => setDrawer(false)} className="rounded-full p-2 hover:bg-mist" aria-label="Закрыть фильтры"><X className="size-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{Filters}</div>
          <div className="flex gap-3 border-t border-line p-4">
            <button onClick={resetAll} className="btn-ghost flex-1">Сбросить</button>
            <button onClick={() => setDrawer(false)} className="btn-primary flex-[2]">Показать {results.length}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-neutral-500">{title}</h3>
      {children}
    </section>
  )
}
