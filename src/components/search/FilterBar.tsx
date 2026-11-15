import { Chip } from '@/components/ui/Chip'
import { freshnessOf } from '@/services/lawService'
import type { AgencyType, Freshness, SearchHit } from '@/types'

export interface SearchFilters {
  type: 'all' | AgencyType
  freshness: 'all' | Freshness
  sort: 'relevance' | 'recent' | 'views'
}

export const DEFAULT_FILTERS: SearchFilters = { type: 'all', freshness: 'all', sort: 'relevance' }

export function applyFilters(hits: SearchHit[], f: SearchFilters): SearchHit[] {
  let out = hits.filter((h) => {
    if (f.type !== 'all' && h.item.agencyType !== f.type) return false
    if (f.freshness !== 'all' && freshnessOf(h.item).level !== f.freshness) return false
    return true
  })
  if (f.sort === 'recent') out = [...out].sort((a, b) => b.item.answeredAt.localeCompare(a.item.answeredAt))
  else if (f.sort === 'views') out = [...out].sort((a, b) => b.item.views - a.item.views)
  return out
}

const TYPE_OPTIONS: { key: SearchFilters['type']; label: string }[] = [
  { key: 'all', label: '모든 기관' },
  { key: 'central', label: '중앙' },
  { key: 'local', label: '지자체' },
  { key: 'education', label: '교육청' },
]

const FRESH_OPTIONS: { key: Freshness; label: string }[] = [
  { key: 'fresh', label: '최신 답변' },
  { key: 'check', label: '확인 권장' },
  { key: 'changed', label: '법령 변경' },
]

interface FilterBarProps {
  value: SearchFilters
  onChange: (next: SearchFilters) => void
}

/** 상상대로 서울 목록의 '최신순 ▾ … 제목 ▾ [검색]' 줄처럼, 칩과 정렬 셀렉트를 한 줄에 */
export function FilterBar({ value, onChange }: FilterBarProps) {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface-2 p-2 md:rounded-full md:px-3">
      <div className="-mx-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-1 scrollbar-none">
        {TYPE_OPTIONS.map((o) => (
          <Chip key={o.key} active={value.type === o.key} onClick={() => set({ type: o.key })} tone="white">
            {o.label}
          </Chip>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-line-strong" />
        {FRESH_OPTIONS.map((o) => (
          <Chip key={o.key} active={value.freshness === o.key} onClick={() => set({ freshness: value.freshness === o.key ? 'all' : o.key })} tone="white">
            {o.label}
          </Chip>
        ))}
      </div>
      <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-ink-muted">
        <span className="sr-only">정렬</span>
        <select
          value={value.sort}
          onChange={(e) => set({ sort: e.target.value as SearchFilters['sort'] })}
          className="h-9 rounded-full border border-line bg-surface pl-3.5 pr-3 text-[13.5px] font-bold text-ink focus:outline-none"
        >
          <option value="relevance">비슷한 순</option>
          <option value="recent">최신 답변순</option>
          <option value="views">많이 본 순</option>
        </select>
      </label>
    </div>
  )
}
