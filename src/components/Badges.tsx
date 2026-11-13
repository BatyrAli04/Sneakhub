import type { Badge } from '../types'

const STYLE: Record<Badge, string> = {
  NEW: 'bg-ink text-white',
  SALE: 'bg-accent text-white',
  BESTSELLER: 'bg-white text-ink ring-1 ring-black/10',
}

export default function Badges({ badges, className = '' }: { badges: Badge[]; className?: string }) {
  if (!badges.length) return null
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((b) => (
        <span key={b} className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest ${STYLE[b]}`}>
          {b}
        </span>
      ))}
    </div>
  )
}
