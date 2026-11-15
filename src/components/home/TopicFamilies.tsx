import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CaseTile } from '@/components/cases/CaseTile'
import { Icon } from '@/components/ui/Icon'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { FAMILIES, TONE_TILE, type TopicFamily } from '@/config/families'
import { useAsync } from '@/hooks/useAsync'
import { cn } from '@/lib/cn'
import { api } from '@/services/api'
import type { AgencyType, CaseItem } from '@/types'

const byRank = (a: CaseItem, b: CaseItem) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0)

/** '전체' 탭에서 기관 유형이 대표 사례 비율(지자체 90 · 중앙 65 · 교육청 25)에 가깝게 섞이도록 돌아가는 순서 */
const ALL_TYPE_CYCLE: AgencyType[] = ['local', 'central', 'local', 'education', 'central', 'local', 'central', 'local']

/** 분야별 대표 사례. '전체'는 분야마다 하나씩 돌아가며, 기관 유형도 번갈아 고릅니다. */
async function loadFamily(f: TopicFamily, limit: number) {
  const cases = await api.getCases()
  const featured = cases.filter((c) => c.featured)
  if (f.slugs.length) return featured.filter((c) => c.featured === f.key).sort(byRank).slice(0, limit)
  const lanes = FAMILIES.filter((x) => x.slugs.length).map((x) => featured.filter((c) => c.featured === x.key).sort(byRank))
  const used = new Set<string>()
  const mixed: CaseItem[] = []
  for (let i = 0; mixed.length < limit && i < lanes.length * 20; i++) {
    const lane = lanes[i % lanes.length].filter((c) => !used.has(c.id))
    const want = ALL_TYPE_CYCLE[mixed.length % ALL_TYPE_CYCLE.length]
    const pick = lane.find((c) => c.agencyType === want) ?? lane[0]
    if (!pick) continue
    used.add(pick.id)
    mixed.push(pick)
  }
  return mixed
}

/** 분야 아이콘 줄 + 고른 분야의 대표 사례 카드. 상상대로 서울의 '분야별 제안' 구성을 따릅니다. */
export function TopicFamilies() {
  const [key, setKey] = useState('all')
  const fam = FAMILIES.find((f) => f.key === key) ?? FAMILIES[0]
  const list = useAsync(() => loadFamily(fam, 8), [fam.key])
  const rowRef = useRef<HTMLDivElement>(null)

  const scrollRow = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  const searchTo = fam.key === 'all' ? '/search?topic=housing-rent' : `/search?family=${fam.key}`

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          aria-label="이전 분야"
          onClick={() => scrollRow(-1)}
          className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink-muted shadow-card hover:text-ink md:flex"
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <div ref={rowRef} role="tablist" aria-label="분야" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none md:mx-0 md:px-6">
          {FAMILIES.map((f) => {
            const active = f.key === key
            return (
              <button
                key={f.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setKey(f.key)}
                className={cn(
                  'flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-2xl px-1 py-3 transition-colors md:w-[104px]',
                  active ? 'bg-surface shadow-card' : 'hover:bg-surface-2',
                )}
              >
                <span
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl transition-transform',
                    TONE_TILE[f.tone],
                    active && 'scale-105 ring-2 ring-ink/10',
                  )}
                >
                  <Icon name={f.icon} size={26} strokeWidth={2} />
                </span>
                <span className={cn('text-[13.5px] font-bold', active ? 'text-ink' : 'text-ink-muted')}>{f.label}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          aria-label="다음 분야"
          onClick={() => scrollRow(1)}
          className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink-muted shadow-card hover:text-ink md:flex"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

      <div className="mt-5 -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 snap-row scrollbar-none md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
        {list.loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="w-[78vw] shrink-0 md:w-auto">
                <CardSkeleton />
              </div>
            ))
          : (list.data ?? []).map((c) => (
              <div key={c.id} className="w-[78vw] shrink-0 md:w-auto">
                <CaseTile item={c} />
              </div>
            ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Link to={searchTo} className="inline-flex h-11 items-center gap-1 rounded-full border border-line-strong bg-surface px-5 text-[14px] font-bold text-ink hover:bg-surface-2">
          {fam.key === 'all' ? '주제별로 보기' : `${fam.label} 사례 전체 보기`}
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
    </div>
  )
}
