import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatAnswerSpan, formatDate, formatNumber } from '@/lib/format'
import { AGENCY_TYPE_SHORT } from '@/services/recommendationService'
import type { AgencyType, CaseItem } from '@/types'
import { FreshnessBadge } from './FreshnessBadge'
import { LawChangeNotice } from './LawChangeNotice'
import { LawChips } from './LawChips'

interface CaseCardProps {
  item: CaseItem
  showKind?: boolean
  compact?: boolean
  className?: string
}

const TYPE_BADGE: Record<AgencyType, 'compass' | 'mint' | 'peach'> = { central: 'compass', local: 'mint', education: 'peach' }

/** 검색 결과·상세의 사례 카드. 요약 두 줄과 법령 칩까지 보여주는 넓은 버전 */
export function CaseCard({ item, showKind = false, compact = false, className }: CaseCardProps) {
  return (
    <article className={cn('flex h-full flex-col rounded-card bg-surface p-5 shadow-card transition-shadow hover:shadow-float md:p-6', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={TYPE_BADGE[item.agencyType]}>{AGENCY_TYPE_SHORT[item.agencyType]}</Badge>
        {showKind && <Badge tone={item.kind === 'policy' ? 'sun' : 'neutral'}>{item.kind === 'policy' ? '공식 안내' : '민원 사례'}</Badge>}
        <FreshnessBadge item={item} />
        <span className="ml-auto truncate text-[12.5px] text-ink-faint">{item.agency}</span>
      </div>
      <h3 className="mt-3 text-[18px] font-bold leading-snug tracking-tight">
        <Link to={`/cases/${item.id}`} className="rounded-sm hover:text-compass-deep">
          {item.title}
        </Link>
      </h3>
      {!compact && <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-muted">{item.summary}</p>}
      {!compact && item.laws.length > 0 && (
        <div className="mt-3">
          <LawChips item={item} />
        </div>
      )}
      {!compact && (
        <div className="mt-3 empty:hidden">
          <LawChangeNotice item={item} />
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap pt-4 text-[12.5px] text-ink-faint">
        {item.views > 0 && <span className="tnum">조회 {formatNumber(item.views)}</span>}
        {item.kind === 'policy' ? <span>안내 자료</span> : item.processingDays != null && <span className="tnum">{formatAnswerSpan(item.processingDays)}</span>}
        <span className="tnum ml-auto">{formatDate(item.answeredAt)} 답변</span>
      </div>
    </article>
  )
}
