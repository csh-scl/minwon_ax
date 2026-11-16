/** 기관 유형: 중앙행정기관(공공기관 포함) / 지방자치단체 / 교육청 */
export type AgencyType = 'central' | 'local' | 'education'

/** 질의응답 구분: 민원 사례 / 공식 안내(정책 질의응답·기관 FAQ) */
export type CaseKind = 'case' | 'policy'

export interface LawRef {
  name: string
  article: string
  /** 답변일 이후 바뀐 날 (법제처 조회 기준). 없으면 바뀌지 않았거나 확인할 수 없음 */
  changedAt?: string
  /** article: 인용한 조문이 개정됨 / law: 법령은 개정됐지만 그 조문이 바뀌었는지는 확인하지 못함 */
  changeScope?: 'article' | 'law'
  /** 국가법령정보센터 본문 주소. 없으면 법령명 검색으로 연결 */
  link?: string
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
  featuredCount?: number
  /** 원본 답변일 범위 */
  answeredFrom?: string
  answeredTo?: string
  /** 법령 개정 여부를 법제처에서 확인한 날 */
  lawCheckedAt?: string
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
  /** amended: 인용 조문 개정 / lawAmended: 법령만 개정 확인(조문은 미확인) */
  status: 'amended' | 'lawAmended' | 'unchanged'
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
  /** 대표자가 공동민원을 국민신문고에 제출한 기록. 있으면 '제출됨(처리 중)' 단계예요. */
  filed?: { at: string; receiptNo: string }
}
