import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'fresh' | 'check' | 'old' | 'signal' | 'compass' | 'mint' | 'peach' | 'sun' | 'neutral' | 'ink' | 'white'

const TONE: Record<BadgeTone, string> = {
  fresh: 'bg-mint-tint text-mint-deep',
  check: 'bg-amber-tint text-amber',
  old: 'bg-surface-3 text-ink-muted',
  signal: 'bg-signal-tint text-signal-deep',
  compass: 'bg-compass-tint text-compass-deep',
  mint: 'bg-mint-tint text-mint-deep',
  peach: 'bg-peach-tint text-peach-deep',
  sun: 'bg-sun-tint text-amber',
  neutral: 'bg-surface-3 text-ink-muted',
  ink: 'bg-ink text-white',
  white: 'bg-surface text-ink shadow-card',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  size?: 'sm' | 'md'
}

export function Badge({ tone = 'neutral', size = 'sm', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold leading-none',
        size === 'sm' ? 'h-6 px-2 text-[12px]' : 'h-7 px-2.5 text-[13px]',
        TONE[tone],
        className,
      )}
      {...props}
    />
  )
}
