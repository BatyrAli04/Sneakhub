import { useId } from 'react'
import type { Palette, Silhouette } from '../types'

/**
 * Демо-изображение кроссовка (векторная заглушка).
 * Реальные фото брендов не используются: это обобщённый силуэт в цветах модели.
 * Чтобы подключить настоящие фото, достаточно добавить поле images в товар
 * и заменить этот компонент на <img>.
 */

export type ArtView = 'side' | 'mirror' | 'detail' | 'top'

interface Props {
  palette: Palette
  silhouette: Silhouette
  view?: ArtView
  background?: boolean
  className?: string
  title?: string
}

const SHAPES: Record<Silhouette, { upper: string; collar: string; tongue: string; heel: string; mid: string; out: string; stripe: string; toe: string; laces: [number, number, number, number] }> = {
  low: {
    upper: 'M48 182 C40 150 38 118 52 100 C60 90 78 88 98 92 L138 98 C150 100 158 104 166 112 L214 140 C246 156 290 160 330 162 C362 164 380 170 382 182 Z',
    collar: 'M56 101 C80 112 120 114 148 103',
    tongue: 'M140 102 L168 80 C176 74 188 78 190 86 L214 140 L168 118 Z',
    heel: 'M48 182 C40 150 40 120 50 104 C66 124 78 152 84 182 Z',
    mid: 'M38 180 L386 180 C394 188 392 198 386 200 L40 200 C32 196 32 186 38 180 Z',
    out: 'M40 200 L386 200 C386 208 380 213 372 213 L54 213 C44 213 40 208 40 200 Z',
    stripe: 'M98 170 C150 150 214 128 292 136 C242 144 180 162 118 180 Z',
    toe: 'M298 182 L298 160 C336 160 372 164 382 182 Z',
    laces: [170, 110, 232, 150],
  },
  runner: {
    upper: 'M50 172 C42 142 44 112 58 98 C68 90 84 90 100 94 L140 102 C152 104 160 110 168 116 L216 142 C250 154 292 152 332 152 C364 152 384 158 386 172 Z',
    collar: 'M60 100 C84 112 122 114 150 106',
    tongue: 'M142 104 L170 84 C178 78 190 82 192 90 L216 142 L170 122 Z',
    heel: 'M50 172 C42 142 44 116 56 102 C72 124 84 148 90 172 Z',
    mid: 'M40 166 L388 166 C398 178 396 194 386 200 L44 200 C30 194 30 176 40 166 Z',
    out: 'M44 200 L386 200 C386 208 380 213 372 213 L56 213 C46 213 42 208 44 200 Z',
    stripe: 'M104 160 C160 138 220 126 300 132 C250 140 188 152 124 170 Z',
    toe: 'M300 170 L302 152 C340 150 378 154 386 170 Z',
    laces: [172, 114, 236, 152],
  },
  high: {
    upper: 'M50 182 C44 140 44 82 52 46 C72 40 112 40 134 46 L152 94 L214 140 C246 156 290 160 330 162 C362 164 380 170 382 182 Z',
    collar: 'M54 49 C82 58 112 58 132 49',
    tongue: 'M128 50 L148 34 C158 28 168 34 168 44 L214 140 L150 104 Z',
    heel: 'M50 182 C44 140 44 100 50 70 C70 100 82 140 88 182 Z',
    mid: 'M38 180 L386 180 C394 188 392 198 386 200 L40 200 C32 196 32 186 38 180 Z',
    out: 'M40 200 L386 200 C386 208 380 213 372 213 L54 213 C44 213 40 208 40 200 Z',
    stripe: 'M96 168 C150 148 214 126 292 136 C242 144 180 162 116 180 Z',
    toe: 'M298 182 L298 160 C336 160 372 164 382 182 Z',
    laces: [146, 66, 230, 150],
  },
}

function isLight(hex: string) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

