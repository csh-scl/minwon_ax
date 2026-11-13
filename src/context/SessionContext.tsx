import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { readJSON, writeJSON } from '@/lib/storage'
import type { RegionChoice } from '@/types'

interface SessionState {
  region: RegionChoice | null
  lastQuery: string
  resolvedCount: number
}

interface SessionValue extends SessionState {
  setRegion: (r: RegionChoice | null) => void
  setLastQuery: (q: string) => void
  markResolved: () => void
}

const KEY = 'minwon-compass.session.v1'
const DEFAULT: SessionState = { region: null, lastQuery: '', resolvedCount: 0 }

const SessionContext = createContext<SessionValue | null>(null)

function same<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => ({ ...DEFAULT, ...readJSON<Partial<SessionState>>(KEY, {}) }))

  // 값이 그대로면 상태 객체를 바꾸지 않아, 효과(useEffect)가 다시 돌지 않습니다.
  const update = useCallback((patch: Partial<SessionState>) => {
    setState((prev) => {
      const changed = (Object.keys(patch) as (keyof SessionState)[]).some((k) => !same(prev[k], patch[k]))
      if (!changed) return prev
      const next = { ...prev, ...patch }
      writeJSON(KEY, next)
      return next
    })
  }, [])

  const setRegion = useCallback((region: RegionChoice | null) => update({ region }), [update])
  const setLastQuery = useCallback((lastQuery: string) => update({ lastQuery }), [update])
  const markResolved = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, resolvedCount: prev.resolvedCount + 1 }
      writeJSON(KEY, next)
      return next
    })
  }, [])

  const value = useMemo<SessionValue>(() => ({ ...state, setRegion, setLastQuery, markResolved }), [state, setRegion, setLastQuery, markResolved])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession 은 SessionProvider 안에서만 쓸 수 있어요')
  return ctx
}
