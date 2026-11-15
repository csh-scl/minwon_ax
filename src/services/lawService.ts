import { parseISODate } from '@/lib/businessDays'
import type { CaseItem, FreshnessInfo, LawAmendment, LawRef, LawStatus } from '@/types'

/**
 * 답변 최신성·법령 개정 확인.
 * 인용 법령·조문의 개정 여부는 민원 DB를 만들 때 법제처 국가법령정보로 조회한 결과(LawRef.changedAt)를 씁니다.
 * - 조문 본문을 받은 법령: 인용한 조문의 최종 개정일이 답변일보다 늦으면 '조문 개정'
 * - 그 밖(자치법규·행정규칙·조문 미확인): 법령 시행일이 답변일보다 늦으면 '법령 개정(조문 미확인)'
 */
type Cited = Pick<CaseItem, 'answeredAt' | 'laws'>

export function lawLink(name: string): string {
  return `https://www.law.go.kr/lsSc.do?menuId=1&query=${encodeURIComponent(name)}`
}

function linkOf(law: LawRef): string {
  return law.link ?? lawLink(law.name)
}

function amendmentOf(law: LawRef): LawAmendment {
  const what = law.changeScope === 'article' ? `인용한 ${law.article || '조문'}이 바뀌었어요.` : '법령이 개정됐어요. 인용한 조문이 바뀌었는지는 원문에서 확인해 주세요.'
  return { name: law.name, amendedAt: law.changedAt ?? '', summary: what, link: linkOf(law) }
}

export function checkLaw(law: LawRef): LawStatus {
  const link = linkOf(law)
  if (law.changedAt && law.changeScope === 'article') return { law, status: 'amended', amendment: amendmentOf(law), link }
  if (law.changedAt) return { law, status: 'lawAmended', amendment: amendmentOf(law), link }
  return { law, status: 'unchanged', link }
}

export function lawStatuses(item: Cited): LawStatus[] {
  return item.laws.map((l) => checkLaw(l))
}

function changesOf(item: Cited, status: LawStatus['status']): LawAmendment[] {
  const out: LawAmendment[] = []
  for (const s of lawStatuses(item)) {
    if (s.status === status && s.amendment && !out.some((a) => a.name === s.amendment?.name)) out.push(s.amendment)
  }
  return out
}

/** 인용한 조문이 답변 뒤에 바뀐 법령 (법령 변경 배지·안내의 근거) */
export function amendedLaws(item: Cited): LawAmendment[] {
  return changesOf(item, 'amended')
}

/** 법령은 답변 뒤에 개정됐지만, 인용한 조문이 바뀌었는지는 확인하지 못한 법령 */
export function lawLevelChanges(item: Cited): LawAmendment[] {
  const article = new Set(amendedLaws(item).map((a) => a.name))
  return changesOf(item, 'lawAmended').filter((a) => !article.has(a.name))
}

export function hasLawChange(item: Cited): boolean {
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
export function freshnessOf(item: Cited, now: Date = new Date()): FreshnessInfo {
  const d = parseISODate(item.answeredAt)
  const months = Math.max(0, (now.getTime() - d.getTime()) / (30.44 * 86_400_000))
  if (hasLawChange(item))
    return { level: 'changed', label: '법령 변경', months, criterion: '답변 뒤에 인용한 조문이 개정됐어요' }
  if (months < FRESH_MONTHS)
    return { level: 'fresh', label: '최신 답변', months, criterion: `답변일 기준 ${FRESH_MONTHS}개월 이내, 이후 인용 조문 개정 없음` }
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
