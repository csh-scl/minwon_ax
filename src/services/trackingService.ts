import { addCalendarDays, businessDaysBetween, calendarDaysBetween, todayISO } from '@/lib/businessDays'
import { readJSON, uid, writeJSON } from '@/lib/storage'
import type { TrackProgress, TrackStatus, TrackedComplaint } from '@/types'

/**
 * 내 민원 추적. 민원 본문은 저장하지 않고 접수일·기관·상태만 저장합니다.
 * 지금은 localStorage, 실제 서비스에서는 비식별 처리된 서버 저장소를 씁니다.
 */
const KEY = 'minwon-compass.tracking.v1'

export const STATUS_LABEL: Record<TrackStatus, string> = {
  processing: '처리 중',
  extended: '기간 연장',
  transferred: '이송됨',
  answered: '답변 완료',
}

/** [Mock] 첫 방문 시 보여줄 예시 민원 2건 (목업 기준) */
function seed(): TrackedComplaint[] {
  const today = todayISO()
  return [
    {
      id: 'seed-1',
      title: '통학로 공사로 인도가 막혔어요',
      agency: '서울특별시 서초구',
      agencyType: 'local',
      receivedAt: addCalendarDays(today, -27),
      status: 'transferred',
      transfers: 1,
      expectedBusinessDays: 14,
      groupId: 'g-school-road',
      createdAt: addCalendarDays(today, -27),
    },
    {
      id: 'seed-2',
      title: '초등 방과후 돌봄 신청 문의',
      agency: '서울특별시교육청',
      agencyType: 'education',
      receivedAt: addCalendarDays(today, -12),
      status: 'processing',
      transfers: 0,
      expectedBusinessDays: 10,
      groupId: 'g-care',
      createdAt: addCalendarDays(today, -12),
    },
  ]
}

export function listTracked(): TrackedComplaint[] {
  const stored = readJSON<TrackedComplaint[] | null>(KEY, null)
  if (stored === null) {
    const s = seed()
    writeJSON(KEY, s)
    return s
  }
  return stored
}

export function addTracked(input: Omit<TrackedComplaint, 'id' | 'createdAt'>): TrackedComplaint {
  const item: TrackedComplaint = { ...input, id: uid('trk'), createdAt: todayISO() }
  writeJSON(KEY, [item, ...listTracked()])
  return item
}

export function updateTracked(id: string, patch: Partial<TrackedComplaint>): TrackedComplaint[] {
  const next = listTracked().map((t) => (t.id === id ? { ...t, ...patch } : t))
  writeJSON(KEY, next)
  return next
}

export function removeTracked(id: string): TrackedComplaint[] {
  const next = listTracked().filter((t) => t.id !== id)
  writeJSON(KEY, next)
  return next
}

export function progressOf(item: TrackedComplaint, today: string = todayISO()): TrackProgress {
  const elapsedBusiness = businessDaysBetween(item.receivedAt, today)
  const elapsedCalendar = calendarDaysBetween(item.receivedAt, today)
  const expected = Math.max(1, item.expectedBusinessDays)
  const ratio = elapsedBusiness / expected
  return {
    elapsedBusiness,
    elapsedCalendar,
    expected,
    ratio,
    overdue: item.status !== 'answered' && elapsedBusiness > expected,
    remaining: Math.max(0, expected - elapsedBusiness),
  }
}

export function isActive(item: TrackedComplaint): boolean {
  return item.status !== 'answered'
}

export function summarizeTracked(list: TrackedComplaint[]): { active: number; overdue: number; answered: number } {
  let active = 0
  let overdue = 0
  let answered = 0
  for (const t of list) {
    if (t.status === 'answered') answered += 1
    else {
      active += 1
      if (progressOf(t).overdue) overdue += 1
    }
  }
  return { active, overdue, answered }
}
