import type { Badge, Category, Palette, Product, Silhouette, SizeStock } from '../types'

/**
 * ДЕМО-КАТАЛОГ.
 * Цены, остатки, даты поступления и описания — вымышленные и служат только
 * для демонстрации интерфейса. Это не реальные цены и не реальное наличие.
 */

export const ALL_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]

export const CATEGORY_LABELS: Record<Category, string> = {
  lifestyle: 'Лайфстайл',
  running: 'Бег',
  basketball: 'Баскетбол',
  skate: 'Скейт',
  trail: 'Трейл',
}

export const BRANDS = ['Nike', 'Adidas', 'New Balance', 'ASICS', 'Puma', 'Converse', 'Vans', 'Salomon', 'Reebok']

// Детерминированный генератор, чтобы демо-остатки не «прыгали» между перезагрузками.
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function makeSizes(id: string, from = 36, to = 46): SizeStock[] {
  const rnd = seeded(id)
  return ALL_SIZES.filter((s) => s >= from && s <= to).map((size) => {
    const r = rnd()
    const stock = r < 0.14 ? 0 : r < 0.32 ? 1 + Math.floor(rnd() * 3) : 4 + Math.floor(rnd() * 9)
    return { size, stock }
  })
}

const MATERIAL: Record<Category, string> = {
  lifestyle: 'Натуральная кожа и замша',
  running: 'Дышащий сетчатый текстиль',
  basketball: 'Кожа и синтетика',
  skate: 'Замша и канвас',
  trail: 'Текстиль с защитными накладками',
}
const SOLE: Record<Category, string> = {
  lifestyle: 'Резина, вулканизированная/литая',
  running: 'Амортизирующая пена + резиновые вставки',
  basketball: 'Нескользящая резина, поддержка голеностопа',
  skate: 'Плоская резиновая подошва с вафельным протектором',
  trail: 'Агрессивный протектор для грунта',
}
const PURPOSE: Record<Category, string> = {
  lifestyle: 'Для города и повседневных образов',
  running: 'Для бега и активного дня',
  basketball: 'Для площадки и streetwear-образов',
  skate: 'Для скейта и повседневной носки',
  trail: 'Для троп, путешествий и gorpcore-стиля',
}

interface Seed {
  brand: string
  model: string
  colorway: string
  category: Category
  price: number
  oldPrice?: number
  badges?: Badge[]
  silhouette: Silhouette
  palette: Palette
  blurb: string
  popularity: number
  daysAgo: number
  sizeRange?: [number, number]
}

const P = (upper: string, accent: string, sole: string, toe: string, bg: string): Palette => ({ upper, accent, sole, toe, bg })

