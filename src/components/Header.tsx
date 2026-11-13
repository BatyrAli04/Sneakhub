import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Logo from './Logo'

const NAV = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог', end: true },
  { to: '/catalog?badge=NEW', label: 'Новинки' },
  { to: '/catalog?badge=SALE', label: 'Sale' },
]

export default function Header() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => setOpen(false), [location])
  useEffect(() => setQ(params.get('q') ?? ''), [params])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = q.trim()
    navigate(v ? `/catalog?q=${encodeURIComponent(v)}` : '/catalog')
  }

  const isActive = (to: string, end?: boolean) => {
    const [path, query] = to.split('?')
    if (query) return location.pathname === path && location.search === `?${query}`
    return end ? location.pathname === path && (path !== '/catalog' || !/badge=/.test(location.search)) : location.pathname.startsWith(path)
  }

  const searchForm = (mobile = false) => (
    <form onSubmit={submit} role="search" className={mobile ? 'relative w-full' : 'relative hidden w-full max-w-xs lg:block'}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск: модель или бренд"
        aria-label="Поиск товаров"
        className="w-full rounded-full border border-line bg-mist py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-ink focus:bg-white"
      />
    </form>
  )

  return (
    <header className={`sticky top-0 z-40 bg-white/85 backdrop-blur-xl transition-shadow ${scrolled ? 'shadow-[0_1px_0_var(--color-line)]' : ''}`}>
      <div className="container-x flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
        <button className="-ml-2 rounded-full p-2 hover:bg-mist md:hidden" onClick={() => setOpen(true)} aria-label="Открыть меню">
          <Menu className="size-6" />
        </button>
        <Link to="/" aria-label="SNEAKHUB — на главную" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={() =>
                `rounded-full px-4 py-2 text-sm font-bold transition ${isActive(n.to, n.end) ? 'bg-ink text-white' : 'text-neutral-600 hover:text-ink'} ${n.label === 'Sale' && !isActive(n.to) ? '!text-accent' : ''}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2">
          {searchForm()}
          <Link to="/catalog" className="rounded-full p-2.5 hover:bg-mist lg:hidden" aria-label="Поиск">
            <Search className="size-5" />
          </Link>
          <Link to="/cart" className="relative rounded-full p-2.5 transition hover:bg-mist" aria-label={`Корзина, товаров: ${count}`}>
            <ShoppingBag className="size-6" />
            {count > 0 && (
              <span key={count} className="absolute right-0.5 top-0.5 grid min-w-5 animate-fade-up place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold leading-5 text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* мобильное меню */}
      <div className={`fixed inset-0 z-50 transition-[visibility] md:hidden ${open ? 'visible' : 'pointer-events-none invisible delay-300'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white p-5 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-mist" aria-label="Закрыть меню">
              <X className="size-6" />
            </button>
          </div>
          {searchForm(true)}
          <nav className="mt-6 flex flex-col">
            {[...NAV, { to: '/cart', label: 'Корзина' }].map((n) => (
              <Link key={n.to} to={n.to} className="border-b border-line py-4 font-display text-xl font-bold">
                {n.label}
              </Link>
            ))}
          </nav>
          <p className="mt-auto text-xs text-neutral-500">Демо-магазин. Цены и наличие — тестовые.</p>
        </div>
      </div>
    </header>
  )
}
