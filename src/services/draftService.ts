import { toFormal, tokenize } from '@/lib/text'
import type { AgencyType, Draft, RegionChoice, RequiredField, SearchHit } from '@/types'
import { regionName } from './recommendationService'

/**
 * 필수 정보 점검·민원 초안.
 * 실제 서비스에서는 LLM API 가 초안을 작성하지만, 입력에 없는 사실을 지어내지 않도록
 * 모르는 정보는 [ ] 로 남기는 규칙은 동일합니다.
 */
export function requiredFields(type: AgencyType): RequiredField[] {
  switch (type) {
    case 'local':
      return [
        { key: 'location', label: '어디에서 일어난 일인가요?', hint: '도로명 주소나 가까운 건물·정류장 이름이면 충분해요', placeholder: '예: 서초구 반포대로 00 앞 인도', required: true },
        { key: 'when', label: '언제부터인가요?', hint: '담당 부서가 현장을 확인할 때 꼭 필요해요', placeholder: '예: 2026년 10월 말', required: true },
        { key: 'detail', label: '현장 상황을 조금 더 알려주세요', hint: '사진이 있다면 국민신문고 제출 때 첨부할 수 있어요', placeholder: '예: 밤 8시 이후 가로등 2개가 꺼져 있어요', required: false },
      ]
    case 'education':
      return [
        { key: 'school', label: '학교 이름을 알려주세요', hint: '문의하려는 학교를 알려주시면 내용을 구체적으로 작성할 수 있어요', placeholder: '예: OO초등학교', required: true },
        { key: 'grade', label: '관련 학년이나 대상', placeholder: '예: 초등 2학년', required: true },
        { key: 'when', label: '언제 기준인가요?', hint: '학기·연도에 따라 안내가 달라져요', placeholder: '예: 다음 학기(2027년 3월)', required: true },
        { key: 'detail', label: '덧붙일 내용', placeholder: '예: 맞벌이 가정이라 저녁 돌봄도 필요해요', required: false },
      ]
    default:
      return [
        { key: 'subject', label: '어떤 내용에 대해 문의하시나요?', hint: '궁금한 내용이나 도움이 필요한 일을 간단히 적어주세요', placeholder: '예: 서류 발급 방법, 신청 절차, 처리 결과 확인', required: true },
        { key: 'when', label: '언제 기준인가요?', hint: '신청하거나 적용받는 시점에 따라 안내가 달라져요', placeholder: '예: 2026년 12월', required: true },
        { key: 'status', label: '현재 어떤 상황인가요?', hint: '이미 진행한 일이나 겪고 있는 어려움이 있다면 적어주세요', placeholder: '예: 처음 신청하는 상황, 서류를 제출하고 답변을 기다리는 중', required: false },
      ]
  }
}

export interface DraftInput {
  query: string
  agency: string
  agencyType: AgencyType
  answers: Record<string, string>
  region: RegionChoice | null
}

function slot(value: string | undefined, label: string): string {
  const t = value?.trim()
  return t ? t : `[${label}]`
}

const ISSUE_RE = /(고장|파손|막혔|막힘|불편|위험|소음|단속|수리|설치|철거|개선|방치|안 해|않아|못하고|안 돼|심해|힘들)/

export function makeTitle(query: string): string {
  const words = tokenize(query)
  const core = words.slice(0, 6).join(' ') || query.replace(/[?!.]+$/g, '').slice(0, 30)
  return `${core} ${ISSUE_RE.test(query) ? '조치 요청' : '문의'}`
}

export function buildDraft(input: DraftInput): Draft {
  const a = input.answers
  const formal = toFormal(input.query)
  const when = slot(a.when, '시점')
  const detail = a.detail?.trim() ? ` ${toFormal(a.detail)}` : ''
  let intro = ''
  let situation = ''
  let request = ''

  switch (input.agencyType) {
    case 'local':
      intro = `${input.region ? regionName(input.region) : '[사는 지역]'}에 거주하는 주민입니다.`
      situation = `${when}부터 ${slot(a.location, '위치')}에서 다음과 같은 문제가 있습니다. ${formal}${detail}`
      request = '1. 현장을 확인하고 조치 계획과 예상 완료 시점을 알려주세요.\n2. 다른 부서 소관이면 이송 사실과 담당 부서를 알려주세요.'
      break
    case 'education':
      intro = `관련 학교: ${slot(a.school, '학교 이름')}\n관련 학년·대상: ${slot(a.grade, '학년·대상')}`
      situation = `${when} 기준으로 다음 내용을 알고 싶습니다. ${formal}${detail}`
      request = '1. 신청 시기와 방법, 필요한 서류를 알려주세요.\n2. 비용과 지원 대상 여부를 알려주세요.'
      break
    default:
      intro = `현재 상황: ${slot(a.status, '내 상황')}`
      situation = `다음 내용에 대해 문의드립니다: ${slot(a.subject, '문의 내용')}. ${formal} ${when} 기준으로 적용되는 규정과 절차를 알고 싶습니다.`
      request = '1. 적용되는 법령·고시와 절차를 근거와 함께 알려주세요.\n2. 담당 부서와 추가로 준비할 서류가 있으면 알려주세요.'
  }

  const body = `${intro}\n\n${situation}\n\n확인 후 답변 부탁드립니다.`
  return { title: makeTitle(input.query), body, request }
}

export function placeholdersIn(text: string): string[] {
  return [...text.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1])
}

export function draftToText(d: Draft): string {
  return `제목: ${d.title}\n\n${d.body}\n\n[요청사항]\n${d.request}`
}

const EXTRA_DOCS_RE = /(구체적|추가 자료|추가자료|증빙|사실관계|자료를 첨부|보완)/

/** 유사 민원 답변에서 담당자가 구체적 사실관계·추가 자료를 요구한 사례 */
export function extraDocsHint(hits: SearchHit[]): { count: number; examples: string[] } {
  const found = hits.slice(0, 20).filter((h) => EXTRA_DOCS_RE.test(h.item.answer))
  return { count: found.length, examples: found.slice(0, 2).map((h) => h.item.title) }
}
