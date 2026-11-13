export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-display text-lg font-extrabold tracking-tight sm:text-xl ${light ? 'text-white' : 'text-ink'}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill={light ? '#fff' : '#0A0A0A'} />
        <path d="M6 21c4.5 0 7.5-2 10.5-6.5l2.2 3.2c2 1 4.3 1.2 7.3 1.2V23H6z" fill="#FF5A1F" />
      </svg>
      <span>SNEAK<span className="text-accent">HUB</span></span>
    </span>
  )
}
