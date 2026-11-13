import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { BRANDS } from '../data/products'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-neutral-300">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-neutral-400">
            Твой стиль начинается с первого шага. Кроссовки популярных брендов с доставкой по Казахстану.
          </p>
          <p className="mt-6 inline-block rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-400">
            Демо-версия: заказы и оплата тестовые
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-white">Магазин</h3>
          <ul className="space-y-3 text-sm">
            <li><Link className="hover:text-accent" to="/catalog">Весь каталог</Link></li>
            <li><Link className="hover:text-accent" to="/catalog?badge=NEW">Новинки</Link></li>
            <li><Link className="hover:text-accent" to="/catalog?badge=BESTSELLER">Хиты продаж</Link></li>
            <li><Link className="hover:text-accent" to="/catalog?badge=SALE">Распродажа</Link></li>
            <li><Link className="hover:text-accent" to="/cart">Корзина</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-white">Бренды</h3>
          <ul className="grid grid-cols-2 gap-3 text-sm">
            {BRANDS.map((b) => (
              <li key={b}><Link className="hover:text-accent" to={`/catalog?brand=${encodeURIComponent(b)}`}>{b}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-white">Контакты</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><Phone className="size-4 shrink-0 text-accent" /> +7 (700) 000-00-00 <span className="text-neutral-500">(демо)</span></li>
            <li className="flex gap-3"><Mail className="size-4 shrink-0 text-accent" /> hello@sneakhub.kz <span className="text-neutral-500">(демо)</span></li>
            <li className="flex gap-3"><MapPin className="size-4 shrink-0 text-accent" /> Алматы, Казахстан</li>
            <li className="flex gap-3"><Clock className="size-4 shrink-0 text-accent" /> Ежедневно, 10:00–21:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SNEAKHUB. MVP-демонстрация интернет-магазина.</span>
          <span>Названия брендов принадлежат их правообладателям. Изображения — иллюстрации-заглушки.</span>
        </div>
      </div>
    </footer>
  )
}
