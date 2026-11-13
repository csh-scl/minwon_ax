import type { IconName } from '@/components/ui/Icon'

export type FamilyTone = 'sky' | 'mint' | 'peach' | 'sun' | 'violet' | 'rose' | 'teal' | 'slate'

/** 첫 화면 '분야별 찾기' 타일. 여러 주제(slug)를 묶은 큰 갈래입니다. */
export interface TopicFamily {
  key: string
  label: string
  icon: IconName
  tone: FamilyTone
  slugs: string[]
  sample: string
}

export const FAMILIES: TopicFamily[] = [
  { key: 'all', label: '전체', icon: 'grid', tone: 'slate', slugs: [], sample: '' },
  {
    key: 'housing',
    label: '주거',
    icon: 'home',
    tone: 'sky',
    slugs: ['housing-rent', 'housing-apt', 'housing-subscription', 'housing-redevelop', 'housing-public', 'building'],
    sample: '전세보증금을 돌려받지 못하고 있어요',
  },
  { key: 'traffic', label: '교통·주차', icon: 'bus', tone: 'teal', slugs: ['road', 'parking', 'transit', 'car'], sample: '골목 불법주정차 단속을 요청해요' },
  { key: 'care', label: '돌봄·교육', icon: 'school', tone: 'peach', slugs: ['care', 'school'], sample: '초등학생 아이 방과후 돌봄 신청은 어떻게 하나요' },
  { key: 'env', label: '환경·소음', icon: 'leaf', tone: 'mint', slugs: ['noise', 'waste', 'environment'], sample: '공사장 소음이 너무 심해요' },
  { key: 'town', label: '동네 시설', icon: 'lamp', tone: 'sun', slugs: ['streetlight', 'park'], sample: '집 앞 가로등이 고장 났어요' },
  { key: 'safety', label: '안전·소방', icon: 'shield', tone: 'rose', slugs: ['fire', 'labor'], sample: '소방시설 설치 기준이 궁금해요' },
  { key: 'biz', label: '세금·사업', icon: 'coin', tone: 'violet', slugs: ['tax', 'business', 'import-food'], sample: '사업자 부가세 신고 기한이 궁금해요' },
  { key: 'welfare', label: '복지·증명', icon: 'heart', tone: 'peach', slugs: ['welfare', 'documents', 'civil-defense', 'energy'], sample: '긴급복지 지원 대상이 궁금해요' },
  { key: 'pets', label: '반려동물', icon: 'paw', tone: 'mint', slugs: ['pets'], sample: '반려동물 등록은 어디서 하나요' },
]

export function familyOf(key: string | undefined | null): TopicFamily | undefined {
  if (!key) return undefined
  return FAMILIES.find((f) => f.key === key)
}

/** 주제 slug 가 속한 갈래 */
export function familyOfTopic(slug: string): TopicFamily | undefined {
  return FAMILIES.find((f) => f.slugs.includes(slug))
}

export const TONE_TILE: Record<FamilyTone, string> = {
  sky: 'bg-compass-tint text-compass',
  mint: 'bg-mint-tint text-mint',
  peach: 'bg-peach-tint text-peach',
  sun: 'bg-sun-tint text-amber',
  violet: 'bg-violet-tint text-violet',
  rose: 'bg-rose-tint text-rose',
  teal: 'bg-teal-tint text-teal',
  slate: 'bg-slate-tint text-slate',
}
