import { Badge } from '@/components/ui/Badge'
import { freshnessOf } from '@/services/lawService'
import type { CaseItem } from '@/types'

export function FreshnessBadge({ item, size }: { item: Pick<CaseItem, 'answeredAt' | 'laws'>; size?: 'sm' | 'md' }) {
  const f = freshnessOf(item)
  return (
    <Badge tone={f.level} size={size} title={f.criterion}>
      {f.label}
    </Badge>
  )
}
