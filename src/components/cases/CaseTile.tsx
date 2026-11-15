import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatDate, formatNumber } from '@/lib/format'
import { FreshnessBadge } from './FreshnessBadge'
import { AGENCY_TYPE_SHORT } from '@/services/recommendationService'
import type { AgencyType, CaseItem } from '@/types'

const TYPE_BADGE: Record<AgencyType, 'compass' | 'mint' | 'peach'> = { central: 'compass', local: 'mint', education: 'peach' }

/**
 * 격자용 사례 카드. 상상대로 서울의 제안 카드처럼
 * 위에 기관 유형 칩, 가운데 제목, 아래에 숫자(조회·처리일·법령)를 글자로 둡니다. 그림 기호는 쓰지 않습니다.
 */
export function CaseTile({ item, className }: { item: CaseItem; className?: string }) {
  return (
    <article className={cn('group flex h-full flex-col rounded-card bg-surface-2 p-5 transition-colors hover:bg-surface hover:shadow-card', className)}>
      <div className="flex items-center justify-between gap-2">
        <Badge tone={TYPE_BADGE[item.agencyType]}>{AGENCY_TYPE_SHORT[item.agencyType]}</Badge>
        <FreshnessBadge item={item} />
      </div>
      <h3 className="mt-4 text-[17px] font-bold leading-snug tracking-tight">
        <Link to={`/cases/${item.id}`} className="line-clamp-3 hover:text-compass-deep">
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 truncate text-[13px] text-ink-muted">{item.agency}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap pt-4 text-[12.5px] text-ink-faint">
        {item.views > 0 && <span className="tnum">조회 {formatNumber(item.views)}</span>}
        {item.kind === 'policy' ? <span>안내 자료</span> : item.processingDays != null && <span className="tnum">처리 {item.processingDays}일</span>}
        <span className="tnum ml-auto">{formatDate(item.answeredAt)}</span>
      </div>
    </article>
  )
}
