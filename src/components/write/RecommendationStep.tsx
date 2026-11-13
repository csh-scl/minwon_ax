import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notice'
import { Lead, PageTitle } from '@/components/layout/Page'
import { cn } from '@/lib/cn'
import { AGENCY_TYPE_LABEL, regionName } from '@/services/recommendationService'
import type { AgencyType, Recommendation, RegionChoice } from '@/types'

interface RecommendationStepProps {
  recommendation: Recommendation
  selectedRank: 1 | 2 | 3
  onSelect: (rank: 1 | 2 | 3) => void
  region: RegionChoice | null
  onChangeRegion: () => void
  onNext: () => void
}

const TYPE_DOT: Record<AgencyType, string> = { central: 'bg-compass', local: 'bg-mint', education: 'bg-peach' }

export function RecommendationStep({ recommendation, selectedRank, onSelect, region, onChangeRegion, onNext }: RecommendationStepProps) {
  const selected = recommendation.items.find((i) => i.rank === selectedRank) ?? recommendation.items[0]
  const pct = Math.round(recommendation.typeShares[recommendation.dominantType] * 100)
  const missingRegion = recommendation.needsRegion && !region

  return (
    <div>
      {missingRegion ? (
        <PageTitle>
          사는 지역을 알려주시면
          <br />
          처리기관을 찾아드릴게요
        </PageTitle>
      ) : (
        <PageTitle>
          {selected.agency}에
          <br />
          보내는 게 좋아요
        </PageTitle>
      )}
      <Lead>
        비슷한 민원의 {pct}%를 {AGENCY_TYPE_LABEL[recommendation.dominantType]}에서 처리했어요. 기관을 선택하면 민원 작성에 필요한 정보를 안내해 드려요.
      </Lead>

      {recommendation.needsRegion && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface-2 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-ink-muted">사는 지역</p>
            <p className="truncate text-[16px] font-extrabold">{region ? regionName(region) : '아직 선택하지 않았어요'}</p>
          </div>
          <Button variant="white" size="sm" onClick={onChangeRegion}>
            {region ? '변경' : '선택'}
          </Button>
        </div>
      )}

      <fieldset className="mt-6">
        <legend className="sr-only">처리기관 선택</legend>
        <ul className="space-y-3">
          {recommendation.items.map((it) => {
            const active = it.rank === selectedRank
            return (
              <li key={it.rank}>
                <label
                  className={cn(
                    'block cursor-pointer rounded-card p-5 transition-all',
                    active ? 'bg-surface shadow-card ring-2 ring-compass' : 'bg-surface-2 hover:bg-surface-3',
                    it.placeholder && 'cursor-default opacity-70',
                  )}
                >
                  <input type="radio" name="agency" className="sr-only" checked={active} disabled={it.placeholder} onChange={() => onSelect(it.rank)} />
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'tnum mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold',
                        active ? 'bg-compass text-white' : 'bg-surface text-ink-muted',
                      )}
                    >
                      {active ? <Icon name="check" size={16} /> : it.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[17px] font-extrabold">{it.agency}</span>
                        <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-ink-muted">
                          <span className={cn('h-2 w-2 rounded-full', TYPE_DOT[it.type])} />
                          {AGENCY_TYPE_LABEL[it.type]}
                        </span>
                      </div>
                      <p className="mt-1 text-[14px] text-ink-muted">{it.reason}</p>
                      {!it.placeholder && (
                        <p className="mt-2 text-[14px]">
                          예상 처리기간 <span className="tnum font-extrabold text-ink">{it.expectedBusinessDays}영업일</span>
                          {it.estimateSource === 'mock' && <span className="ml-1 text-[12px] text-ink-faint">(추정)</span>}
                          {it.dept && <span className="ml-2 text-[12px] text-ink-faint">담당 {it.dept}</span>}
                        </p>
                      )}
                      {it.evidence.length > 0 && (
                        <details className="group mt-2">
                          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[13px] font-bold text-compass">
                            근거 사례 {it.evidence.length}건
                            <Icon name="chevron-down" size={14} className="transition-transform group-open:rotate-180" />
                          </summary>
                          <ul className="mt-2 space-y-1 border-l-2 border-line pl-3">
                            {it.evidence.map((c) => (
                              <li key={c.id} className="text-[13px] text-ink-muted">
                                <Link to={`/cases/${c.id}`} className="hover:text-ink hover:underline">
                                  {c.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <Notice tone="info" className="mt-4" icon="clock">
        예상 처리기간은 참고용이며 실제와 다를 수 있어요. 접수 후 국민신문고에서 안내하는 처리 예정일을 확인해 주세요.
      </Notice>

      <div className="mt-6">
        <Button size="lg" full onClick={onNext} disabled={selected.placeholder}>
          {selected.placeholder ? '지역을 먼저 선택해 주세요' : `${selected.agency}에 보낼 민원 쓰기`}
          {!selected.placeholder && <Icon name="arrow-right" size={18} />}
        </Button>
      </div>
    </div>
  )
}
