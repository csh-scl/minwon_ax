import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { calendarDaysBetween, todayISO } from '@/lib/businessDays'
import { formatDate } from '@/lib/format'
import { FRESH_MONTHS, agoLabel, amendedLaws, freshnessOf } from '@/services/lawService'
import type { CaseItem } from '@/types'

/**
 * 답변 유효성 타임라인. 답변일 → (법령 개정일) → 오늘을 한 줄에 놓아
 * "이 답은 그 뒤에 바뀌었는지"를 한눈에 보여줍니다.
 * 개정일 점은 축 위에만 찍고 이름·날짜는 축 아래 목록으로 빼서, 답변일과 가까워도 글자가 겹치지 않습니다.
 */
export function FreshnessTimeline({ item }: { item: CaseItem }) {
  const today = todayISO()
  const fresh = freshnessOf(item)
  const ago = agoLabel(fresh.months)
  const changes = amendedLaws(item).filter((c) => c.amendedAt > item.answeredAt && c.amendedAt <= today)
  const span = Math.max(1, calendarDaysBetween(item.answeredAt, today))
  const pos = (iso: string) => Math.min(100, Math.max(0, (calendarDaysBetween(item.answeredAt, iso) / span) * 100))

  const verdict =
    changes.length > 0
      ? { tone: 'signal', icon: 'alert' as const, text: `답변 뒤에 관련 법령 ${changes.length}건이 바뀌었어요. 최신 법령을 꼭 확인하세요.` }
      : fresh.level === 'fresh'
        ? { tone: 'mint', icon: 'check' as const, text: `${ago} 답변이에요. 제공된 자료에서는 이후 법령 개정 내역이 확인되지 않아요.` }
        : fresh.level === 'check'
          ? { tone: 'amber', icon: 'info' as const, text: `${ago} 답변이에요. 제도는 그대로일 수 있지만 담당 부서에 한 번 더 확인하면 좋아요.` }
          : { tone: 'slate', icon: 'clock' as const, text: `${ago} 답변이에요. 1년이 지난 안내라 지금과 다를 수 있어요.` }

  const toneClass =
    verdict.tone === 'signal'
      ? 'bg-signal-tint text-signal-deep'
      : verdict.tone === 'mint'
        ? 'bg-mint-tint text-mint-deep'
        : verdict.tone === 'amber'
          ? 'bg-amber-tint text-amber'
          : 'bg-surface-3 text-ink-muted'

  return (
    <div className="rounded-card bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[17px] font-extrabold">이 답변, 지금도 참고할 수 있나요?</h2>
        <span className="text-[12.5px] text-ink-faint">답변일부터 오늘까지</span>
      </div>

      <div className="relative mt-8 h-14">
        <div className="absolute inset-x-0 top-3 h-1.5 rounded-full bg-surface-3" />
        <div className={cn('absolute left-0 top-3 h-1.5 rounded-full', changes.length > 0 ? 'bg-signal/60' : 'bg-mint/60')} style={{ width: '100%' }} />
        <Marker left={0} label="답변" date={formatDate(item.answeredAt)} tone="ink" align="start" />
        {changes.map((c) => (
          <span
            key={c.name}
            aria-hidden="true"
            className="absolute top-[2px] h-4 w-4 -translate-x-1/2 rounded-full bg-signal ring-4 ring-surface"
            style={{ left: `${pos(c.amendedAt)}%` }}
          />
        ))}
        <Marker left={100} label="오늘" date={formatDate(today)} tone="compass" align="end" />
      </div>

      {changes.length > 0 && (
        <ul className="mt-4 space-y-1.5" aria-label="답변 뒤 개정된 법령">
          {changes.map((c) => (
            <li key={c.name} className="flex flex-wrap items-baseline gap-x-2 text-[13.5px]">
              <span aria-hidden="true" className="relative top-[-1px] inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-signal" />
              <span className="font-bold text-signal-deep">「{c.name}」 개정</span>
              <span className="tnum text-ink-muted">{formatDate(c.amendedAt)}</span>
              <a href={c.link} target="_blank" rel="noreferrer noopener" className="ml-auto font-semibold text-compass underline-offset-2 hover:underline">
                최신 법령 보기
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className={cn('mt-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold leading-relaxed', toneClass)}>
        <Icon name={verdict.icon} size={17} className="mt-0.5 shrink-0" />
        {verdict.text}
      </p>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
        판단 기준: 답변 뒤 인용 법령이 바뀌면 <b className="font-semibold text-ink-muted">법령 변경</b>, 그렇지 않으면 답변일부터{' '}
        {FRESH_MONTHS}개월 이내 <b className="font-semibold text-ink-muted">최신 답변</b> · {FRESH_MONTHS}개월~1년{' '}
        <b className="font-semibold text-ink-muted">확인 권장</b> · 1년 초과 <b className="font-semibold text-ink-muted">1년 지난 답변</b>
      </p>
    </div>
  )
}

function Marker({ left, label, date, tone, align }: { left: number; label: string; date: string; tone: 'ink' | 'signal' | 'compass'; align: 'start' | 'center' | 'end' }) {
  const dot = tone === 'signal' ? 'bg-signal' : tone === 'compass' ? 'bg-compass' : 'bg-ink'
  const translate = align === 'start' ? 'translate-x-0' : align === 'end' ? '-translate-x-full' : '-translate-x-1/2'
  const text = align === 'start' ? 'text-left' : align === 'end' ? 'text-right' : 'text-center'
  return (
    <div className={cn('absolute top-0 flex flex-col', translate, text)} style={{ left: `${left}%` }}>
      <span className={cn('h-4 w-4 rounded-full ring-4 ring-surface', dot, align === 'center' ? 'self-center' : align === 'end' ? 'self-end' : 'self-start', 'mt-[2px]')} />
      <span className="mt-2 whitespace-nowrap text-[12.5px] font-bold">{label}</span>
      <span className="tnum whitespace-nowrap text-[12px] text-ink-faint">{date}</span>
    </div>
  )
}
