export type Badge = 'NEW' | 'SALE' | 'BESTSELLER'
export type Category = 'lifestyle' | 'running' | 'basketball' | 'skate' | 'trail'
export type Silhouette = 'low' | 'runner' | 'high'

export interface SizeStock {
  size: number // EU
  stock: number // демо-остаток
}

export interface Palette {
  upper: string
  accent: string
  sole: string
  toe: string
  bg: string
}

export interface Product {
  id: string
  brand: string
  model: string
  colorway: string
  category: Category
  price: number // ₸, демо-цена
  oldPrice?: number
  badges: Badge[]
  sizes: SizeStock[]
  silhouette: Silhouette
  palette: Palette
  description: string
  specs: { label: string; value: string }[]
  popularity: number
  addedAt: string // ISO-дата поступления (демо)
}

export interface CartItem {
  productId: string
  size: number
  qty: number
}

export type DeliveryMethod = 'courier' | 'pickup' | 'post'
export type PaymentMethod = 'test-card' | 'cash'

export interface OrderCustomer {
  name: string
  phone: string
  city: string
  address: string
  comment: string
}

export interface Order {
  id: string
  createdAt: string
  customer: OrderCustomer
  delivery: DeliveryMethod
  payment: PaymentMethod
  items: { productId: string; title: string; size: number; qty: number; price: number }[]
  subtotal: number
  deliveryCost: number
  total: number
  status: 'paid-test' | 'awaiting-cash'
}
