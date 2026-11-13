import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CaseList } from '@/components/cases/CaseList'
import { BottomBar } from '@/components/layout/BottomBar'
import { BackLink, Band, Container, PageTitle } from '@/components/layout/Page'
import { applyFilters, DEFAULT_FILTERS, FilterBar, type SearchFilters } from '@/components/search/FilterBar'
import { SearchBox } from '@/components/search/SearchBox'
import { SummaryCard } from '@/components/search/SummaryCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { familyOf } from '@/config/families'
import { topicOf } from '@/config/topics'
import { useSession } from '@/context/SessionContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useAgencies } from '@/hooks/useData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGroups } from '@/hooks/useGroups'
import { matchGroup } from '@/services/groupService'
import { summarizeHits } from '@/services/insightService'
import { recommendAgencies, regionName } from '@/services/recommendationService'
import { searchCases } from '@/services/searchService'

type Tab = 'case' | 'policy'

export function SearchPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') ?? ''
  const topic = params.get('topic') ?? undefined
  const topicDef = topicOf(topic)
  const family = familyOf(params.get('family'))
  const { setLastQuery, markResolved, region } = useSession()
  const { toast } = useToast()
  const { data, loading, error } = useAsync(
    () =>
      q.trim() || topic || family
        ? searchCases(q, { topic, topics: family?.slugs, limit: family || (topic && !q) ? 60 : 30 })
        : Promise.resolve(null),
    [q, topic, family?.key],
  )
  const { data: agencies } = useAgencies()
  const { groups, joined, join, leave, create } = useGroups()
  const [tab, setTab] = useState<Tab>('case')
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [draftQuery, setDraftQuery] = useState(q)

  const scopeLabel = topicDef?.label ?? family?.label
  useDocumentTitle(q ? `'${q}' 비슷한 민원` : scopeLabel ? `${scopeLabel} 사례` : '민원 찾기')

  useEffect(() => {
    setDraftQuery(q)
    setFilters(DEFAULT_FILTERS)
    if (q) setLastQuery(q)
  }, [q, topic, family?.key, setLastQuery])

  useEffect(() => {
    if (data) setTab(data.cases.length === 0 && data.policies.length > 0 ? 'policy' : 'case')
  }, [data])

  const effectiveQuery = q || topicDef?.sample || family?.sample || ''

  const recommendation = useMemo(
    () => (data && agencies && data.hits.length > 0 ? recommendAgencies(data.hits, region, agencies, effectiveQuery) : null),
    [data, agencies, region, effectiveQuery],
  )
  const summary = useMemo(() => (data && data.hits.length > 0 ? summarizeHits(data.hits) : null), [data])

  const topTopics = useMemo(() => {
    const count = new Map<string, number>()
    for (const h of data?.hits.slice(0, 10) ?? []) for (const t of h.item.topics) count.set(t, (count.get(t) ?? 0) + 1)
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [data])

  // groups 가 바뀌면(참여/생성) 다시 계산하도록 의존성에 둡니다.
  const matched = useMemo(() => (effectiveQuery ? matchGroup(effectiveQuery, topTopics) : undefined), [effectiveQuery, topTopics, groups])
  const matchedJoined = matched ? joined.includes(matched.id) : false

  const hits = data ? (tab === 'case' ? data.cases : data.policies) : []
  const filtered = useMemo(() => applyFilters(hits, filters), [hits, filters])

  const onWrite = () => navigate(`/write?q=${encodeURIComponent(effectiveQuery)}`)
  const onResolved = () => {
    markResolved()
    toast('도움이 됐다니 다행이에요')
    navigate('/')
  }
  const onJoin = () => {
    if (matched) {
      if (matchedJoined) {
        leave(matched.id)
        toast('그룹에서 나왔어요')
      } else {
        join(matched.id)
        toast('같은 고민 그룹에 참여했어요')
      }
      return
    }
    const g = create({
      query: effectiveQuery,
      topic: topTopics[0] ?? topic ?? 'etc',
      region: region ? regionName(region) : undefined,
      agency: recommendation?.items[0]?.agency,
    })
    toast('같은 고민 그룹을 새로 만들었어요')
    navigate(`/groups/${g.id}`)
  }

  const groupLabel = matched
    ? matchedJoined
      ? `같은 고민을 가진 ${matched.members}명과 함께하는 중`
      : `같은 고민을 가진 ${matched.members}명 · 나도 같은 문제예요`
    : '같은 고민 그룹 만들기'

  const tabs: TabItem<Tab>[] = [
    { key: 'case', label: '민원 사례', count: data?.cases.length ?? 0 },
    { key: 'policy', label: '공식 안내', count: data?.policies.length ?? 0 },
  ]

  const showResults = !!data && !data.noMatch
  const total = data?.hits.length ?? 0

  let title: React.ReactNode
  if (loading) title = '비슷한 민원을 찾고 있어요'
  else if (error) title = '데이터를 불러오지 못했어요'
  else if (!data) title = '어떤 고민인지 알려주세요'
  else if (data.noMatch) title = '비슷한 민원을 찾지 못했어요'
  else if (scopeLabel && !q)
    title = (
      <>
        {scopeLabel} 사례 <span className="tnum text-compass">{total}건</span>
      </>
    )
  else
    title = (
      <>
        비슷한 민원 <span className="tnum text-compass">{total}건</span>을 찾았어요
      </>
    )

  return (
    <main id="main" className="pb-32 lg:pb-16">
      <Band tone="sky" inner="pb-8 pt-6 md:pb-10 md:pt-8">
        <BackLink to="/" label="처음으로" />
        <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center">
          <div className="min-w-0">
            <PageTitle className="md:text-[32px]">{title}</PageTitle>
            {q && <p className="mt-2 truncate text-[15px] text-ink-muted">“{q}”</p>}
          </div>
          <SearchBox
            value={draftQuery}
            onChange={setDraftQuery}
            onSubmit={() => draftQuery.trim() && navigate(`/search?q=${encodeURIComponent(draftQuery.trim())}`)}
          />
        </div>
      </Band>

      <Container className="mt-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-[20px]" />
            <div className="grid gap-4 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ) : error ? (
          <EmptyState title="데이터를 불러오지 못했어요" description={error.message} />
        ) : !data ? (
          <EmptyState title="검색어가 비어 있어요" description="겪고 있는 일을 평소 쓰는 말로 적어 주세요. 예: 집 앞 가로등이 고장 났어요" />
        ) : data.noMatch ? (
          <EmptyState
            title="비슷한 사례를 찾지 못했어요"
            description="다른 표현으로 다시 찾아보거나, 바로 민원을 써도 돼요. 처리기관은 입력한 내용으로 추천해 드려요."
            action={
              <Button variant="sun" size="lg" onClick={onWrite}>
                민원 쓰기
                <Icon name="arrow-right" size={16} />
              </Button>
            }
          />
        ) : (
          <>
            {summary && (
              <SummaryCard
                summary={summary}
                recommendation={recommendation}
                groupLabel={groupLabel}
                groupJoined={matchedJoined}
                onWrite={onWrite}
                onResolved={onResolved}
                onJoin={onJoin}
              />
            )}

            <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Tabs items={tabs} value={tab} onChange={setTab} aria-label="결과 구분" />
            </div>
            <div className="mt-4">
              <FilterBar value={filters} onChange={setFilters} />
            </div>

            <div className="mt-5">
              {filtered.length === 0 ? (
                <EmptyState
                  title="조건에 맞는 사례가 없어요"
                  description="필터를 바꾸거나 다른 탭을 확인해 보세요"
                  action={
                    <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                      필터 지우기
                    </Button>
                  }
                />
              ) : (
                <CaseList key={`${tab}-${q}-${topic}-${family?.key}`} items={filtered.map((h) => h.item)} />
              )}
            </div>
          </>
        )}
      </Container>

      {showResults && (
        <BottomBar desktop="hidden">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onResolved}>
            답을 찾았어요
          </Button>
          <Button variant="sun" size="lg" className="flex-[1.6]" onClick={onWrite}>
            민원 쓰기
          </Button>
        </BottomBar>
      )}
    </main>
  )
}
