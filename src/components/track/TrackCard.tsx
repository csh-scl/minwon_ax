import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { addBusinessDays, calendarDaysBetween, todayISO } from '@/lib/businessDays'
import { formatDate } from '@/lib/format'
import { progressOf, STATUS_LABEL } from '@/services/trackingService'
import type { ConcernGroup, TrackStatus, TrackedComplaint } from '@/types'

interface TrackCardProps {
  item: TrackedComplaint
  group?: ConcernGroup
  onStatus: (status: TrackStatus) => void
  onTransferred: () => void
  onEdit: () => void
  onRemove: () => void
  onGuide: (kind: 'extension' | 'acrc') => void
}

/**
 * 추적 카드. 오른쪽 위 D-day 와 날짜 축(접수 → 오늘 → 예상 완료일) 둘로 상태를 말합니다.
 * 기한을 넘기면 카드 아래에 붉은 안내 줄이 붙고, 상태 바꾸기는 맨 아래 글자 버튼 줄에 모읍니다.
 */
export function TrackCard({ item, group, onStatus, onTransferred, onEdit, onRemove, onGuide }: TrackCardProps) {
  const p = progressOf(item)
  const answered = item.status === 'answered'
  const overdue = p.overdue && !answered
  const today = todayISO()
  const deadline = addBusinessDays(item.receivedAt, item.expectedBusinessDays)
  const end = deadline > today ? deadline : today
  const span = Math.max(1, calendarDaysBetween(item.receivedAt, end))
  const pos = (iso: string) => Math.min(100, Math.max(0, (calendarDaysBetween(item.receivedAt, iso) / span) * 100))
  const todayPos = pos(today)
  const deadlinePos = pos(deadline)
  const dday = deadline >= today ? calendarDaysBetween(today, deadline) : -calendarDaysBetween(deadline, today)
  const ddayText = answered ? '완료' : dday === 0 ? 'D-day' : dday > 0 ? `D-${dday}` : `D+${-dday}`
  const tone = answered ? 'text-mint-deep' : overdue ? 'text-signal' : 'text-compass'

  return (
    <article className={cn('overflow-hidden rounded-card bg-surface shadow-card', overdue && 'ring-1 ring-signal/40')}>
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-muted">
              {answered ? (
                <Badge tone="fresh" size="md">답변 완료</Badge>
              ) : overdue ? (
                <Badge tone="signal" size="md">기간 초과</Badge>
              ) : (
                <Badge tone={item.status === 'extended' ? 'check' : 'compass'} size="md">{STATUS_LABEL[item.status]}</Badge>
              )}
              <span>{item.agency}</span>
              <span className="tnum">{formatDate(item.receivedAt)} 접수</span>
              {item.transfers > 0 && <span className="tnum">이송 {item.transfers}회</span>}
            </div>
            <h3 className="mt-2.5 text-[18px] font-extrabold leading-snug tracking-tight md:text-[20px]">{item.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className={cn('tnum text-[28px] font-extrabold leading-none tracking-tight md:text-[32px]', tone)}>{ddayText}</p>
            <p className="tnum mt-1.5 whitespace-nowrap text-[12.5px] text-ink-muted">예상 완료일 {formatDate(deadline)}</p>
          </div>
        </div>

        <div className="relative mt-7 h-14" role="img" aria-label={`${formatDate(item.receivedAt)} 접수, 기한 ${formatDate(deadline)}, 오늘 ${formatDate(today)}`}>
          <div className="absolute inset-x-0 top-[7px] h-1.5 rounded-full bg-surface-3" />
          <div className={cn('absolute left-0 top-[7px] h-1.5 rounded-l-full', answered ? 'bg-mint' : 'bg-compass')} style={{ width: `${Math.min(todayPos, deadlinePos)}%` }} />
          {overdue && <div className="absolute top-[7px] h-1.5 rounded-r-full bg-signal" style={{ left: `${deadlinePos}%`, width: `${todayPos - deadlinePos}%` }} />}
          <AxisMark left={0} align="start" label="접수" tone="ink" />
          <AxisMark left={deadlinePos} align={deadlinePos > 85 ? 'end' : 'center'} label="예상 완료일" tone={overdue ? 'signal' : 'ink'} tick />
          {!answered && <AxisMark left={todayPos} align={todayPos > 85 ? 'end' : todayPos < 15 ? 'start' : 'center'} label="오늘" tone="compass" above />}
        </div>
        <p className="tnum mt-1 text-[13px] text-ink-muted">
          {p.elapsedBusiness}영업일째 · 처리기간 {p.expected}영업일
        </p>
      </div>

      {overdue && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 bg-signal-tint/70 px-5 py-3 text-[13.5px] md:px-6">
          <span className="tnum font-bold text-signal-deep">예상 완료일이 {-dday}일 지났어요</span>
          <button type="button" onClick={() => onGuide('extension')} className="inline-flex items-center gap-0.5 font-bold text-signal-deep underline-offset-4 hover:underline">
            연장 통지 확인하기
            <Icon name="chevron-right" size={14} />
          </button>
          <button type="button" onClick={() => onGuide('acrc')} className="inline-flex items-center gap-0.5 font-bold text-signal-deep underline-offset-4 hover:underline">
            권익위 고충민원 알아보기
            <Icon name="chevron-right" size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-line/70 px-2.5 py-1.5 md:px-3.5">
        {!answered ? (
          <>
            <TextAction onClick={() => onStatus('answered')}>답변 받았어요</TextAction>
            <TextAction onClick={onTransferred}>이송됐어요</TextAction>
            {item.status !== 'extended' && <TextAction onClick={() => onStatus('extended')}>연장 통지 받았어요</TextAction>}
          </>
        ) : (
          <TextAction onClick={() => onStatus('processing')}>처리 중으로 변경</TextAction>
        )}
        <span className="ml-auto flex items-center gap-0.5">
          {group && (
            <Link to={`/groups/${group.id}`} className="tnum inline-flex h-9 items-center gap-0.5 rounded-full px-2.5 text-[13px] font-bold text-mint-deep hover:bg-mint-tint">
              같은 고민 {group.members}명
              <Icon name="chevron-right" size={14} />
            </Link>
          )}
          <button type="button" onClick={onEdit} aria-label="수정" className="rounded-full p-2 text-ink-faint hover:bg-surface-2 hover:text-ink">
            <Icon name="edit" size={16} />
          </button>
          <button type="button" onClick={onRemove} aria-label="삭제" className="rounded-full p-2 text-ink-faint hover:bg-signal-tint hover:text-signal-deep">
            <Icon name="trash" size={16} />
          </button>
        </span>
      </div>
    </article>
  )
}

function TextAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-9 items-center rounded-full px-2.5 text-[13.5px] font-bold text-ink-muted hover:bg-surface-2 hover:text-ink">
      {children}
    </button>
  )
}

