import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, FlaskConical, Package } from 'lucide-react'
import { DELIVERY, PAYMENT, getOrder } from '../lib/orders'
import { formatPrice } from '../lib/format'
import type { Order } from '../types'
import NotFound from './NotFound'

export default function OrderSuccess() {
  const { id = '' } = useParams()
  const location = useLocation()
  const order: Order | undefined = getOrder(id) ?? (location.state as { order?: Order } | null)?.order

  if (!order) return <NotFound title="Заказ не найден" text="Демо-заказы хранятся только в этом браузере. Возможно, данные были очищены." />

  const delivery = DELIVERY.find((d) => d.id === order.delivery)
  const payment = PAYMENT.find((p) => p.id === order.payment)

  return (
    <div className="container-x max-w-3xl pt-10 sm:pt-16">
      <div className="animate-fade-up text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-accent text-white shadow-xl shadow-accent/30"><CheckCircle2 className="size-10" /></span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Спасибо, {order.customer.name.split(' ')[0]}!</h1>
        <p className="mt-3 text-neutral-500">Заказ оформлен. Номер заказа:</p>
        <p className="mt-2 inline-block rounded-full bg-mist px-5 py-2 font-mono text-lg font-bold">{order.id}</p>
        <p className="mx-auto mt-6 flex max-w-lg items-start gap-2 rounded-2xl border border-accent/30 bg-accent/5 p-4 text-left text-sm">
          <FlaskConical className="mt-0.5 size-5 shrink-0 text-accent" />
          {order.status === 'paid-test'
            ? 'Тестовая оплата прошла успешно. Деньги не списывались — это демонстрационный заказ, он сохранён только в вашем браузере.'
            : 'Оплата при получении. Это демонстрационный заказ: он сохранён только в вашем браузере и не будет доставлен.'}
        </p>
      </div>

      <div className="mt-10 rounded-3xl border border-line p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Package className="size-5 text-accent" /> Состав заказа</h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((i) => (
            <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-4 py-3 text-sm">
              <span><Link to={`/product/${i.productId}`} className="font-bold hover:text-accent">{i.title}</Link> <span className="text-neutral-500">· EU {i.size} × {i.qty}</span></span>
              <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-neutral-500">Товары</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-neutral-500">Доставка</dt><dd>{order.deliveryCost ? formatPrice(order.deliveryCost) : 'Бесплатно'}</dd></div>
          <div className="flex justify-between pt-2 text-base font-extrabold"><dt>Итого</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>

        <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <h3 className="font-extrabold">Получатель</h3>
            <p className="mt-2 text-neutral-600">{order.customer.name}<br />{order.customer.phone}</p>
          </div>
          <div>
            <h3 className="font-extrabold">Доставка и оплата</h3>
            <p className="mt-2 text-neutral-600">{delivery?.title} ({delivery?.eta})<br />{order.customer.city}, {order.customer.address}<br />{payment?.title}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/catalog" className="btn-primary">Продолжить покупки</Link>
        <Link to="/" className="btn-ghost">На главную</Link>
      </div>
    </div>
  )
}
