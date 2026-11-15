import { CompassDial } from '@/components/brand/CompassDial'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { SearchSummary } from '@/services/insightService'
import { AGENCY_TYPE_LABEL } from '@/services/recommendationService'
import type { AgencyType, Recommendation } from '@/types'

interface SummaryCardProps {
  summary: SearchSummary
  recommendation: Recommendation | null
  groupLabel: string
  groupJoined: boolean
  onWrite: () => void
  onResolved: () => void
  onJoin: () => void
}

const TYPE_TEXT: Record<AgencyType, string> = { central: 'text-compass-deep', local: 'text-mint-deep', education: 'text-peach-deep' }
const TYPE_BG: Record<AgencyType, string> = { central: 'bg-compass-tint', local: 'bg-mint-tint', education: 'bg-peach-tint' }

/**
 * 결과 맨 위 '종합 안내'. 목록을 읽기 전에 답부터 보여줍니다.
 * 모든 문장은 아래 사례 집계에서 나온 것이고, 지어내지 않습니다.
 */
export function SummaryCard({ summary, recommendation, groupLabel, groupJoined, onWrite, onResolved, onJoin }: SummaryCardProps) {
  const type = recommendation?.dominantType ?? summary.dominantType
  const shares = recommendation?.typeShares ?? summary.typeShares
  const pct = Math.round((shares[type] ?? 0) * 100)
  const first = recommendation?.items[0]
  const top = first && !first.placeholder ? first : undefined
  const freshPct = Math.round(summary.freshShare * 100)

  const facts: { text: React.ReactNode }[] = [
    {
      text: (
        <>
          비슷한 민원의 <b className={cn('tnum', TYPE_TEXT[type])}>{pct}%</b>를 <b>{AGENCY_TYPE_LABEL[type]}</b>에서 처리했어요
          {summary.topAgencies.length > 0 && <span className="text-ink-muted">. 주요 처리기관: {summary.topAgencies.slice(0, 2).map((a) => a.name).join(', ')}</span>}
        </>
      ),
    },
    {
      text: top ? (
        <>
          {top.agency}의 예상 처리기간은 <b className="tnum">{top.expectedBusinessDays}영업일</b>이에요
          {summary.medianDays != null && <span className="text-ink-muted">. 공개 사례의 처리기간 중앙값은 {summary.medianDays}일</span>}
        </>
      ) : summary.medianDays != null ? (
        <>
          공개 사례의 처리기간 중앙값은 <b className="tnum">{summary.medianDays}일</b>이에요
        </>
      ) : (
        <>아직 예상 처리기간을 안내하기 어려워요. 작성 단계에서 처리기관을 확인해 주세요</>
      ),
    },
    {
      text: (
        <>
          답변의 <b className="tnum">{freshPct}%</b>가 최근 6개월 이내 최신 답변이에요
          {summary.lawChanged > 0 ? (
            <span className="text-signal-deep">. {summary.lawChanged}건은 답변 뒤에 인용한 조문이 바뀌었어요</span>
          ) : (
            <span className="text-ink-muted">. 답변 뒤에 인용한 조문이 바뀐 사례는 없어요</span>
          )}
        </>
      ),
    },
  ]
  if (summary.topLaws.length > 0)
    facts.push({
      text: (
        <>
          답변에 자주 인용된 법령: <b>{summary.topLaws.map((l) => l.name).join(', ')}</b>
        </>
      ),
    })
  if (summary.extraDocs.count > 0)
    facts.push({
      text: (
        <>
          <b className="tnum">{summary.extraDocs.count}건</b>에서 담당자가 추가 자료나 구체적인 상황 설명를 요청했어요. 날짜·장소·사진을 함께 적으면 좋아요
        </>
      ),
    })

  return (
    <section aria-label="종합 안내" className="overflow-hidden rounded-[20px] bg-surface shadow-card ring-1 ring-ink/5">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-6 md:p-8">
          <p className="inline-flex items-center rounded-full bg-sun-tint px-3 py-1 text-[12.5px] font-extrabold text-amber">
            검색된 사례 {summary.total}건을 정리했어요
          </p>
          <ul className="mt-4 divide-y divide-line/70">
            {facts.map((f, i) => (
              <li key={i} className="py-3 text-[15.5px] leading-relaxed">
                {f.text}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="sun" size="lg" onClick={onWrite}>
                이 내용으로 민원 쓰기
                <Icon name="arrow-right" size={18} />
              </Button>
              <Button variant="secondary" size="lg" onClick={onResolved}>
                답을 찾았어요
              </Button>
            </div>
            <button
              type="button"
              onClick={onJoin}
              aria-pressed={groupJoined}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-compass-tint px-4 text-[14px] font-bold text-compass hover:bg-[#d8e5fd] lg:h-[54px] lg:bg-transparent lg:hover:bg-compass-tint"
            >
              <Icon name={groupJoined ? 'check' : 'users'} size={16} />
              {groupLabel}
            </button>
          </div>
        </div>
        <div className={cn('flex flex-col items-center justify-center gap-2 p-6 text-center', TYPE_BG[type])}>
          <CompassDial shares={shares} dominant={type} size={160} />
          <p className={cn('text-[16px] font-extrabold', TYPE_TEXT[type])}>{AGENCY_TYPE_LABEL[type]} 방향</p>
          <p className="text-[13px] text-ink-muted">
            {top && !top.placeholder ? `${top.agency}` : recommendation?.needsRegion ? '지역을 선택하면 처리기관을 추천해 드려요' : '작성 단계에서 추천 기관을 확인하세요'}
          </p>
        </div>
      </div>
    </section>
  )
}
