export type TopicGroup = 'housing' | 'life' | 'town' | 'safety' | 'business'

export interface TopicDef {
  slug: string
  label: string
  group: TopicGroup
  /** 주제 허브에서 검색창에 넣어 줄 예시 문장 */
  sample: string
}

/** scripts/build-data.py 의 TOPICS 와 slug 를 맞춰 둡니다. */
export const TOPICS: TopicDef[] = [
  { slug: 'housing-rent', label: '전월세·보증금', group: 'housing', sample: '전세보증금을 돌려받지 못하고 있어요' },
  { slug: 'housing-apt', label: '아파트 관리·층간소음', group: 'housing', sample: '아파트 층간소음 때문에 힘들어요' },
  { slug: 'housing-subscription', label: '청약·분양', group: 'housing', sample: '청약 당첨 후 계약 절차가 궁금해요' },
  { slug: 'housing-redevelop', label: '재개발·재건축', group: 'housing', sample: '우리 동네 재개발 진행 상황이 궁금해요' },
  { slug: 'housing-public', label: '공공임대·주거복지', group: 'housing', sample: '공공임대주택 신청 자격이 궁금해요' },
  { slug: 'building', label: '건축·용도변경', group: 'housing', sample: '건물 용도변경 절차가 궁금해요' },
  { slug: 'care', label: '돌봄·방과후', group: 'life', sample: '초등학생 아이 방과후 돌봄 신청은 어떻게 하나요' },
  { slug: 'school', label: '학교·교육', group: 'life', sample: '학교 급식 관련 문의가 있어요' },
  { slug: 'car', label: '자동차·검사', group: 'life', sample: '자동차 검사 주기가 궁금해요' },
  { slug: 'welfare', label: '복지·지원금', group: 'life', sample: '긴급복지 지원 대상이 궁금해요' },
  { slug: 'civil-defense', label: '민방위·병역', group: 'life', sample: '민방위 교육 유예 대상이 궁금해요' },
  { slug: 'documents', label: '증명서·등록', group: 'life', sample: '전입신고는 어떻게 하나요' },
  { slug: 'pets', label: '반려동물', group: 'life', sample: '반려동물 등록은 어디서 하나요' },
  { slug: 'energy', label: '전기·에너지', group: 'life', sample: '전기요금 감면 신청이 궁금해요' },
  { slug: 'streetlight', label: '가로등·보안등', group: 'town', sample: '집 앞 가로등이 고장 났어요' },
  { slug: 'road', label: '도로·보도', group: 'town', sample: '도로에 포트홀이 생겨 위험해요' },
  { slug: 'parking', label: '주차·불법주정차', group: 'town', sample: '골목 불법주정차 단속을 요청해요' },
  { slug: 'transit', label: '버스·대중교통', group: 'town', sample: '버스 노선 신설을 건의해요' },
  { slug: 'noise', label: '소음·공사', group: 'town', sample: '공사장 소음이 너무 심해요' },
  { slug: 'waste', label: '쓰레기·폐기물', group: 'town', sample: '쓰레기 무단투기를 신고하고 싶어요' },
  { slug: 'park', label: '공원·녹지', group: 'town', sample: '공원 시설 보수를 요청해요' },
  { slug: 'environment', label: '환경·대기', group: 'town', sample: '악취 민원을 넣고 싶어요' },
  { slug: 'fire', label: '소방·안전', group: 'safety', sample: '소방시설 설치 기준이 궁금해요' },
  { slug: 'import-food', label: '수입식품·식품', group: 'business', sample: '해외 식품을 수입해서 팔고 싶어요' },
  { slug: 'tax', label: '세금·부가세', group: 'business', sample: '사업자 부가세 신고 기한이 궁금해요' },
  { slug: 'business', label: '영업·인허가', group: 'business', sample: '영업 신고 절차가 궁금해요' },
  { slug: 'labor', label: '산업안전·노동', group: 'business', sample: '산업재해 신고 절차가 궁금해요' },
]

export const HOUSING_TOPICS = TOPICS.filter((t) => t.group === 'housing')

export function topicOf(slug: string | undefined | null): TopicDef | undefined {
  if (!slug) return undefined
  return TOPICS.find((t) => t.slug === slug)
}

export function topicLabel(slug: string): string {
  return topicOf(slug)?.label ?? slug
}