const seeds: Seed[] = [
  { brand: 'Nike', model: 'Air Max 90', colorway: 'White / Infrared', category: 'lifestyle', price: 69990, badges: ['BESTSELLER'], silhouette: 'runner', palette: P('#F5F5F2', '#FF4D3D', '#FFFFFF', '#D9D9D6', '#EDEBE6'), blurb: 'Классический силуэт с видимой воздушной вставкой в пятке и многослойным верхом. Узнаваемая модель, которая одинаково хорошо смотрится с джинсами и спортивным костюмом.', popularity: 98, daysAgo: 120 },
  { brand: 'Nike', model: "Air Force 1 '07", colorway: 'Triple White', category: 'lifestyle', price: 54990, badges: ['BESTSELLER'], silhouette: 'low', palette: P('#FFFFFF', '#EDEDED', '#FFFFFF', '#F4F4F4', '#E9ECEF'), blurb: 'Баскетбольная классика, ставшая иконой улиц. Чистый белый кожаный верх и массивная подошва — базовая пара для любого гардероба.', popularity: 100, daysAgo: 200 },
  { brand: 'Nike', model: 'Pegasus 41', colorway: 'Black / Volt', category: 'running', price: 64990, badges: ['NEW'], silhouette: 'runner', palette: P('#1C1C1C', '#D7FF3A', '#F2F2F2', '#2B2B2B', '#E8F0D8'), blurb: 'Универсальная беговая модель для ежедневных тренировок. Мягкая амортизация и лёгкий сетчатый верх, который хорошо вентилируется.', popularity: 84, daysAgo: 6 },
  { brand: 'Nike', model: 'Dunk Low Retro', colorway: 'Black / White', category: 'lifestyle', price: 59990, oldPrice: 69990, badges: ['SALE'], silhouette: 'low', palette: P('#FFFFFF', '#141414', '#FFFFFF', '#141414', '#ECECEC'), blurb: 'Контрастная двухцветная расцветка и ретро-форма из 80-х. Одна из самых востребованных моделей среди любителей streetwear.', popularity: 95, daysAgo: 90 },
  { brand: 'Nike', model: 'Air Jordan 1 Mid', colorway: 'Chicago Red', category: 'basketball', price: 74990, badges: ['BESTSELLER'], silhouette: 'high', palette: P('#FFFFFF', '#C8102E', '#FFFFFF', '#C8102E', '#F4E3E3'), blurb: 'Высокий баскетбольный силуэт с поддержкой голеностопа. Кожаный верх с контрастными накладками — заметная пара для смелых образов.', popularity: 97, daysAgo: 60 },
  { brand: 'Adidas', model: 'Samba OG', colorway: 'Cloud White / Core Black', category: 'lifestyle', price: 52990, badges: ['BESTSELLER'], silhouette: 'low', palette: P('#FAFAF7', '#111111', '#B88A57', '#D8D2C4', '#EFE9DF'), blurb: 'Низкий профиль, замшевый мысок и каучуковая подошва цвета гам. Футбольная классика, которая стала главным трендом последних сезонов.', popularity: 99, daysAgo: 45 },
  { brand: 'Adidas', model: 'Gazelle', colorway: 'Collegiate Green', category: 'lifestyle', price: 49990, silhouette: 'low', palette: P('#2F6B4F', '#FFFFFF', '#F5F2E8', '#2A5E46', '#E2ECE5'), blurb: 'Мягкая замша, тонкая подошва и винтажные пропорции. Подходит для смарт-кэжуал и повседневных образов.', popularity: 80, daysAgo: 150 },
  { brand: 'Adidas', model: 'Ultraboost 5', colorway: 'Core Black', category: 'running', price: 89990, badges: ['NEW'], silhouette: 'runner', palette: P('#202020', '#FFFFFF', '#F7F7F7', '#2C2C2C', '#E6E6E6'), blurb: 'Беговая модель с объёмной упругой амортизацией и эластичным вязаным верхом, который садится по ноге как носок.', popularity: 82, daysAgo: 4 },
  { brand: 'Adidas', model: 'Forum Low', colorway: 'White / Royal Blue', category: 'lifestyle', price: 47990, oldPrice: 54990, badges: ['SALE'], silhouette: 'low', palette: P('#FFFFFF', '#1F4FD8', '#FFFFFF', '#EFEFEF', '#E3E9F7'), blurb: 'Баскетбольное наследие 80-х в низком варианте: ремешок на щиколотке, кожаный верх и массивная подошва.', popularity: 70, daysAgo: 110 },
  { brand: 'Adidas', model: 'Campus 00s', colorway: 'Grey / Gum', category: 'skate', price: 51990, badges: ['NEW'], silhouette: 'low', palette: P('#8E8E8E', '#FFFFFF', '#B88A57', '#7A7A7A', '#ECEAE6'), blurb: 'Объёмная замша, широкие шнурки и толстый язычок в духе скейт-культуры нулевых.', popularity: 88, daysAgo: 9 },
  { brand: 'New Balance', model: '550', colorway: 'White / Green', category: 'lifestyle', price: 62990, badges: ['BESTSELLER'], silhouette: 'low', palette: P('#FBFBF8', '#1E7A4C', '#FBFBF8', '#E9E9E4', '#E4EEE7'), blurb: 'Баскетбольная модель конца 80-х, вернувшаяся в моду. Кожаный верх, перфорированный мысок и аккуратный ретро-силуэт.', popularity: 94, daysAgo: 70 },
  { brand: 'New Balance', model: '9060', colorway: 'Rain Cloud', category: 'lifestyle', price: 84990, badges: ['NEW'], silhouette: 'runner', palette: P('#B9BDC2', '#6D737A', '#E7E5E0', '#A7ABB1', '#E7E9EC'), blurb: 'Футуристичная массивная подошва и многослойный верх из замши и сетки. Заметная пара для современных образов.', popularity: 90, daysAgo: 3 },
  { brand: 'New Balance', model: '574', colorway: 'Navy / Grey', category: 'lifestyle', price: 44990, oldPrice: 52990, badges: ['SALE'], silhouette: 'runner', palette: P('#1F2D4A', '#9AA3AE', '#F1F1EE', '#2A3A5C', '#E2E6EE'), blurb: 'Надёжная классика бренда: замша и текстиль, мягкая подошва и удобная колодка на каждый день.', popularity: 76, daysAgo: 180 },
  { brand: 'New Balance', model: 'Fresh Foam X 1080v14', colorway: 'Sky Blue', category: 'running', price: 79990, silhouette: 'runner', palette: P('#7FB7E8', '#1C3F73', '#FFFFFF', '#6AA4D8', '#E1EEF9'), blurb: 'Максимально мягкая беговая модель для длинных дистанций и восстановительных пробежек.', popularity: 66, daysAgo: 35 },
  { brand: 'ASICS', model: 'GEL-Kayano 31', colorway: 'Black / Electric Lime', category: 'running', price: 74990, silhouette: 'runner', palette: P('#222222', '#C6F432', '#ECECEC', '#333333', '#EAF2DA'), blurb: 'Стабилизирующая беговая модель с гелевой амортизацией — для тех, кто бегает часто и много.', popularity: 72, daysAgo: 28 },
  { brand: 'ASICS', model: 'GEL-1130', colorway: 'White / Pure Silver', category: 'lifestyle', price: 54990, badges: ['NEW'], silhouette: 'runner', palette: P('#F4F4F4', '#B9BEC4', '#EDEDED', '#D5D8DC', '#ECEEF0'), blurb: 'Беговой силуэт из 2000-х в лайфстайл-исполнении. Серебристые акценты и сетчатый верх.', popularity: 86, daysAgo: 12 },
  { brand: 'ASICS', model: 'GEL-NYC', colorway: 'Cream / Oatmeal', category: 'lifestyle', price: 64990, badges: ['BESTSELLER'], silhouette: 'runner', palette: P('#EEE6D6', '#A88C6A', '#F6F1E7', '#D9CCB4', '#F2ECE2'), blurb: 'Гибрид архивных беговых моделей бренда. Тёплые бежевые оттенки и многослойный верх.', popularity: 92, daysAgo: 50 },
  { brand: 'Puma', model: 'Suede Classic XXI', colorway: 'Black / White', category: 'lifestyle', price: 34990, oldPrice: 39990, badges: ['SALE'], silhouette: 'low', palette: P('#1A1A1A', '#FFFFFF', '#F5F5F5', '#1A1A1A', '#E5E5E5'), blurb: 'Замшевая легенда с 1968 года. Мягкий верх, контрастная полоса и простая форма на каждый день.', popularity: 68, daysAgo: 220 },
  { brand: 'Puma', model: 'Palermo', colorway: 'Vapor Grey / Gum', category: 'lifestyle', price: 42990, badges: ['NEW'], silhouette: 'low', palette: P('#C9CCD0', '#2D5BA8', '#B88A57', '#BEC1C6', '#E8EAEE'), blurb: 'Терраса-классика с Т-образным мыском и каучуковой подошвой. Лёгкий винтажный характер.', popularity: 78, daysAgo: 8 },
  { brand: 'Puma', model: 'MB.04', colorway: 'Toxic Orange', category: 'basketball', price: 69990, silhouette: 'high', palette: P('#FF7A1A', '#151515', '#F3F3F3', '#FF6A00', '#FFE7D6'), blurb: 'Яркая игровая баскетбольная модель с поддержкой стопы и выразительным дизайном.', popularity: 60, daysAgo: 40 },
  { brand: 'Converse', model: 'Chuck 70 Hi', colorway: 'Parchment', category: 'lifestyle', price: 37990, silhouette: 'high', palette: P('#EFE8D8', '#1A1A1A', '#F7F3EA', '#F7F3EA', '#F3EEE3'), blurb: 'Плотный канвас, высокая подошва и винтажные детали. Вечная классика для любого сезона.', popularity: 74, daysAgo: 160 },
  { brand: 'Vans', model: 'Old Skool', colorway: 'Black / White', category: 'skate', price: 32990, silhouette: 'low', palette: P('#151515', '#FFFFFF', '#FFFFFF', '#151515', '#E6E6E6'), blurb: 'Скейт-классика с боковой полосой, замшевыми вставками и вафельной подошвой.', popularity: 81, daysAgo: 130 },
  { brand: 'Salomon', model: 'XT-6', colorway: 'Black / Phantom', category: 'trail', price: 99990, badges: ['NEW'], silhouette: 'runner', palette: P('#2A2A2E', '#8A8F98', '#3A3A3F', '#2A2A2E', '#E2E3E6'), blurb: 'Трейловая модель для пересечённой местности, ставшая хитом городского gorpcore-стиля. Быстрая шнуровка и цепкий протектор.', popularity: 85, daysAgo: 2, sizeRange: [38, 46] },
  { brand: 'Reebok', model: 'Club C 85', colorway: 'Chalk / Green', category: 'lifestyle', price: 36990, oldPrice: 42990, badges: ['SALE'], silhouette: 'low', palette: P('#F6F3EA', '#2E7D4F', '#F6F3EA', '#ECE7DA', '#ECEFE8'), blurb: 'Теннисная классика с минималистичным кожаным верхом. Аккуратная пара для чистых образов.', popularity: 64, daysAgo: 100 },
]

