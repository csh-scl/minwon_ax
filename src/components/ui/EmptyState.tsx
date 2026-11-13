import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-card bg-surface-2 px-6 py-14 text-center">
      <h3 className="text-[19px] font-bold tracking-tight">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
