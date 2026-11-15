import { parseISODate } from './businessDays'

export function formatDate(iso: string, style: 'dot' | 'long' = 'dot'): string {
  if (!iso) return ''
  const d = parseISODate(iso)
  if (style === 'long') return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

/** 기관명에서 부서명만 남기기: "국토교통부 건설정책국 건설안전과" → "건설정책국 건설안전과" */
export function shortDept(dept: string, agency: string): string {
  if (!dept) return ''
  const trimmed = dept.startsWith(agency) ? dept.slice(agency.length).trim() : dept
  return trimmed || dept
}

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trimEnd()}…`
}

/** 신청일부터 답변일까지 걸린 날(달력 기준). 0일이면 당일 답변 */
export function formatAnswerSpan(days: number): string {
  return days <= 0 ? '당일 답변' : `답변까지 ${days}일`
}
