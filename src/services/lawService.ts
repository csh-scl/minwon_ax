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

export function lawStatuses(item: Pick<CaseItem, 'answeredAt' | 'laws'>): LawStatus[] {
  return item.laws.map((l) => checkLaw(l, item.answeredAt))
}

export function amendedLaws(item: Pick<CaseItem, 'answeredAt' | 'laws'>): LawAmendment[] {
  const out: LawAmendment[] = []
  for (const s of lawStatuses(item)) {
    if (s.status === 'amended' && s.amendment && !out.some((a) => a.name === s.amendment?.name)) out.push(s.amendment)
  }
  return out
}

export function hasLawChange(item: Pick<CaseItem, 'answeredAt' | 'laws'>): boolean {
  return amendedLaws(item).length > 0
}

/** 최신 답변으로 보는 기간(개월). 예산·지원 제도가 반기 단위로 바뀌는 경우가 많아 6개월로 둡니다. */
export const FRESH_MONTHS = 6
/** 이 기간(개월)을 넘으면 '1년 지난 답변' */
export const STALE_MONTHS = 12

/**
 * 답변 최신성. 법령 변경을 먼저 보고, 그다음 답변일로부터 지난 기간으로 나눕니다.
 * 1) 답변 뒤 인용 법령이 개정됨 → 법령 변경
 * 2) 6개월 이내 → 최신 답변 / 6개월~1년 → 확인 권장 / 1년 초과 → 1년 지난 답변
 */
export function freshnessOf(item: Pick<CaseItem, 'answeredAt' | 'laws'>, now: Date = new Date()): FreshnessInfo {
  const d = parseISODate(item.answeredAt)
  const months = Math.max(0, (now.getTime() - d.getTime()) / (30.44 * 86_400_000))
  if (hasLawChange(item))
    return { level: 'changed', label: '법령 변경', months, criterion: '답변 뒤에 인용 법령이 개정됐어요' }
  if (months < FRESH_MONTHS)
    return { level: 'fresh', label: '최신 답변', months, criterion: `답변일 기준 ${FRESH_MONTHS}개월 이내, 이후 법령 개정 없음` }
  if (months < STALE_MONTHS)
    return { level: 'check', label: '확인 권장', months, criterion: `답변일 기준 ${FRESH_MONTHS}개월~1년` }
  return { level: 'old', label: '1년 지난 답변', months, criterion: '답변일 기준 1년 초과' }
}

/** "8개월 전", "1년 3개월 전" */
export function agoLabel(months: number): string {
  const m = Math.floor(months)
  if (m < 1) return '이번 달'
  if (m < 12) return `${m}개월 전`
  return m % 12 ? `${Math.floor(m / 12)}년 ${m % 12}개월 전` : `${m / 12}년 전`
}
