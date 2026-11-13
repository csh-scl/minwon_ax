import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import type { ConcernGroup } from '@/types'

/** 그룹 상세 레일의 현황. 큰 숫자는 '모인 사람' 하나, 나머지는 한 줄 글자. */
export function GroupStats({ group }: { group: ConcernGroup }) {
  const remaining = Math.max(0, group.threshold - group.members)
  const reached = remaining === 0
  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className={cn('tnum text-[40px] font-extrabold leading-none tracking-tight', reached ? 'text-mint-deep' : 'text-compass')}>{group.members}</span>
        <span className="tnum text-[15px] font-bold text-ink-muted">/ {group.threshold}명 모였어요</span>
      </p>
      <ProgressBar value={group.members / group.threshold} tone={reached ? 'moss' : 'compass'} className="mt-3" thick label="공동민원 참여 진행" />
      <p className="tnum mt-3 text-[13.5px] text-ink-muted">
        민원 제출 <span className="font-bold text-ink">{group.submitted}건</span>
        <span className="mx-1.5 text-line-strong">|</span>
        지연·이송 <span className={cn('font-bold', group.delayed > 0 ? 'text-signal-deep' : 'text-ink')}>{group.delayed}건</span>
      </p>
      <p className="mt-2 text-[13px] text-ink-muted">
        {reached ? <span className="font-bold text-mint-deep">공동민원 문서를 만들 수 있어요</span> : <>{remaining}명 더 모이면 공동민원 문서를 만들어 드려요</>}
      </p>
    </div>
  )
}
