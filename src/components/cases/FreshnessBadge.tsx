import { Badge } from '@/components/ui/Badge'
import { freshnessOf } from '@/services/lawService'

export function FreshnessBadge({ answeredAt }: { answeredAt: string }) {
  const f = freshnessOf(answeredAt)
  return <Badge tone={f.level}>{f.label}</Badge>
}
