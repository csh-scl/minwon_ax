export type PopularIcon = 'lamp' | 'box' | 'doc' | 'home' | 'volume'

export interface PopularQuestion {
  text: string
  icon: PopularIcon
}

/** 첫 화면 "많이 찾는 고민" (목업 기준 + 주거 도메인 보강) */
export const POPULAR_QUESTIONS: PopularQuestion[] = [
  { text: '집 앞 가로등이 고장 났어요', icon: 'lamp' },
  { text: '해외 식품을 수입해서 팔고 싶어요', icon: 'box' },
  { text: '사업자 부가세 신고 기한이 궁금해요', icon: 'doc' },
  { text: '전세보증금을 돌려받지 못하고 있어요', icon: 'home' },
  { text: '아파트 층간소음 때문에 힘들어요', icon: 'volume' },
]

export const HERO_PLACEHOLDER = '초등학생 아이 방과후 돌봄 신청은 어떻게 하고 비용은 얼마인가요?'
