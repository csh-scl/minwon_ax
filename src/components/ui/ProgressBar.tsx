import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  tone?: 'compass' | 'signal' | 'moss' | 'sun'
  className?: string
  label?: string
  thick?: boolean
}

export function ProgressBar({ value, tone = 'compass', className, label, thick = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={cn('w-full overflow-hidden rounded-full bg-surface-3', thick ? 'h-3' : 'h-2', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          tone === 'signal' ? 'bg-signal' : tone === 'moss' ? 'bg-mint' : tone === 'sun' ? 'bg-sun' : 'bg-compass',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