export default function SneakerArt({ palette, silhouette, view = 'side', background = true, className, title }: Props) {
  const uid = useId().replace(/:/g, '')
  const s = SHAPES[silhouette]
  const stroke = isLight(palette.upper) ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.22)'
  const lace = isLight(palette.upper) ? '#FFFFFF' : palette.upper === '#151515' ? '#FFFFFF' : '#F2F2F2'
  const laceStroke = isLight(palette.upper) ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.35)'

  const [lx1, ly1, lx2, ly2] = s.laces
  const laceCount = silhouette === 'high' ? 7 : 5
  const laces = Array.from({ length: laceCount }, (_, i) => {
    const t = (i + 0.5) / laceCount
    const x = lx1 + (lx2 - lx1) * t
    const y = ly1 + (ly2 - ly1) * t
    return { x, y }
  })

  const viewBox = view === 'detail' ? '200 90 200 130' : view === 'top' ? '-10 -20 420 280' : '22 22 380 212'
  const shoeTransform = view === 'mirror' ? 'translate(420 0) scale(-1 1)' : view === 'top' ? 'rotate(-10 210 140)' : undefined

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title ?? 'Демо-изображение кроссовка'} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`g-up-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset="1" stopColor="#000" stopOpacity=".08" />
        </linearGradient>
        <radialGradient id={`g-bg-${uid}`} cx=".5" cy=".45" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {background && (
        <>
          <rect x="-50" y="-50" width="520" height="340" fill={palette.bg} />
          <rect x="-50" y="-50" width="520" height="340" fill={`url(#g-bg-${uid})`} />
          {view === 'top' && <circle cx="300" cy="70" r="90" fill={palette.accent} opacity=".12" />}
        </>
      )}

      <ellipse cx="214" cy="224" rx="172" ry="7" fill="#000" opacity=".13" />

      <g transform={shoeTransform}>
        <path d={s.tongue} fill={palette.upper} stroke={stroke} strokeWidth="1.2" />
        <path d={s.tongue} fill="#000" opacity=".06" />
        <path d={s.upper} fill={palette.upper} stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
        <path d={s.upper} fill={`url(#g-up-${uid})`} />
        <path d={s.toe} fill={palette.toe} stroke={stroke} strokeWidth="1.2" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={318 + i * 14} cy={171 - (i % 2) * 2} r="1.6" fill={stroke} />
        ))}
        <path d={s.heel} fill={palette.accent} opacity=".92" stroke={stroke} strokeWidth="1.2" />
        <path d={s.stripe} fill={palette.accent} stroke={stroke} strokeWidth="1" />
        <path d={s.upper} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" transform="translate(0 6) scale(.985)" opacity=".7" />
        <path d={s.collar} fill="none" stroke="#1a1a1a" strokeOpacity=".75" strokeWidth="7" strokeLinecap="round" />
        {silhouette === 'high' && <circle cx="96" cy="118" r="13" fill={palette.accent} stroke={stroke} />}

        {laces.map((p, i) => (
          <g key={i}>
            <line x1={p.x - 10} y1={p.y + 3} x2={p.x + 8} y2={p.y - 11} stroke={laceStroke} strokeWidth="6.5" strokeLinecap="round" />
            <line x1={p.x - 10} y1={p.y + 3} x2={p.x + 8} y2={p.y - 11} stroke={lace} strokeWidth="5" strokeLinecap="round" />
          </g>
        ))}

        <path d={s.mid} fill={palette.sole} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
        {silhouette === 'runner' && (
          <>
            <rect x="72" y="176" width="64" height="16" rx="8" fill="#fff" opacity=".55" stroke={palette.accent} strokeWidth="2" />
            <path d="M150 190 C200 180 260 180 330 186" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="2" />
          </>
        )}
        <path d={s.out} fill={palette.sole} />
        <path d={s.out} fill="#000" opacity=".16" />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={66 + i * 20} y1={204} x2={74 + i * 20} y2={211} stroke="#000" strokeOpacity=".12" strokeWidth="2" />
        ))}
      </g>
    </svg>
  )
}
