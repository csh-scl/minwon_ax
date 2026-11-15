import { TOPICS } from '@/config/topics'
import { freshnessOf, hasLawChange } from '@/services/lawService'
import { extraDocsHint } from '@/services/draftService'
import type { AgencyType, SearchHit } from '@/types'

/**
 * 집계 레이어. 검색 결과 상단 '종합 안내'에 쓰는 집계를 만듭니다.
 * 실제 서비스에서는 서버 집계 API 로 교체합니다.
 */
export interface SearchSummary {
  total: number
  typeShares: Record<AgencyType, number>
  dominantType: AgencyType
  topAgencies: { name: string; type: AgencyType; count: number }[]
  medianDays: number | null
  freshShare: number
  lawChanged: number
  topLaws: { name: string; count: number }[]
  extraDocs: { count: number; examples: string[] }
  topicLabels: string[]
}

export function summarizeHits(hits: SearchHit[]): SearchSummary {
  const top = hits.slice(0, 20)
  const shares: Record<AgencyType, number> = { central: 0, local: 0, education: 0 }
  const agencyCount = new Map<string, { type: AgencyType; count: number }>()
  const lawCount = new Map<string, number>()
  const topicCount = new Map<string, number>()
  const days: number[] = []
  let fresh = 0
  let lawChanged = 0
  for (const h of top) {
    shares[h.item.agencyType] += h.score
    const a = agencyCount.get(h.item.agency) ?? { type: h.item.agencyType, count: 0 }
    a.count += 1
    agencyCount.set(h.item.agency, a)
    for (const l of h.item.laws) lawCount.set(l.name, (lawCount.get(l.name) ?? 0) + 1)
    for (const t of h.item.topics) topicCount.set(t, (topicCount.get(t) ?? 0) + 1)
    if (h.item.kind === 'case' && h.item.processingDays != null && h.item.processingDays <= 60) days.push(h.item.processingDays)
    if (freshnessOf(h.item).level === 'fresh') fresh += 1
    if (hasLawChange(h.item)) lawChanged += 1
  }
  const total = shares.central + shares.local + shares.education || 1
  const typeShares: Record<AgencyType, number> = {
    central: shares.central / total,
    local: shares.local / total,
    education: shares.education / total,
  }
  const dominantType = (Object.keys(typeShares) as AgencyType[]).sort((a, b) => typeShares[b] - typeShares[a])[0]
  days.sort((a, b) => a - b)
  const medianDays = days.length ? days[Math.floor(days.length / 2)] : null
  return {
    total: hits.length,
    typeShares,
    dominantType,
    topAgencies: [...agencyCount.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    medianDays,
    freshShare: top.length ? fresh / top.length : 0,
    lawChanged,
    topLaws: [...lawCount.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    extraDocs: extraDocsHint(hits),
    topicLabels: [...topicCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => TOPICS.find((d) => d.slug === t)?.label ?? t),
  }
}