const today = new Date()

export const PRODUCTS: Product[] = seeds.map((s) => {
  const id = `${s.brand}-${s.model}`.toLowerCase().replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const added = new Date(today.getTime() - s.daysAgo * 86400000)
  return {
    id,
    brand: s.brand,
    model: s.model,
    colorway: s.colorway,
    category: s.category,
    price: s.price,
    oldPrice: s.oldPrice,
    badges: s.badges ?? [],
    sizes: makeSizes(id, s.sizeRange?.[0], s.sizeRange?.[1]),
    silhouette: s.silhouette,
    palette: s.palette,
    description: s.blurb,
    specs: [
      { label: 'Категория', value: CATEGORY_LABELS[s.category] },
      { label: 'Расцветка', value: s.colorway },
      { label: 'Верх', value: MATERIAL[s.category] },
      { label: 'Подошва', value: SOLE[s.category] },
      { label: 'Назначение', value: PURPOSE[s.category] },
      { label: 'Размерная сетка', value: 'EU' },
    ],
    popularity: s.popularity,
    addedAt: added.toISOString(),
  }
})

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id)
export const totalStock = (p: Product) => p.sizes.reduce((a, s) => a + s.stock, 0)
export const stockFor = (p: Product, size: number) => p.sizes.find((s) => s.size === size)?.stock ?? 0
export const productTitle = (p: Product) => `${p.brand} ${p.model}`
