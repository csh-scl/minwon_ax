import type { LawAmendment } from '@/types'

/**
 * [Mock] 답변 이후 개정된 법령 목록.
 * 실제 서비스에서는 법제처 국가법령정보 공동활용 Open API 로 답변일 이후 개정 여부를 조회합니다.
 * name 은 데이터의 법령명과 정확히 일치해야 합니다(가운뎃점 'ㆍ' 포함).
 */
export const LAW_AMENDMENTS: LawAmendment[] = [
  { name: '도로교통법', amendedAt: '2025-10-17', summary: '개인형 이동장치 안전기준과 보행자 보호 의무가 강화됐어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=도로교통법' },
  { name: '공동주택관리법', amendedAt: '2026-01-01', summary: '층간소음 분쟁 조정 절차와 관리주체의 의무가 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=공동주택관리법' },
  { name: '주택임대차보호법', amendedAt: '2025-07-31', summary: '임차인 보증금 보호와 계약갱신 관련 조항이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=주택임대차보호법' },
  { name: '소득세법', amendedAt: '2026-01-01', summary: '2026년 세법 개정으로 세율 구간과 공제 항목이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=소득세법' },
  { name: '부가가치세법', amendedAt: '2026-01-01', summary: '간이과세 기준과 신고 절차가 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=부가가치세법' },
  { name: '자동차관리법 시행규칙', amendedAt: '2026-03-01', summary: '정기검사 유효기간과 검사 항목이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=자동차관리법 시행규칙' },
  { name: '초ㆍ중등교육법', amendedAt: '2025-09-01', summary: '늘봄학교 운영 근거가 새로 생겼어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=초중등교육법' },
  { name: '수입식품안전관리 특별법', amendedAt: '2025-12-01', summary: '해외직구 식품 신고 절차가 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=수입식품안전관리 특별법' },
  { name: '폐기물관리법', amendedAt: '2025-11-28', summary: '생활폐기물 배출·수거 체계가 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=폐기물관리법' },
  { name: '도시공원 및 녹지 등에 관한 법률', amendedAt: '2026-02-15', summary: '공원시설 설치·관리 기준이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=도시공원 및 녹지 등에 관한 법률' },
  { name: '민원 처리에 관한 법률', amendedAt: '2025-11-01', summary: '처리기간 연장 통지와 이송 절차가 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=민원 처리에 관한 법률' },
  { name: '전세사기피해자 지원 및 주거안정에 관한 특별법', amendedAt: '2025-12-30', summary: '피해자 인정 요건과 지원 범위가 넓어졌어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=전세사기피해자 지원 및 주거안정에 관한 특별법' },
  { name: '주차장법', amendedAt: '2026-01-20', summary: '주차장 설치 기준과 과태료 조항이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=주차장법' },
  { name: '건축법', amendedAt: '2025-12-15', summary: '용도변경 절차와 안전 기준이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=건축법' },
  { name: '소방시설 설치 및 관리에 관한 법률', amendedAt: '2026-02-01', summary: '소방시설 자체점검 기준이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=소방시설 설치 및 관리에 관한 법률' },
  { name: '도로법', amendedAt: '2026-03-20', summary: '도로 점용과 유지관리 책임 조항이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=도로법' },
  { name: '여객자동차 운수사업법', amendedAt: '2025-12-05', summary: '노선 조정과 운행 기준이 바뀌었어요.', link: 'https://www.law.go.kr/lsSc.do?menuId=1&query=여객자동차 운수사업법' },
]
