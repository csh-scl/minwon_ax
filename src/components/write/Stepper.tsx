import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export const WRITE_STEPS = ['처리기관 확인', '필수 정보 점검', '초안 완성'] as const

interface StepperProps {
  current: 1 | 2 | 3
  orientation?: 'horizontal' | 'vertical'
  onJump?: (step: 1 | 2 | 3) => void
}

export function Stepper({ current, orientation = 'horizontal', onJump }: StepperProps) {
  const vertical = orientation === 'vertical'
  return (
    <ol className={cn('flex', vertical ? 'flex-col gap-3' : 'items-center gap-2')} aria-label="작성 단계">
      {WRITE_STEPS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const done = n < current
        const active = n === current
        const clickable = done && onJump
        return (
          <li key={label} className={cn('flex items-center gap-2', !vertical && 'flex-1')} aria-current={active ? 'step' : undefined}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump(n)}
              className={cn(
                'flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-left transition-colors',
                active ? 'bg-surface shadow-card' : clickable ? 'cursor-pointer hover:bg-surface/60' : 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-extrabold',
                  active ? 'bg-compass text-white' : done ? 'bg-mint text-white' : 'bg-surface-3 text-ink-faint',
                )}
              >
                {done ? <Icon name="check" size={14} /> : n}
              </span>
              <span className={cn('text-[13.5px] font-bold', active ? 'text-ink' : done ? 'text-ink-muted' : 'text-ink-faint', !vertical && 'hidden sm:inline')}>
                {label}
              </span>
            </button>
            {!vertical && i < WRITE_STEPS.length - 1 && <span aria-hidden="true" className="h-px flex-1 bg-line-strong" />}
          </li>
        )
      })}
    </ol>
  )
}
