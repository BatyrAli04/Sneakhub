import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CreditCard, FlaskConical, Loader2, Lock, Wallet } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import { CITIES, DELIVERY, FREE_DELIVERY_FROM, PAYMENT, TEST_CARD_DECLINE, TEST_CARD_OK, deliveryCost, expiryValid, formatPhone, isValidKzPhone, luhn, newOrderId, onlyDigits, saveOrder } from '../lib/orders'
import { productTitle, stockFor } from '../data/products'
import SneakerArt from '../components/SneakerArt'
import type { DeliveryMethod, Order, PaymentMethod } from '../types'

interface Form {
  name: string
  phone: string
  city: string
  address: string
  comment: string
  delivery: DeliveryMethod
  payment: PaymentMethod
  card: string
  exp: string
  cvc: string
  agree: boolean
}
type Errors = Partial<Record<keyof Form, string>>

const DRAFT_KEY = 'sneakhub:checkout-draft'

export default function Checkout() {
  const { lines, subtotal, clear, count } = useCart()
  const navigate = useNavigate()

  const [f, setF] = useState<Form>(() => {
    const base: Form = { name: '', phone: '', city: '', address: '', comment: '', delivery: 'post', payment: 'test-card', card: '', exp: '', cvc: '', agree: false }
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}')
      return { ...base, name: d.name ?? '', phone: d.phone ?? '', city: d.city ?? '', address: d.address ?? '', comment: d.comment ?? '' }
    } catch { return base }
  })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [payError, setPayError] = useState('')

  // черновик контактов (без данных карты) — чтобы не потерять при перезагрузке
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name: f.name, phone: f.phone, city: f.city, address: f.address, comment: f.comment })) } catch { /* ignore */ }
  }, [f.name, f.phone, f.city, f.address, f.comment])

  // если выбранный способ доставки недоступен в городе — переключаем на доступный
  useEffect(() => {
    if (!f.city) return
    const cur = DELIVERY.find((d) => d.id === f.delivery)!
    if (!cur.available(f.city)) {
      const first = DELIVERY.find((d) => d.available(f.city))!
      setF((s) => ({ ...s, delivery: first.id }))
    }
  }, [f.city])

  const delivery = DELIVERY.find((d) => d.id === f.delivery)!
  const shipCost = deliveryCost(f.delivery, subtotal)
  const total = subtotal + shipCost

  const validate = (v: Form): Errors => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = 'Укажите имя'
    else if (name.length < 2) e.name = 'Слишком короткое имя'
    else if (!/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\s'-]+$/.test(name)) e.name = 'Только буквы, пробел и дефис'
    if (!v.phone || onlyDigits(v.phone).length <= 1) e.phone = 'Укажите номер телефона'
    else if (!isValidKzPhone(v.phone)) e.phone = 'Формат: +7 (7XX) XXX-XX-XX'
    if (!v.city) e.city = 'Выберите город'
    const opt = DELIVERY.find((d) => d.id === v.delivery)!
    if (v.city && !opt.available(v.city)) e.delivery = 'Этот способ недоступен в выбранном городе'
    if (opt.needsAddress) {
      if (!v.address.trim()) e.address = 'Укажите адрес доставки'
      else if (v.address.trim().length < 6) e.address = 'Уточните адрес: улица, дом, квартира'
    }
    if (v.payment === 'test-card') {
      const digits = onlyDigits(v.card)
      if (!digits) e.card = 'Введите номер тестовой карты'
      else if (digits.length !== 16 || !luhn(digits)) e.card = 'Неверный номер карты'
      if (!v.exp) e.exp = 'ММ/ГГ'
      else if (!expiryValid(v.exp)) e.exp = 'Неверный срок'
      if (!/^\d{3}$/.test(v.cvc)) e.cvc = '3 цифры'
    }
    if (!v.agree) e.agree = 'Нужно согласие на обработку данных'
    return e
  }

  const liveErrors = useMemo(() => validate(f), [f])
  const showErr = (k: keyof Form) => (touched[k] || Object.keys(errors).length > 0) && liveErrors[k]

  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((s) => ({ ...s, [k]: v })); setPayError('') }
  const blur = (k: keyof Form) => setTouched((t) => ({ ...t, [k]: true }))

  if (lines.length === 0 && !submitting) return <Navigate to="/cart" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(f)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = document.querySelector<HTMLElement>(`[data-field="${Object.keys(errs)[0]}"]`)
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      first?.querySelector<HTMLElement>('input,select,textarea')?.focus({ preventScroll: true })
      return
    }
    // проверка остатков на момент оформления
    const shortage = lines.find((l) => stockFor(l.product, l.size) < l.qty)
    if (shortage) { setPayError(`${productTitle(shortage.product)} EU ${shortage.size}: недостаточно на складе. Обновите корзину.`); return }

    setSubmitting(true)
    setPayError('')
    await new Promise((r) => setTimeout(r, 1400)) // имитация обработки платежа

    if (f.payment === 'test-card' && onlyDigits(f.card) === onlyDigits(TEST_CARD_DECLINE)) {
      setSubmitting(false)
      setPayError('Тестовый банк отклонил платёж (сценарий «отказ»). Попробуйте карту 4242 4242 4242 4242 или оплату при получении.')
      return
    }

    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      customer: { name: f.name.trim(), phone: f.phone, city: f.city, address: delivery.needsAddress ? f.address.trim() : 'Самовывоз: шоурум SNEAKHUB, Алматы', comment: f.comment.trim() },
      delivery: f.delivery,
      payment: f.payment,
      items: lines.map((l) => ({ productId: l.productId, title: productTitle(l.product), size: l.size, qty: l.qty, price: l.product.price })),
      subtotal,
      deliveryCost: shipCost,
      total,
      status: f.payment === 'test-card' ? 'paid-test' : 'awaiting-cash',
    }
    const saved = saveOrder(order)
    try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    clear()
    navigate(`/order/${order.id}`, { replace: true, state: saved ? undefined : { order } })
  }

  return (
    <div className="container-x pt-8 sm:pt-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-ink"><ArrowLeft className="size-4" /> Вернуться в корзину</Link>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Оформление заказа</h1>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-accent" />
        <p><b>Тестовый режим.</b> Это демонстрационный магазин: настоящая оплата не подключена, деньги не списываются, заказ сохраняется только в вашем браузере.</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <Step n={1} title="Контактные данные">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Имя и фамилия" error={showErr('name')}>
                <input className={`input ${showErr('name') ? 'input-error' : ''}`} value={f.name} onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')} autoComplete="name" placeholder="Айгерим Сапарова" />
              </Field>
              <Field name="phone" label="Телефон" error={showErr('phone')}>
                <input className={`input ${showErr('phone') ? 'input-error' : ''}`} value={f.phone} onChange={(e) => set('phone', e.target.value ? formatPhone(e.target.value) : '')} onFocus={() => !f.phone && set('phone', '+7')} onBlur={() => { blur('phone'); if (f.phone === '+7') set('phone', '') }} inputMode="tel" autoComplete="tel" placeholder="+7 (7XX) XXX-XX-XX" />
              </Field>
            </div>
          </Step>

          <Step n={2} title="Доставка">
            <div className="grid gap-4">
              <Field name="city" label="Город" error={showErr('city')}>
                <select className={`input ${showErr('city') ? 'input-error' : ''} ${f.city ? '' : 'text-neutral-400'}`} value={f.city} onChange={(e) => set('city', e.target.value)} onBlur={() => blur('city')}>
                  <option value="" disabled>Выберите город</option>
                  {CITIES.map((c) => <option key={c} value={c} className="text-ink">{c}</option>)}
                </select>
              </Field>

              <div data-field="delivery" className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Способ доставки">
                {DELIVERY.map((d) => {
                  const ok = !f.city || d.available(f.city)
                  const cost = deliveryCost(d.id, subtotal)
                  return (
                    <label key={d.id} className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition ${f.delivery === d.id ? 'border-ink' : 'border-line hover:border-neutral-400'} ${ok ? '' : 'cursor-not-allowed opacity-40'}`}>
                      <input type="radio" name="delivery" className="sr-only" checked={f.delivery === d.id} disabled={!ok} onChange={() => set('delivery', d.id)} />
                      <span className="font-extrabold">{d.title}</span>
                      <span className="mt-1 text-xs text-neutral-500">{d.eta} · {d.note}</span>
                      <span className="mt-3 text-sm font-bold">{cost === 0 ? <span className="text-green-700">Бесплатно</span> : formatPrice(cost)}</span>
                    </label>
                  )
                })}
              </div>
              {showErr('delivery') && <p className="text-sm font-semibold text-red-600">{liveErrors.delivery}</p>}
              {subtotal < FREE_DELIVERY_FROM && <p className="text-xs text-neutral-500">Курьер и почта бесплатно для заказов от {formatPrice(FREE_DELIVERY_FROM)}.</p>}

              {delivery.needsAddress ? (
                <Field name="address" label="Адрес доставки" error={showErr('address')}>
                  <input className={`input ${showErr('address') ? 'input-error' : ''}`} value={f.address} onChange={(e) => set('address', e.target.value)} onBlur={() => blur('address')} autoComplete="street-address" placeholder="Улица, дом, квартира" />
                </Field>
              ) : (
                <div className="rounded-2xl bg-mist p-4 text-sm">
                  <b>Шоурум SNEAKHUB</b> — Алматы, адрес пришлём в SMS после подтверждения (демо). Ежедневно 10:00–21:00.
                </div>
              )}
              <Field name="comment" label="Комментарий к заказу (необязательно)">
                <textarea className="input min-h-24 resize-y" value={f.comment} onChange={(e) => set('comment', e.target.value)} placeholder="Например: позвонить за час до доставки" maxLength={300} />
              </Field>
            </div>
          </Step>

          <Step n={3} title="Оплата">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Способ оплаты">
              {PAYMENT.map((p) => (
                <label key={p.id} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition ${f.payment === p.id ? 'border-ink' : 'border-line hover:border-neutral-400'}`}>
                  <input type="radio" name="payment" className="sr-only" checked={f.payment === p.id} onChange={() => set('payment', p.id)} />
                  {p.id === 'test-card' ? <CreditCard className="size-6 shrink-0" /> : <Wallet className="size-6 shrink-0" />}
                  <span>
                    <span className="block font-extrabold">{p.title}</span>
                    <span className="mt-0.5 block text-xs text-neutral-500">{p.text}</span>
                  </span>
                </label>
              ))}
            </div>

            {f.payment === 'test-card' && (
              <div className="mt-4 rounded-3xl bg-ink p-5 text-white sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-extrabold tracking-widest">ТЕСТОВАЯ ОПЛАТА</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/60"><Lock className="size-3.5" /> Данные карты никуда не отправляются</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_110px_90px]">
                  <Field name="card" label="Номер карты" error={showErr('card')} dark>
                    <input className={`input border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white ${showErr('card') ? 'input-error' : ''}`} value={f.card} onChange={(e) => set('card', onlyDigits(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))} onBlur={() => blur('card')} inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" />
                  </Field>
                  <Field name="exp" label="Срок" error={showErr('exp')} dark>
                    <input className={`input border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white ${showErr('exp') ? 'input-error' : ''}`} value={f.exp} onChange={(e) => { const d = onlyDigits(e.target.value).slice(0, 4); set('exp', d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d) }} onBlur={() => blur('exp')} inputMode="numeric" autoComplete="off" placeholder="ММ/ГГ" />
                  </Field>
                  <Field name="cvc" label="CVC" error={showErr('cvc')} dark>
                    <input className={`input border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white ${showErr('cvc') ? 'input-error' : ''}`} value={f.cvc} onChange={(e) => set('cvc', onlyDigits(e.target.value).slice(0, 3))} onBlur={() => blur('cvc')} inputMode="numeric" autoComplete="off" placeholder="123" type="password" />
                  </Field>
                </div>
                <div className="mt-4 rounded-2xl bg-white/5 p-4 text-xs text-white/70">
                  <p className="font-bold text-white">Тестовые карты (любой будущий срок, любой CVC):</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setF((s) => ({ ...s, card: TEST_CARD_OK, exp: s.exp || '12/30', cvc: s.cvc || '123' })); setPayError('') }} className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-white hover:bg-white/20">{TEST_CARD_OK} — успех</button>
                    <button type="button" onClick={() => { setF((s) => ({ ...s, card: TEST_CARD_DECLINE, exp: s.exp || '12/30', cvc: s.cvc || '123' })); setPayError('') }} className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-white hover:bg-white/20">{TEST_CARD_DECLINE} — отказ</button>
                  </div>
                </div>
              </div>
            )}

            <label data-field="agree" className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={f.agree} onChange={(e) => { set('agree', e.target.checked); blur('agree') }} className="mt-0.5 size-5 accent-[#FF5A1F]" />
              <span>Согласен(на) на обработку персональных данных и понимаю, что это <b>демонстрационный заказ</b>.</span>
            </label>
            {showErr('agree') && <p className="mt-2 text-sm font-semibold text-red-600">{liveErrors.agree}</p>}
          </Step>
        </div>

        {/* СВОДКА */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-mist p-6">
            <h2 className="font-display text-xl font-bold">Ваш заказ · {count} шт.</h2>
            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.size}`} className="flex items-center gap-3">
                  <span className="relative shrink-0 rounded-xl" style={{ background: l.product.palette.bg }}>
                    <SneakerArt palette={l.product.palette} silhouette={l.product.silhouette} background={false} className="h-14 w-16 p-1" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">{l.qty}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{productTitle(l.product)}</span>
                    <span className="block text-xs text-neutral-500">EU {l.size}</span>
                  </span>
                  <span className="text-sm font-bold">{formatPrice(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Товары</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Доставка · {delivery.title}</dt><dd className="font-semibold">{shipCost === 0 ? 'Бесплатно' : formatPrice(shipCost)}</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="font-bold">Итого</span>
              <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
            </div>

            {payError && (
              <div className="mt-5 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">
                <AlertTriangle className="size-5 shrink-0" /> {payError}
              </div>
            )}
            {Object.keys(errors).length > 0 && Object.keys(liveErrors).length > 0 && (
              <p className="mt-5 text-sm font-semibold text-red-600" role="alert">Проверьте поля, отмеченные красным</p>
            )}

            <button type="submit" disabled={submitting} className="btn-accent mt-6 w-full py-4 text-base">
              {submitting ? <><Loader2 className="size-5 animate-spin" /> Обрабатываем…</> : f.payment === 'test-card' ? `Оплатить ${formatPrice(total)} (тест)` : 'Подтвердить заказ'}
            </button>
            <p className="mt-3 text-center text-xs text-neutral-500">Реальная оплата не производится</p>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-bold">
        <span className="grid size-8 place-items-center rounded-full bg-ink font-sans text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ name, label, error, dark, children }: { name: string; label: string; error?: string | false; dark?: boolean; children: ReactNode }) {
  return (
    <div data-field={name}>
      <label className={`label ${dark ? 'text-white/80' : ''}`}>
        {label}
        <div className="mt-1.5 font-normal">{children}</div>
      </label>
      {error && <p className={`mt-1.5 text-xs font-semibold ${dark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>}
    </div>
  )
}
