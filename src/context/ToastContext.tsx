import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Toast {
  id: number
  text: string
  kind: 'success' | 'error'
  action?: { label: string; to: string }
}

const Ctx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId.current++
    setToasts((prev) => [...prev.slice(-2), { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3600)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl bg-ink px-4 py-3.5 text-sm text-white shadow-2xl shadow-black/20">
            {t.kind === 'success' ? <CheckCircle2 className="size-5 shrink-0 text-accent" /> : <AlertCircle className="size-5 shrink-0 text-red-400" />}
            <span className="flex-1 font-medium">{t.text}</span>
            {t.action && (
              <Link to={t.action.to} className="shrink-0 font-bold text-accent hover:underline">
                {t.action.label}
              </Link>
            )}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} aria-label="Закрыть" className="shrink-0 opacity-60 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
