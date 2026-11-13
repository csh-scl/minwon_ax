import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './Icon'

interface NoticeProps {
  tone?: 'info' | 'signal' | 'amber' | 'moss'
  icon?: IconName
  title?: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}

const TONE = {
  info: 'bg-compass-tint text-compass-deep',
  signal: 'bg-signal-tint text-signal-deep',
  amber: 'bg-amber-tint text-amber',
  moss: 'bg-mint-tint text-mint-deep',
}

export function Notice({ tone = 'info', icon, title, children, action, className }: NoticeProps) {
  const iconName: IconName = icon ?? (tone === 'signal' ? 'alert' : tone === 'moss' ? 'check' : 'info')
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm', TONE[tone], className)}>
      <Icon name={iconName} size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'text-[13.5px] leading-relaxed opacity-90')}>{children}</div>}
      </div>
      {action && <div className="shrink-0 text-[13px] font-bold">{action}</div>}
    </div>
  )
}
