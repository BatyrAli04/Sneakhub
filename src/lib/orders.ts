import type { DeliveryMethod, Order, PaymentMethod } from '../types'
import { readStorage, writeStorage } from './format'

const KEY = 'sneakhub:orders:v1'

export const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Атырау', 'Павлодар', 'Усть-Каменогорск', 'Костанай', 'Тараз', 'Актау', 'Кызылорда', 'Семей', 'Уральск', 'Петропавловск', 'Другой город']

export const FREE_DELIVERY_FROM = 100000

export interface DeliveryOption {
  id: DeliveryMethod
  title: string
  eta: string
  price: number
  available: (city: string) => boolean
  needsAddress: boolean
  note?: string
}

export const DELIVERY: DeliveryOption[] = [
  { id: 'courier', title: 'Курьер', eta: '1–2 дня', price: 1990, available: (c) => ['Алматы', 'Астана', 'Шымкент'].includes(c), needsAddress: true, note: 'Алматы, Астана, Шымкент' },
  { id: 'pickup', title: 'Самовывоз из шоурума', eta: 'сегодня–завтра', price: 0, available: (c) => c === 'Алматы', needsAddress: false, note: 'Только Алматы' },
  { id: 'post', title: 'Казпочта / служба доставки', eta: '3–7 дней', price: 2990, available: () => true, needsAddress: true, note: 'Все города Казахстана' },
]

export function deliveryCost(method: DeliveryMethod, subtotal: number) {
  const opt = DELIVERY.find((d) => d.id === method)!
  if (opt.price === 0) return 0
  return subtotal >= FREE_DELIVERY_FROM ? 0 : opt.price
}

export const PAYMENT: { id: PaymentMethod; title: string; text: string }[] = [
  { id: 'test-card', title: 'Картой онлайн (тест)', text: 'Демонстрационная оплата — деньги не списываются' },
  { id: 'cash', title: 'При получении', text: 'Наличными или картой курьеру / в пункте выдачи' },
]

export function loadOrders(): Order[] {
  const v = readStorage<Order[]>(KEY, [])
  return Array.isArray(v) ? v : []
}

export function saveOrder(order: Order) {
  return writeStorage(KEY, [order, ...loadOrders()].slice(0, 50))
}

export function getOrder(id: string) {
  return loadOrders().find((o) => o.id === id)
}

export function newOrderId() {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rnd = Math.floor(Math.random() * 9000 + 1000)
  return `SH-${ymd}-${rnd}`
}

// ---------- валидация ----------

export const onlyDigits = (s: string) => s.replace(/\D/g, '')

/** Форматирует ввод в +7 (7XX) XXX-XX-XX */
export function formatPhone(input: string) {
  let d = onlyDigits(input)
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (!d.startsWith('7')) d = '7' + d
  d = d.slice(0, 11)
  const p = d.slice(1)
  let out = '+7'
  if (p.length) out += ' (' + p.slice(0, 3)
  if (p.length >= 3) out += ')'
  if (p.length > 3) out += ' ' + p.slice(3, 6)
  if (p.length > 6) out += '-' + p.slice(6, 8)
  if (p.length > 8) out += '-' + p.slice(8, 10)
  return out
}

export function isValidKzPhone(v: string) {
  const d = onlyDigits(v)
  return d.length === 11 && d.startsWith('7') && /^7[0-7]/.test(d.slice(1))
}

export function luhn(num: string) {
  const d = onlyDigits(num)
  if (d.length < 13) return false
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i]
    if (i % 2) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return sum % 10 === 0
}

export function expiryValid(v: string) {
  const m = v.match(/^(\d{2})\/(\d{2})$/)
  if (!m) return false
  const month = +m[1], year = 2000 + +m[2]
  if (month < 1 || month > 12) return false
  const now = new Date()
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

export const TEST_CARD_OK = '4242 4242 4242 4242'
export const TEST_CARD_DECLINE = '4000 0000 0000 0002'
