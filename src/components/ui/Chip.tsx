import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  tone?: 'cloud' | 'white'
}

export function Chip({ active = false, tone = 'cloud', className, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-semibold transition-colors',
        className,
        active
          ? 'bg-ink text-white'
          : tone === 'white'
            ? 'bg-surface text-ink-muted hover:bg-surface-3 hover:text-ink'
            : 'bg-surface-2 text-ink-muted hover:bg-surface-3 hover:text-ink',
      )}
      {...props}
    />
  )
}
