import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { topicLabel } from '@/config/topics'
import { cn } from '@/lib/cn'
import type { ConcernGroup } from '@/types'

interface GroupRowProps {
  group: ConcernGroup
  joined: boolean
  onToggleJoin: () => void
}

/** 같은 고민 목록의 한 줄. 왼쪽은 고민, 가운데는 '30명 모으기' 진행, 오른쪽은 참여 버튼 하나. */
export function GroupRow({ group, joined, onToggleJoin }: GroupRowProps) {
  const reached = group.members >= group.threshold
  const remaining = Math.max(0, group.threshold - group.members)
  return (
    <article className="grid gap-4 rounded-card bg-surface p-5 shadow-card md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-center md:gap-8 md:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
          <span className="font-bold text-ink-muted">{topicLabel(group.topic)}</span>
          {reached && <span className="rounded-full bg-mint-tint px-2 py-0.5 text-[11.5px] font-bold text-mint-deep">공동민원 문서 준비됨</span>}
        </div>
        <h3 className="mt-1.5 text-[17px] font-extrabold leading-snug tracking-tight md:text-[18px]">
          <Link to={`/groups/${group.id}`} className="hover:text-compass-deep">
            {group.title}
          </Link>
        </h3>
        <p className="tnum mt-1.5 text-[13px] text-ink-muted">
          {group.region ?? group.agency}
          <span className="mx-1.5 text-line-strong">|</span>
          민원 제출 {group.submitted}건
          {group.delayed > 0 && (
            <>
              <span className="mx-1.5 text-line-strong">|</span>
              <span className="text-signal-deep">지연·이송 {group.delayed}건</span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 md:block">
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-1">
            <span className={cn('tnum text-[22px] font-extrabold leading-none', reached ? 'text-mint-deep' : 'text-compass')}>{group.members}</span>
            <span className="tnum text-[13px] font-bold text-ink-muted">/ {group.threshold}명</span>
            <span className="tnum ml-auto text-[12.5px] text-ink-faint">{reached ? '모였어요' : `${remaining}명 남음`}</span>
          </p>
          <ProgressBar value={group.members / group.threshold} tone={reached ? 'moss' : 'compass'} className="mt-2" label="공동민원 참여 진행" />
        </div>
        <Button variant={joined ? 'secondary' : 'outline'} size="md" onClick={onToggleJoin} aria-pressed={joined} className="shrink-0 md:hidden">
          <Icon name={joined ? 'check' : 'plus'} size={14} />
          {joined ? '참여 중' : '같은 문제예요'}
        </Button>
      </div>

      <div className="hidden md:block">
        <Button variant={joined ? 'secondary' : 'outline'} size="md" onClick={onToggleJoin} aria-pressed={joined}>
          <Icon name={joined ? 'check' : 'plus'} size={14} />
          {joined ? '참여 중' : '나도 같은 문제예요'}
        </Button>
      </div>
    </article>
  )
}
