import { Icon } from '@/components/ui/Icon'
import { businessDaysBetween, todayISO } from '@/lib/businessDays'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import type { ConcernGroup } from '@/types'

interface FiledProgressProps {
  filed: NonNullable<ConcernGroup['filed']>
  agency?: string
  threshold: number
}

/** 제출된 공동민원의 진행 단계. 문서 준비 → 대표자 제출 → 기관 답변 순서로 보여 줘요. */
export function FiledProgress({ filed, agency, threshold }: FiledProgressProps) {
  const elapsed = Math.max(0, businessDaysBetween(filed.at, todayISO()))
  const steps = [
    { title: '공동민원 문서 준비', detail: `참여자 ${threshold}명이 모였어요`, state: 'done' as const },
    { title: '대표자 제출', detail: `${formatDate(filed.at)} 국민신문고 접수`, state: 'done' as const },
    { title: '기관 답변', detail: `${agency ?? '처리기관'}에서 검토하고 있어요`, state: 'current' as const },
  ]

  return (
    <div className="rounded-card bg-surface p-5 shadow-card md:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="rounded-full bg-compass-tint px-2.5 py-1 text-[12.5px] font-bold text-compass-deep">처리 중</span>
        <p className="tnum text-[15px] font-extrabold">
          접수 후 <span className="text-compass">{elapsed}영업일</span>째
        </p>
        <p className="tnum text-[13px] text-ink-muted md:ml-auto">접수번호 {filed.receiptNo}</p>
      </div>

      <ol className="mt-6 grid gap-4 md:grid-cols-3 md:gap-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 md:block">
            <div className="flex items-center md:mb-3">
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-extrabold',
                  s.state === 'done' ? 'bg-mint-deep text-white' : 'bg-compass-tint text-compass ring-2 ring-compass',
                )}
              >
                {s.state === 'done' ? <Icon name="check" size={15} /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className={cn('ml-3 hidden h-0.5 flex-1 rounded-full md:block', steps[i + 1].state === 'done' ? 'bg-mint-deep' : 'bg-line')} />}
            </div>
            <div className="min-w-0">
              <p className={cn('text-[15px] font-extrabold', s.state === 'current' && 'text-compass-deep')}>{s.title}</p>
              <p className="mt-0.5 text-[13.5px] text-ink-muted">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 border-t border-line pt-4 text-[13px] text-ink-muted">기관 답변이 오면 이 단계에 결과가 표시돼요. 그동안에도 참여할 수 있어요.</p>
    </div>
  )
}
