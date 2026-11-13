import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { pathname } = useLocation()
  const { storageOk } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-accent px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <FlaskConical className="mr-1.5 inline size-4 -translate-y-px" />
        Демо-магазин: цены, остатки и оплата — тестовые, реальные заказы не принимаются
      </div>
      {!storageOk && (
        <div className="bg-yellow-100 px-4 py-2 text-center text-xs text-yellow-900">
          Браузер не даёт сохранить данные — корзина сбросится после перезагрузки страницы.
        </div>
      )}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
