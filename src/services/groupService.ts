import { GROUP_SEED } from '@/data/groups'
import { todayISO } from '@/lib/businessDays'
import { formatDate } from '@/lib/format'
import { readJSON, uid, writeJSON } from '@/lib/storage'
import { bigrams, dice } from '@/lib/text'
import type { CaseItem, ConcernGroup } from '@/types'

/**
 * 같은 고민 모아보기·공동 대응.
 * 게시글 없이 "나도 같은 문제예요" 참여만 집계합니다. 지금은 localStorage, 실제로는 서버 집계.
 */
const KEY = 'minwon-compass.groups.v3'
const JOIN_KEY = 'minwon-compass.joined.v3'
const SUBMIT_KEY = 'minwon-compass.submitted.v3'

export function listGroups(): ConcernGroup[] {
  const stored = readJSON<ConcernGroup[] | null>(KEY, null)
  if (stored === null) {
    writeJSON(KEY, GROUP_SEED)
    return GROUP_SEED
  }
  return stored
}

function save(groups: ConcernGroup[]): ConcernGroup[] {
  writeJSON(KEY, groups)
  return groups
}

export function getGroup(id: string): ConcernGroup | undefined {
  return listGroups().find((g) => g.id === id)
}

export function joinedIds(): string[] {
  return readJSON<string[]>(JOIN_KEY, [])
}

export function isJoined(id: string): boolean {
  return joinedIds().includes(id)
}

export function submittedIds(): string[] {
  return readJSON<string[]>(SUBMIT_KEY, [])
}

export function joinGroup(id: string): ConcernGroup[] {
  if (isJoined(id)) return listGroups()
  writeJSON(JOIN_KEY, [...joinedIds(), id])
  return save(listGroups().map((g) => (g.id === id ? { ...g, members: g.members + 1 } : g)))
}

export function leaveGroup(id: string): ConcernGroup[] {
  if (!isJoined(id)) return listGroups()
  writeJSON(JOIN_KEY, joinedIds().filter((x) => x !== id))
  const submitted = submittedIds().includes(id)
  if (submitted) writeJSON(SUBMIT_KEY, submittedIds().filter((x) => x !== id))
  return save(
    listGroups().map((g) =>
      g.id === id ? { ...g, members: Math.max(0, g.members - 1), submitted: Math.max(0, g.submitted - (submitted ? 1 : 0)) } : g,
    ),
  )
}

export function markSubmitted(id: string): ConcernGroup[] {
  if (submittedIds().includes(id)) return listGroups()
  if (!isJoined(id)) joinGroup(id)
  writeJSON(SUBMIT_KEY, [...submittedIds(), id])
  return save(listGroups().map((g) => (g.id === id ? { ...g, submitted: g.submitted + 1 } : g)))
}

/** 질의와 가장 가까운 그룹 (제목·질의 유사도 또는 주제 일치) */
export function matchGroup(query: string, topics: string[]): ConcernGroup | undefined {
  const qb = bigrams(query)
  let best: { g: ConcernGroup; s: number } | undefined
  for (const g of listGroups()) {
    const s = Math.max(dice(qb, bigrams(g.title)), dice(qb, bigrams(g.query)))
    if (!best || s > best.s) best = { g, s }
  }
  if (best && best.s >= 0.3) return best.g
  const topicSet = new Set(topics)
  return listGroups().find((g) => topicSet.has(g.topic))
}

export function createGroup(input: { query: string; topic: string; region?: string; agency?: string }): ConcernGroup {
  const g: ConcernGroup = {
    id: uid('g'),
    title: input.query.replace(/[?!.]+$/g, ''),
    description: '이 고민으로 처음 모인 그룹이에요. 같은 문제를 겪는 이웃이 모이면 현황을 함께 볼 수 있어요.',
    query: input.query,
    topic: input.topic,
    region: input.region,
    agency: input.agency,
    members: 1,
    submitted: 0,
    delayed: 0,
    threshold: 30,
    createdAt: todayISO(),
  }
  save([g, ...listGroups()])
  writeJSON(JOIN_KEY, [...joinedIds(), g.id])
  return g
}

/** 참여자가 기준에 도달했을 때 대표자가 제출할 공동민원 문서 */
export function buildJointDocument(g: ConcernGroup, evidence: CaseItem[]): string {
  const lines: string[] = []
  lines.push(`[공동민원] ${g.title}`)
  lines.push('')
  lines.push(`작성일: ${formatDate(g.filed?.at ?? todayISO(), 'long')}`)
  lines.push(`처리 요청 기관: ${g.agency ?? '[처리기관]'}`)
  if (g.region) lines.push(`관련 지역: ${g.region}`)
  lines.push('')
  lines.push('1. 현황')
  lines.push(`- 같은 문제를 겪는 시민 ${g.members}명이 민원나침반에서 모였습니다.`)
  lines.push(`- 이 중 ${g.submitted}명이 국민신문고에 개별 민원을 제출했고, ${g.delayed}건이 처리 지연 또는 이송을 겪었습니다.`)
  lines.push('')
  lines.push('2. 문제 상황')
  lines.push(`- ${g.description}`)
  lines.push('')
  lines.push('3. 공동 요청사항')
  lines.push('- 개별 민원을 묶어 일괄 검토하고, 처리 계획과 일정을 공개적으로 안내해 주십시오.')
  lines.push('- 처리기간을 넘긴 건에 대해 연장 사유와 담당 부서를 알려 주십시오.')
  lines.push('- 재발 방지를 위한 제도 개선 계획이 있다면 함께 안내해 주십시오.')
  if (evidence.length > 0) {
    lines.push('')
    lines.push('4. 참고한 기존 민원 사례 (국민신문고 공개 질의응답)')
    for (const c of evidence) lines.push(`- ${c.title} (${c.agency}, ${formatDate(c.answeredAt)} 답변)`)
  }
  lines.push('')
  lines.push('* 이 문서는 민원나침반이 참여자 현황을 집계해 만든 초안입니다. 대표자가 내용을 확인한 뒤 국민신문고에 직접 제출합니다.')
  return lines.join('\n')
}
