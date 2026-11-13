import type { AgencyStat, CaseItem, DataMeta, Region } from '@/types'

/**
 * 데이터 저장소 계층.
 * 지금은 public/data/*.json 을 fetch 하지만, 실제 백엔드(FastAPI) 연동 시
 * 이 파일의 fetchJSON 대상만 API 엔드포인트로 바꾸면 됩니다.
 */
const BASE = import.meta.env.BASE_URL
const cache = new Map<string, Promise<unknown>>()

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}data/${path}`)
  if (!res.ok) throw new Error(`데이터를 불러오지 못했어요 (${path}: ${res.status})`)
  return (await res.json()) as T
}

function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  let p = cache.get(key) as Promise<T> | undefined
  if (!p) {
    p = loader().catch((e) => {
      cache.delete(key)
      throw e
    })
    cache.set(key, p)
  }
  return p
}

export const api = {
  getCases: (): Promise<CaseItem[]> => cached('cases', () => fetchJSON<CaseItem[]>('cases.json')),
  getAgencies: (): Promise<AgencyStat[]> => cached('agencies', () => fetchJSON<AgencyStat[]>('agencies.json')),
  getRegions: (): Promise<Region[]> => cached('regions', () => fetchJSON<Region[]>('regions.json')),
  getMeta: (): Promise<DataMeta> => cached('meta', () => fetchJSON<DataMeta>('meta.json')),

  async getCase(id: string): Promise<CaseItem | undefined> {
    const cases = await api.getCases()
    return cases.find((c) => c.id === id)
  },

  async getAgency(name: string): Promise<AgencyStat | undefined> {
    const agencies = await api.getAgencies()
    return agencies.find((a) => a.name === name)
  },

  async getCasesByTopic(slug: string, limit = 20): Promise<CaseItem[]> {
    const cases = await api.getCases()
    return cases
      .filter((c) => c.topics.includes(slug))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  },

  async countByTopicGroup(slugs: string[]): Promise<number> {
    const cases = await api.getCases()
    return cases.filter((c) => c.topics.some((t) => slugs.includes(t))).length
  },
}
