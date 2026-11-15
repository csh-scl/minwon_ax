/** 기관 유형: 중앙행정기관(공공기관 포함) / 지방자치단체 / 교육청 */
export type AgencyType = 'central' | 'local' | 'education'

/** 질의응답 구분: 민원 사례 / 공식 안내(정책 질의응답·기관 FAQ) */
export type CaseKind = 'case' | 'policy'

export interface LawRef {
  name: string
  article: string
}

/** 국민신문고 질의응답 1건 (public/data/cases.json) */
export interface CaseItem {
  id: string
  title: string
  agency: string
  agencyType: AgencyType
  dept: string
  sido: string | null
  kind: CaseKind
  askedAt: string
  answeredAt: string
  views: number
  processingDays: number | null
  laws: LawRef[]
  summary: string
  answer: string
  topics: string[]
  ref: string
  /** 분야별 대표 사례면 그 분야 key (src/config/families.ts) */
  featured?: string
  /** 분야 안에서 보여 줄 순서 (1부터, 최근 답변이 앞) */
  featuredRank?: number
}

/** 기관별 통계 (public/data/agencies.json) */
export interface AgencyStat {
  name: string
  type: AgencyType
  count: number
  medianDays: number | null
  within14Pct: number | null
  expectedBusinessDays: number
  estimateSource: 'data' | 'mock'
  topDepts: string[]
  topLaws: string[]
  sido: string | null
  district: string | null
}

export interface Region {
  sido: string
  shortName: string
  educationOffice: string
  districts: string[]
}

export interface RegionChoice {
  sido: string
  district?: string
}

export interface DataMeta {
  sourceCount: number
  caseCount: number
  policyCount: number
  agencyCount: number
  topics: Record<string, { label: string; group: string }>
  builtAt: string
  source: string
}

/** 답변 최신성 */
export type Freshness = 'changed' | 'fresh' | 'check' | 'old'

export interface FreshnessInfo {
  level: Freshness
  label: string
  /** 답변일부터 지난 개월 수 */
  months: number
  /** 이 단계로 나눈 기준 한 줄 */
  criterion: string
}

export interface LawAmendment {
  name: string
  amendedAt: string
  summary: string
  link: string
}

export interface LawStatus {
  law: LawRef
  status: 'amended' | 'unchanged' | 'unknown'
  amendment?: LawAmendment
  link: string
}

export interface SearchHit {
  item: CaseItem
  score: number
  matched: string[]
}

export interface SearchResult {
  query: string
  topic?: string
  hits: SearchHit[]
  cases: SearchHit[]
  policies: SearchHit[]
  noMatch: boolean
  tookMs: number
}

export interface AgencyRecommendation {
  rank: 1 | 2 | 3
  agency: string
  type: AgencyType
  reason: string
  expectedBusinessDays: number
  estimateSource: 'data' | 'mock'
  evidence: CaseItem[]
  dept?: string
  placeholder?: boolean
}

export interface Recommendation {
  dominantType: AgencyType
  typeShares: Record<AgencyType, number>
  needsRegion: boolean
  items: AgencyRecommendation[]
}

export interface RequiredField {
  key: string
  label: string
  hint?: string
  placeholder: string
  required: boolean
}

export interface Draft {
  title: string
  body: string
  request: string
}

export type TrackStatus = 'processing' | 'extended' | 'transferred' | 'answered'

export interface TrackedComplaint {
  id: string
  title: string
  agency: string
  agencyType: AgencyType
  receivedAt: string
  status: TrackStatus
  transfers: number
  expectedBusinessDays: number
  note?: string
  groupId?: string
  createdAt: string
}

export interface TrackProgress {
  elapsedBusiness: number
  elapsedCalendar: number
  expected: number
  ratio: number
  overdue: boolean
  remaining: number
}

export interface ConcernGroup {
  id: string
  title: string
  description: string
  query: string
  topic: string
  region?: string
  agency?: string
  members: number
  submitted: number
  delayed: number
  threshold: number
  createdAt: string
}
