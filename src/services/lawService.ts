import { LAW_AMENDMENTS } from '@/data/lawAmendments'
import { parseISODate } from '@/lib/businessDays'
import type { CaseItem, FreshnessInfo, LawAmendment, LawRef, LawStatus } from '@/types'

/**
 * 답변 최신성·법령 개정 확인.
 * 실제 서비스에서는 법제처 Open API(RAG)로 답변일 이후 개정 여부를 조회합니다.
 */
const byName = new Map(LAW_AMENDMENTS.map((a) => [a.name, a]))

export function lawLink(name: string): string {
  return `https://www.law.go.kr/lsSc.do?menuId=1&query=${encodeURIComponent(name)}`
}

export function checkLaw(law: LawRef, answeredAt: string): LawStatus {
  const amendment = byName.get(law.name)
  if (!amendment) return { law, status: 'unknown', link: lawLink(law.name) }
  if (amendment.amendedAt > answeredAt) return { law, status: 'amended', amendment, link: amendment.link }
  return { law, status: 'unchanged', link: amendment.link }
}

export function lawStatuses(item: CaseItem): LawStatus[] {
  return item.laws.map((l) => checkLaw(l, item.answeredAt))
}

export function amendedLaws(item: CaseItem): LawAmendment[] {
  const out: LawAmendment[] = []
  for (const s of lawStatuses(item)) {
    if (s.status === 'amended' && s.amendment && !out.some((a) => a.name === s.amendment?.name)) out.push(s.amendment)
  }
  return out
}

export function hasLawChange(item: CaseItem): boolean {
  return amendedLaws(item).length > 0
}

/** 답변일 기준 1년 이내 최신, 1~3년 확인 권장, 3년 초과 오래된 답변 */
export function freshnessOf(answeredAt: string, now: Date = new Date()): FreshnessInfo {
  const d = parseISODate(answeredAt)
  const years = (now.getTime() - d.getTime()) / (365.25 * 86_400_000)
  if (years < 1) return { level: 'fresh', label: '최신 답변', years }
  if (years < 3) return { level: 'check', label: `${Math.max(1, Math.floor(years))}년 전 답변`, years }
  return { level: 'old', label: '오래된 답변', years }
}

export const FRESHNESS_LABEL: Record<FreshnessInfo['level'], string> = {
  fresh: '최신',
  check: '확인 권장',
  old: '오래된 답변',
}
