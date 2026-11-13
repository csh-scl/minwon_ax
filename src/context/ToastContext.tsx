import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ToastItem {
  id: number
  message: string
  tone: 'ink' | 'signal'
}

interface ToastValue {
  toast: (message: string, tone?: ToastItem['tone']) => void
}

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, tone: ToastItem['tone'] = 'ink') => {
    counter.current += 1
    const id = counter.current
    setItems((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-8"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-float',
              t.tone === 'signal' ? 'bg-signal-deep' : 'bg-ink',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 는 ToastProvider 안에서만 쓸 수 있어요')
  return ctx
}
