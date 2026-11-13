import { Link } from 'react-router-dom'
import { CompassMark } from '@/components/brand/CompassMark'
import { useMeta } from '@/hooks/useData'
import { formatDate } from '@/lib/format'

/**
 * 기관형 푸터. 상상대로 서울식 노란 바로가기 띠 아래에
 * 데이터 출처·기준일, 이용 안내(법적 효력), 개인정보·접근성, 공식 누리집 아님을 분명히 적습니다.
 */
export function Footer() {
  const { data: meta } = useMeta()
  const n = (v?: number) => (v == null ? '—' : v.toLocaleString('ko-KR'))
  const ext = 'hover:text-compass'
  return (
    <footer className="mt-16">
      <div className="bg-sun-tint/70">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap gap-x-6 gap-y-2 px-4 py-4 text-[14px] font-bold md:px-6">
          <Link to="/" className={ext}>민원 찾기</Link>
          <Link to="/track" className={ext}>내 민원</Link>
          <Link to="/groups" className={ext}>같은 고민</Link>
          <a href="https://www.epeople.go.kr" target="_blank" rel="noreferrer noopener" className={ext}>국민신문고</a>
          <a href="https://www.gov.kr" target="_blank" rel="noreferrer noopener" className={ext}>정부24</a>
          <a href="https://www.law.go.kr" target="_blank" rel="noreferrer noopener" className={ext}>국가법령정보센터</a>
        </div>
      </div>
      <div className="border-t border-line bg-paper">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6">
          <div className="grid gap-8 text-[13px] leading-relaxed text-ink-muted md:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))] md:gap-10">
            <div>
              <div className="flex items-center gap-2.5">
                <CompassMark size={30} />
                <p className="text-[16px] font-extrabold text-ink">민원나침반</p>
              </div>
              <p className="mt-3 max-w-xs">비슷한 민원의 답변을 찾고, 처리기관에 보낼 초안을 작성하고, 접수한 민원을 관리하도록 돕는 서비스예요.</p>
            </div>
            <div>
              <h3 className="text-[13px] font-extrabold text-ink">데이터</h3>
              <p className="mt-2">{meta?.source ?? '국민권익위원회 국민신문고 민원질의응답 원문데이터(공공데이터포털)'}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                <dt>기준일</dt>
                <dd className="tnum text-ink">{meta?.builtAt ? formatDate(meta.builtAt) : '—'}</dd>
                <dt>분석 답변</dt>
                <dd className="tnum text-ink">{n(meta?.sourceCount)}건</dd>
                <dt>안내 사례</dt>
                <dd className="tnum text-ink">{n(meta?.caseCount)}건 · 기관 {n(meta?.agencyCount)}곳</dd>
              </dl>
            </div>
            <div>
              <h3 className="text-[13px] font-extrabold text-ink">이용 안내</h3>
              <p className="mt-2">이 서비스의 안내는 공개된 답변 사례를 집계한 참고 정보이며 법적 효력이 없어요. 최종 판단은 담당기관의 답변에 따라요.</p>
              <p className="mt-2">예상 처리기간, 법령 개정 정보, 같은 고민 참여 현황은 시연용 정보예요. 실제 처리 상황이나 최신 정보와 다를 수 있어요.</p>
            </div>
            <div>
              <h3 className="text-[13px] font-extrabold text-ink">개인정보·접근성</h3>
              <p className="mt-2">입력한 고민과 내 민원 기록은 서버로 보내지 않고 이 브라우저에만 저장돼요. 삭제하면 바로 사라져요.</p>
              <p className="mt-2">키보드만으로도 쓸 수 있게 만들고 있고, 범정부 디자인 시스템(KRDS)의 접근성 지침을 기준으로 삼아요.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-1.5 border-t border-line pt-5 text-[12.5px] text-ink-faint md:flex-row md:items-center md:justify-between">
            <p>정부 공식 누리집이 아니며, 공공데이터를 활용해 만든 시민 제안 서비스예요.</p>
            <p>© 2026 민원나침반</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
