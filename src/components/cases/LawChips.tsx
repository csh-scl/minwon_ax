import { cn } from '@/lib/cn'
import { lawStatuses } from '@/services/lawService'
import type { CaseItem } from '@/types'

interface LawChipsProps {
  item: CaseItem
  max?: number
  showArticle?: boolean
}

export function LawChips({ item, max = 3, showArticle = false }: LawChipsProps) {
  if (item.laws.length === 0) return null
  const seen = new Set<string>()
  const statuses = lawStatuses(item).filter((s) => {
    if (seen.has(s.law.name)) return false
    seen.add(s.law.name)
    return true
  })
  const shown = statuses.slice(0, max)
  const rest = statuses.length - shown.length
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {shown.map((s, i) => (
        <li key={`${s.law.name}-${i}`}>
          <a
            href={s.link}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              'inline-flex h-7 max-w-full items-center rounded-full px-2.5 text-[12px] font-semibold',
              s.status === 'amended' ? 'bg-signal-tint text-signal-deep' : 'bg-surface-2 text-ink-muted hover:bg-surface-3 hover:text-ink',
            )}
            title={s.status === 'amended' ? '답변 이후 개정된 법령' : s.law.article || s.law.name}
          >
            <span className="truncate">
              {s.law.name}
              {showArticle && s.law.article ? ` ${s.law.article.replace(/\(.*\)$/, '')}` : ''}
            </span>
          </a>
        </li>
      ))}
      {rest > 0 && <li className="text-xs text-ink-faint">외 {rest}개</li>}
    </ul>
  )
}
