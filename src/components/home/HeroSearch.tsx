import { useEffect, useState, type KeyboardEvent } from 'react'
import { CompassDial } from '@/components/brand/CompassDial'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Textarea } from '@/components/ui/Field'
import { HERO_PLACEHOLDER, POPULAR_QUESTIONS } from '@/data/popular'
import { useSession } from '@/context/SessionContext'
import { useAgencies } from '@/hooks/useData'
import { cn } from '@/lib/cn'
import { AGENCY_TYPE_LABEL, recommendAgencies } from '@/services/recommendationService'
import { searchCases } from '@/services/searchService'
import type { AgencyType, Recommendation } from '@/types'

interface HeroSearchProps {
  value: string
  onChange: (v: string) => void
  onSubmit: (text?: string) => void
}

interface Live {
  rec: Recommendation
  total: number
  noMatch: boolean
}

const TYPE_TEXT: Record<AgencyType, string> = {
  central: 'text-compass-deep',
  local: 'text-mint-deep',
  education: 'text-peach-deep',
}

/**
 * 첫 화면 히어로. 고민을 적는 동안 오른쪽 나침반 바늘이 처리기관 방향으로 돌고,
 * 그 아래에 예상 기관과 보통 걸리는 기간이 바로 나타납니다.
 */
export function HeroSearch({ value, onChange, onSubmit }: HeroSearchProps) {
  const { region } = useSession()
  const { data: agencies } = useAgencies()
  const [live, setLive] = useState<Live | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2 || !agencies) {
      setLive(null)
      setPending(false)
      return
    }
    setPending(true)
    let alive = true
    const id = window.setTimeout(() => {
      searchCases(q, { limit: 20 })
        .then((r) => {
          if (!alive) return
          setLive({ rec: recommendAgencies(r.hits, region, agencies, q), total: r.hits.length, noMatch: r.noMatch })
        })
        .finally(() => alive && setPending(false))
    }, 280)
    return () => {
      alive = false
      window.clearTimeout(id)
    }
  }, [value, agencies, region])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onSubmit()
    }
  }

  const top = live?.rec.items[0]
  const pct = live ? Math.round(live.rec.typeShares[live.rec.dominantType] * 100) : 0

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
      <div className="min-w-0">
        <p className="inline-flex items-center rounded-full bg-surface px-3 py-1.5 text-[13px] font-bold text-compass shadow-card">
          국민신문고 답변 2만 건으로 길을 찾아요
        </p>
        <h1 className="mt-5 text-[34px] font-extrabold leading-[1.18] tracking-[-0.025em] md:text-[48px]">
          민원 넣기 전에,
          <br />
          <span className="text-compass">먼저 물어보세요</span>
        </h1>
        <p className="mt-4 max-w-[34rem] text-[16px] leading-relaxed text-ink-muted md:text-[17px]">
          비슷한 민원의 답변을 찾고, 처리기관과 예상 처리기간을 안내해 드려요.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!value.trim()) {
              document.getElementById('hero-query')?.focus()
              return
            }
            onSubmit()
          }}
          className="mt-7"
        >
          <label htmlFor="hero-query" className="sr-only">
            민원 내용
          </label>
          <div className="rounded-[20px] bg-surface p-2.5 shadow-float ring-1 ring-ink/5">
            <Textarea
              id="hero-query"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={HERO_PLACEHOLDER}
              minRows={2}
              className="min-h-[88px] rounded-[20px] border-transparent bg-transparent px-4 py-3 text-[17px] leading-relaxed focus:bg-transparent focus:ring-0 md:text-[19px]"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <p className="hidden text-[13px] text-ink-faint md:block">Enter로 찾기, Shift+Enter로 줄바꿈</p>
              <Button type="submit" size="lg" className="w-full md:w-auto md:min-w-[190px]">
                <Icon name="search" size={18} />
                비슷한 민원 찾기
              </Button>
            </div>
          </div>
        </form>

        <ul className="mt-4 flex flex-wrap gap-2">
          {POPULAR_QUESTIONS.slice(0, 4).map((p) => (
            <li key={p.text}>
              <button
                type="button"
                onClick={() => onSubmit(p.text)}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-surface/80 px-3.5 text-[13.5px] font-semibold text-ink-muted ring-1 ring-ink/5 transition-colors hover:bg-surface hover:text-ink"
              >
                <Icon name="search" size={13} className="text-ink-faint" />
                {p.text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center rounded-[20px] bg-surface/80 p-6 text-center ring-1 ring-ink/5 backdrop-blur">
        <CompassDial
          idle={!live}
          shares={live?.rec.typeShares ?? { central: 0, local: 0, education: 0 }}
          dominant={live?.rec.dominantType ?? 'central'}
          size={196}
          showPct={false}
        />
        <div className="mt-2 min-h-[72px]" aria-live="polite">
          {live ? (
            <>
              <p className={cn('text-[17px] font-extrabold', TYPE_TEXT[live.rec.dominantType])}>
                {AGENCY_TYPE_LABEL[live.rec.dominantType]} 방향 {pct}%
              </p>
              <p className="mt-1 text-[14px] text-ink-muted">
                {top && !top.placeholder ? (
                  <>
                    {top.agency} · 예상 처리기간 <span className="tnum font-bold text-ink">{top.expectedBusinessDays}영업일</span>
                  </>
                ) : live.rec.needsRegion ? (
                  '사는 지역을 선택하면 처리기관을 추천해 드려요'
                ) : (
                  '기관을 찾는 중이에요'
                )}
              </p>
              <p className="mt-1 text-[12.5px] text-ink-faint">{live.noMatch ? '비슷한 사례는 아직 없어요' : `비슷한 사례 ${live.total}건`}</p>
            </>
          ) : (
            <>
              <p className="text-[16px] font-bold text-ink-muted">{pending ? '방향을 찾는 중…' : '고민을 적으면 바늘이 방향을 찾아요'}</p>
              <p className="mt-1 text-[13px] text-ink-faint">중앙부처 · 지자체 · 교육청 중 처리기관을 추천해요</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
