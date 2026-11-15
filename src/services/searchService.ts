import { bigrams, dice, expandTokens, normalize, tokenize } from '@/lib/text'
import type { CaseItem, SearchHit, SearchResult } from '@/types'
import { api } from './api'

/**
 * 유사 질의응답 탐색.
 * 지금은 브라우저에서 토큰(IDF 가중)·바이그램 기반으로 점수를 매기지만,
 * 실제 서비스에서는 임베딩(BGE-M3) + 벡터DB 검색 API 호출로 교체합니다.
 */
interface IndexEntry {
  item: CaseItem
  title: string
  summary: string
  answer: string
  titleBigrams: Set<string>
}

let index: IndexEntry[] | null = null

async function getIndex(): Promise<IndexEntry[]> {
  if (!index) {
    const cases = await api.getCases()
    index = cases.map((item) => ({
      item,
      title: normalize(item.title),
      summary: normalize(item.summary),
      answer: normalize(item.answer),
      titleBigrams: bigrams(item.title),
    }))
  }
  return index
}

export interface SearchOptions {
  topic?: string
  /** 여러 주제를 한 번에(분야 갈래). topic 과 함께 주면 둘 다 만족해야 합니다. */
  topics?: string[]
  limit?: number
  excludeId?: string
}

/** 이 점수 미만이면 "유사 사례 없음" 으로 안내 */
export const NO_MATCH_THRESHOLD = 0.24

/** 토큰이 제목·요약에 등장하는 문서 수로 희소성(IDF)을 계산 */
function idfOf(idx: IndexEntry[], token: string): number {
  let df = 0
  for (const e of idx) if (e.title.includes(token) || e.summary.includes(token)) df += 1
  return Math.max(0.25, Math.log((idx.length + 1) / (df + 1)))
}

export async function searchCases(query: string, opts: SearchOptions = {}): Promise<SearchResult> {
  const t0 = performance.now()
  const idx = await getIndex()
  const limit = opts.limit ?? 30
  const q = query.trim()
  const tokens = tokenize(q)
  const expanded = expandTokens(tokens).map((t) => ({ ...t, idf: idfOf(idx, t.token) }))
  const baseWeight = expanded.filter((t) => t.weight === 1).reduce((s, t) => s + t.idf, 0) || 1
  // 조사·어미를 뗀 핵심어로 바이그램을 만들어 말투(…어요)로 인한 잡음을 줄임
  const qBigrams = bigrams(tokens.join(' ') || q)

  const hits: SearchHit[] = []
  for (const e of idx) {
    if (opts.topic && !e.item.topics.includes(opts.topic)) continue
    if (opts.topics && opts.topics.length > 0 && !e.item.topics.some((t) => opts.topics!.includes(t))) continue
    if (opts.excludeId && e.item.id === opts.excludeId) continue
    let score = 0
    const matched: string[] = []
    if (tokens.length > 0) {
      for (const { token, weight, origin, idf } of expanded) {
        let strength = 0
        if (e.title.includes(token)) strength = 1
        else if (e.summary.includes(token)) strength = 0.5
        else if (e.answer.includes(token)) strength = 0.3
        if (strength === 0) continue
        score += strength * weight * idf
        if (strength >= 0.5 && !matched.includes(origin)) matched.push(origin)
      }
      score /= baseWeight
      score += 1.0 * dice(qBigrams, e.titleBigrams)
      score += 0.02 * Math.log10(e.item.views + 1)
    } else {
      // 질의 없이 주제만 고른 경우: 분야별 대표 사례를 먼저, 나머지는 조회수 순
      score = 0.3 + 0.1 * Math.log10(e.item.views + 1)
      if (e.item.featuredRank) score += 10 - e.item.featuredRank * 0.01
    }
    if (score <= 0.05) continue
    hits.push({ item: e.item, score, matched })
  }
  hits.sort((a, b) => b.score - a.score)

  // 제목이 거의 같은 사례는 하나만
  const seen = new Set<string>()
  const deduped: SearchHit[] = []
  for (const h of hits) {
    const key = normalize(h.item.title).replace(/\s/g, '').slice(0, 18)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(h)
    if (deduped.length >= limit) break
  }

  const noMatch = tokens.length > 0 && (deduped.length === 0 || deduped[0].score < NO_MATCH_THRESHOLD)
  const final = noMatch ? [] : deduped
  return {
    query: q,
    topic: opts.topic,
    hits: final,
    cases: final.filter((h) => h.item.kind === 'case'),
    policies: final.filter((h) => h.item.kind === 'policy'),
    noMatch,
    tookMs: performance.now() - t0,
  }
}

export async function relatedCases(item: CaseItem, limit = 3): Promise<CaseItem[]> {
  const res = await searchCases(item.title, { limit: limit + 1, excludeId: item.id })
  return res.hits.slice(0, limit).map((h) => h.item)
}
