import { Link, useNavigate, useParams } from 'react-router-dom'
import { CaseTile } from '@/components/cases/CaseTile'
import { FreshnessBadge } from '@/components/cases/FreshnessBadge'
import { FreshnessTimeline } from '@/components/cases/FreshnessTimeline'
import { LawChangeNotice } from '@/components/cases/LawChangeNotice'
import { LawChips } from '@/components/cases/LawChips'
import { BottomBar } from '@/components/layout/BottomBar'
import { BackLink, Band, Container, PageTitle, SectionHead } from '@/components/layout/Page'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSession } from '@/context/SessionContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useCase } from '@/hooks/useData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, shortDept } from '@/lib/format'
import { AGENCY_TYPE_LABEL, AGENCY_TYPE_SHORT } from '@/services/recommendationService'
import { relatedCases } from '@/services/searchService'
import type { AgencyType } from '@/types'

/** 국민신문고 '민원 사례 검색'. 사례 상세는 주소로 바로 열 수 없어 검색 화면으로 보냅니다. */
const EPEOPLE_CASE_SEARCH = 'https://www.epeople.go.kr/nep/pttn/gnrlPttn/pttnSmlrCaseList.npaid'

const TYPE_BADGE: Record<AgencyType, 'compass' | 'mint' | 'peach'> = { central: 'compass', local: 'mint', education: 'peach' }

export function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: item, loading } = useCase(id)
  const { lastQuery, markResolved } = useSession()
  const { toast } = useToast()
  const related = useAsync(() => (item ? relatedCases(item, 3) : Promise.resolve([])), [item?.id])
  useDocumentTitle(item?.title)

  const backTo = lastQuery ? `/search?q=${encodeURIComponent(lastQuery)}` : '/'

  if (loading) {
    return (
      <Container className="pt-8">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-6 h-9 w-3/4" />
        <Skeleton className="mt-6 h-40 w-full" />
      </Container>
    )
  }
  if (!item) {
    return (
      <Container className="pt-8">
        <EmptyState title="사례를 찾을 수 없어요" description="주소를 확인하거나 민원 찾기에서 다시 검색해 주세요." action={<Link to="/" className="font-bold text-compass">처음으로</Link>} />
      </Container>
    )
  }

  const onResolved = () => {
    markResolved()
    toast('도움이 됐다니 다행이에요')
    navigate('/')
  }
  const writeQuery = lastQuery || item.title

  const meta = [
    { label: '처리기관', value: item.agency },
    { label: '담당부서', value: shortDept(item.dept, item.agency) || '—' },
    { label: '답변일', value: formatDate(item.answeredAt), num: true },
    { label: '답변까지 걸린 기간', value: item.kind === 'policy' ? '안내 자료' : item.processingDays != null ? (item.processingDays <= 0 ? '당일 답변' : `${item.processingDays}일`) : '—', num: true },
  ]

  return (
    <main id="main" className="pb-32 lg:pb-16">
      <Band tone="sky" inner="pb-8 pt-6 md:pb-10 md:pt-8">
        <BackLink to={backTo} label={lastQuery ? '검색 결과로' : '처음으로'} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone={TYPE_BADGE[item.agencyType]} size="md">{AGENCY_TYPE_SHORT[item.agencyType]}</Badge>
          <Badge tone={item.kind === 'policy' ? 'sun' : 'white'} size="md">{item.kind === 'policy' ? '공식 안내' : '민원 사례'}</Badge>
          <FreshnessBadge item={item} size="md" />
          <span className="text-[13px] text-ink-muted">{AGENCY_TYPE_LABEL[item.agencyType]}</span>
        </div>
        <PageTitle className="mt-3 max-w-[52rem] text-[26px] md:text-[34px]">{item.title}</PageTitle>
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label} className="rounded-2xl bg-surface px-4 py-3.5 shadow-card">
              <dt className="text-[12.5px] font-bold text-ink-muted">{m.label}</dt>
              <dd className={`mt-1 truncate text-[15px] font-extrabold ${m.num ? 'tnum' : ''}`}>{m.value}</dd>
            </div>
          ))}
        </dl>
      </Band>

      <Container className="mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <section>
              <h2 className="text-[18px] font-extrabold">답변 내용</h2>
              <p className="mt-1 text-[13px] text-ink-faint">국민신문고에 공개된 답변 원문이에요</p>
              <div className="mt-3 whitespace-pre-line rounded-card bg-surface-2 p-5 text-[15.5px] leading-7 md:p-7">{item.answer}</div>
            </section>

            {item.laws.length > 0 && (
              <section className="mt-8">
                <h2 className="text-[18px] font-extrabold">답변에 인용된 법령</h2>
                <p className="mt-1 text-[13px] text-ink-faint">법령을 누르면 국가법령정보센터에서 원문을 볼 수 있어요</p>
                <div className="mt-3">
                  <LawChips item={item} max={12} showArticle />
                </div>
                <div className="mt-3 empty:hidden">
                  <LawChangeNotice item={item} detailed />
                </div>
              </section>
            )}

            <p className="mt-8 text-[12.5px] leading-relaxed text-ink-faint">
              출처: 국민권익위원회 국민신문고 공개 질의응답 원문데이터
              {/^\d?[A-Z]{2,3}-/.test(item.ref) ? (
                <>
                  {' '}
                  (처리번호 <span className="tnum break-all">{item.ref}</span>)
                </>
              ) : null}
              . 답변 당시 기준이라 이후 제도가 바뀌었을 수 있어요.{' '}
              <a
                href={EPEOPLE_CASE_SEARCH}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => {
                  navigator.clipboard?.writeText(item.title).then(
                    () => toast('제목을 복사했어요. 국민신문고 검색창에 붙여 넣어 찾아보세요'),
                    () => undefined,
                  )
                }}
                className="font-bold text-compass hover:underline"
              >
                국민신문고 민원 사례 검색에서 찾기
              </a>
            </p>
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-24">
            <FreshnessTimeline item={item} />
            <div className="hidden rounded-card bg-sun-tint p-5 lg:block">
              <p className="text-[15px] font-extrabold">이 답으로 해결되지 않았다면</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">문의 내용을 바탕으로 처리기관에 보낼 민원 초안을 만들어 드려요.</p>
              <Button variant="sun" full size="lg" className="mt-4" onClick={() => navigate(`/write?q=${encodeURIComponent(writeQuery)}`)}>
                이 내용으로 민원 쓰기
                <Icon name="arrow-right" size={16} />
              </Button>
              <Button variant="white" full className="mt-2" onClick={onResolved}>
                답을 찾았어요
              </Button>
            </div>
          </aside>
        </div>

        {related.data && related.data.length > 0 && (
          <section className="mt-14">
            <SectionHead sub="제목이나 내용이 비슷한 다른 민원 사례예요.">비슷한 사례</SectionHead>
            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              {related.data.map((c) => (
                <CaseTile key={c.id} item={c} />
              ))}
            </div>
          </section>
        )}
      </Container>

      <BottomBar desktop="hidden">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onResolved}>
          답을 찾았어요
        </Button>
        <Button variant="sun" size="lg" className="flex-[1.6]" onClick={() => navigate(`/write?q=${encodeURIComponent(writeQuery)}`)}>
          이 내용으로 민원 쓰기
        </Button>
      </BottomBar>
    </main>
  )
}
