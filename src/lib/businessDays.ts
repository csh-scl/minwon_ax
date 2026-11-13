import { HOLIDAYS } from '@/data/holidays'

const holidaySet = new Set(HOLIDAYS.map((h) => h.date))

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function isBusinessDay(d: Date): boolean {
  const day = d.getDay()
  if (day === 0 || day === 6) return false
  return !holidaySet.has(toISODate(d))
}

/** start 다음 날부터 end 까지(포함)의 영업일 수 */
export function businessDaysBetween(startISO: string, endISO: string): number {
  const start = parseISODate(startISO)
  const end = parseISODate(endISO)
  if (end <= start) return 0
  let n = 0
  const cur = new Date(start)
  cur.setDate(cur.getDate() + 1)
  while (cur <= end) {
    if (isBusinessDay(cur)) n += 1
    cur.setDate(cur.getDate() + 1)
  }
  return n
}

export function calendarDaysBetween(startISO: string, endISO: string): number {
  const a = parseISODate(startISO).getTime()
  const b = parseISODate(endISO).getTime()
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

export function addBusinessDays(startISO: string, n: number): string {
  const cur = parseISODate(startISO)
  let left = n
  while (left > 0) {
    cur.setDate(cur.getDate() + 1)
    if (isBusinessDay(cur)) left -= 1
  }
  return toISODate(cur)
}

export function addCalendarDays(startISO: string, n: number): string {
  const cur = parseISODate(startISO)
  cur.setDate(cur.getDate() + n)
  return toISODate(cur)
}