function AxisMark({ left, align, label, tone, tick = false, above = false }: { left: number; align: 'start' | 'center' | 'end'; label: string; tone: 'ink' | 'signal' | 'compass'; tick?: boolean; above?: boolean }) {
  const color = tone === 'signal' ? 'text-signal' : tone === 'compass' ? 'text-compass' : 'text-ink-muted'
  const dot = tone === 'signal' ? 'bg-signal' : tone === 'compass' ? 'bg-compass' : 'bg-ink/70'
  const translate = align === 'start' ? '' : align === 'end' ? '-translate-x-full' : '-translate-x-1/2'
  const items = align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center'
  return (
    <div className={cn('absolute flex flex-col', translate, items, above ? '-top-[18px]' : 'top-0')} style={{ left: `${left}%` }}>
      {above ? (
        <>
          <span className={cn('whitespace-nowrap text-[12px] font-extrabold', color)}>{label}</span>
          <span className={cn('mt-0.5 h-4 w-4 rounded-full ring-4 ring-surface', dot)} />
        </>
      ) : (
        <>
          <span className={cn('mt-[2px] rounded-full ring-4 ring-surface', tick ? 'h-3 w-1.5' : 'h-3 w-3', dot)} />
          <span className={cn('mt-2.5 whitespace-nowrap text-[12px] font-bold', color)}>{label}</span>
        </>
      )}
    </div>
  )
}
