import { shortDept } from '@/lib/format'
import type { AgencyRecommendation, AgencyStat, AgencyType, CaseItem, Recommendation, RegionChoice, SearchHit } from '@/types'

/**
 * 처리기관 추천.
 * 1단계: 유사 민원 상위 20건으로 기관 유형(중앙/지자체/교육청) 판별
 * 2단계: 중앙이면 기관명을 유사도 가중 집계해 TOP3, 지자체·교육청이면 사용자 지역과 결합
 */
export const AGENCY_TYPE_LABEL: Record<AgencyType, string> = {
  central: '중앙행정기관',
  local: '지방자치단체',
  education: '교육청',
}

export const AGENCY_TYPE_SHORT: Record<AgencyType, string> = {
  central: '중앙',
  local: '지자체',
  education: '교육청',
}

const FALLBACK_DAYS: Record<AgencyType, number> = { central: 7, local: 7, education: 5 }

/**
 * 기관 유형 판별 보조 사전. 유사 민원 집계만으로 유형이 갈릴 때 질의의 단서를 반영합니다.
 * (기준 모델의 기관 유형 판별 정확도를 보완하는 규칙, 가중치 1.8배)
 */
const TYPE_HINTS: Record<AgencyType, RegExp> = {
  education: /(학교|초등|중학|고등|학생|교사|교육청|급식|돌봄교실|방과후|늘봄|유치원|학부모|통학|교실)/,
  local: /(가로등|보안등|도로|보도|인도|포트홀|주차|주정차|쓰레기|폐기물|공원|소음|공사장|버스|정류장|골목|동네|구청|시청|군청|하수|악취|가로수|제설|놀이터)/,
  central: /(세금|부가세|부가가치세|소득세|국세|수입|식품|검사주기|법령|법률|제도|보훈|병역|여권|특허|관세|통관|연금|의약품|건강기능식품)/,
}
const HINT_WEIGHT = 1.8

export function regionName(r: RegionChoice): string {
  return r.district ? `${r.sido} ${r.district}` : r.sido
}

function statOf(agencies: AgencyStat[], name: string): AgencyStat | undefined {
  return agencies.find((a) => a.name === name)
}

export function recommendAgencies(
  hits: SearchHit[],
  region: RegionChoice | null,
  agencies: AgencyStat[],
  query = '',
): Recommendation {
  const top = hits.slice(0, 20)
  const shares: Record<AgencyType, number> = { central: 0, local: 0, education: 0 }
  for (const h of top) shares[h.item.agencyType] += h.score
  for (const k of Object.keys(TYPE_HINTS) as AgencyType[]) {
    if (query && TYPE_HINTS[k].test(query)) shares[k] = (shares[k] || 0.05) * HINT_WEIGHT
  }
  let total = 0
  for (const k of Object.keys(shares) as AgencyType[]) total += shares[k]
  if (total > 0) {
    for (const k of Object.keys(shares) as AgencyType[]) shares[k] = shares[k] / total
  }
  let dominant: AgencyType = 'local'
  if (total > 0) {
    dominant = (Object.keys(shares) as AgencyType[]).reduce((a, b) => (shares[b] > shares[a] ? b : a))
  }
  const needsRegion = dominant !== 'central'

  const byAgency = new Map<string, { weight: number; items: CaseItem[] }>()
  for (const h of top) {
    const cur = byAgency.get(h.item.agency) ?? { weight: 0, items: [] }
    cur.weight += h.score
    cur.items.push(h.item)
    byAgency.set(h.item.agency, cur)
  }
  const ranked = [...byAgency.entries()].sort((a, b) => b[1].weight - a[1].weight)
  const centrals = ranked.filter(([, v]) => v.items[0]?.agencyType === 'central')
  const localEvidence = top.filter((h) => h.item.agencyType === 'local').map((h) => h.item).slice(0, 3)
  const eduEvidence = top.filter((h) => h.item.agencyType === 'education').map((h) => h.item).slice(0, 3)

  const items: AgencyRecommendation[] = []
  const make = (
    agency: string,
    type: AgencyType,
    reason: string,
    evidence: CaseItem[],
    placeholder = false,
  ): AgencyRecommendation => {
    const stat = statOf(agencies, agency)
    const rank = (items.length + 1) as 1 | 2 | 3
    return {
      rank,
      agency,
      type,
      reason,
      expectedBusinessDays: stat?.expectedBusinessDays ?? FALLBACK_DAYS[type],
      estimateSource: stat?.estimateSource ?? 'mock',
      evidence,
      dept: stat?.topDepts[0] ? shortDept(stat.topDepts[0], agency) : undefined,
      placeholder,
    }
  }

  const push = (rec: AgencyRecommendation) => {
    if (items.length >= 3 || items.some((i) => i.agency === rec.agency)) return
    items.push({ ...rec, rank: (items.length + 1) as 1 | 2 | 3 })
  }

  if (dominant === 'central') {
    for (const [name, v] of centrals.slice(0, 3)) {
      push(make(name, 'central', `비슷한 민원 ${v.items.length}건을 이 기관이 답변했어요`, v.items.slice(0, 3)))
    }
    if (region) push(make(regionName(region), 'local', '현장 조치가 필요한 생활 민원이라면 사는 지역이 처리해요', localEvidence))
    push(make('행정안전부', 'central', '어느 기관 소관인지 분명하지 않을 때 이송을 맡아요', []))
  } else if (dominant === 'local') {
    push(
      make(
        region ? regionName(region) : '사는 지역의 시·군·구',
        'local',
        '생활 민원은 사는 곳의 시·군·구가 직접 처리해요',
        localEvidence,
        !region,
      ),
    )
    push(
      make(
        region ? region.sido : '사는 지역의 시·도',
        'local',
        '시·도 전체 정책이나 광역 사업을 물을 때',
        [],
        !region,
      ),
    )
    const c = centrals[0]
    if (c) push(make(c[0], 'central', '제도 전반이나 법령 해석을 물을 때', c[1].items.slice(0, 3)))
    push(make('행정안전부', 'central', '지방행정 제도 전반을 물을 때', []))
  } else {
    push(
      make(
        region ? `${region.sido}교육청` : '사는 지역의 시·도교육청',
        'education',
        '학교 운영과 돌봄은 시·도교육청이 처리해요',
        eduEvidence,
        !region,
      ),
    )
    const edu = centrals.find(([name]) => name === '교육부')
    push(make('교육부', 'central', '제도 전반을 물을 때', edu ? edu[1].items.slice(0, 3) : []))
    push(
      make(
        region ? regionName(region) : '사는 지역의 시·군·구',
        'local',
        '지역 돌봄센터나 시설을 물을 때',
        localEvidence,
        !region,
      ),
    )
  }

  return { dominantType: dominant, typeShares: shares, needsRegion, items: items.slice(0, 3) }
}
