import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CompassDial } from '@/components/brand/CompassDial'
import { BackLink, Band, Container } from '@/components/layout/Page'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { DraftStep } from '@/components/write/DraftStep'
import { RecommendationStep } from '@/components/write/RecommendationStep'
import { RegionPicker } from '@/components/write/RegionPicker'
import { RegisterTrackingSheet, type TrackDefaults } from '@/components/write/RegisterTrackingSheet'
import { RequiredInfoStep } from '@/components/write/RequiredInfoStep'
import { Stepper } from '@/components/write/Stepper'
import { useSession } from '@/context/SessionContext'
import { useToast } from '@/context/ToastContext'
import { useAgencies, useRegions, useSearch } from '@/hooks/useData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buildDraft, extraDocsHint, requiredFields } from '@/services/draftService'
import { isJoined, matchGroup } from '@/services/groupService'
import { AGENCY_TYPE_LABEL, recommendAgencies, regionName } from '@/services/recommendationService'
import { addTracked } from '@/services/trackingService'
import type { Draft } from '@/types'

type Step = 1 | 2 | 3

export function WritePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { lastQuery, region, setRegion, setLastQuery } = useSession()
  const { toast } = useToast()
  const q = (params.get('q') ?? lastQuery).trim()

  const { data: search, loading } = useSearch(q)
  const { data: agencies } = useAgencies()
  const { data: regions } = useRegions()

  const [step, setStep] = useState<Step>(1)
  const [selectedRank, setSelectedRank] = useState<1 | 2 | 3>(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<Draft | null>(null)
  const [regionOpen, setRegionOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  useDocumentTitle('민원 쓰기')

  useEffect(() => {
    if (q && q !== lastQuery) setLastQuery(q)
  }, [q, lastQuery, setLastQuery])

  const recommendation = useMemo(
    () => (search && agencies ? recommendAgencies(search.hits, region, agencies, q) : null),
    [search, agencies, region],
  )
  const selected = recommendation?.items.find((i) => i.rank === selectedRank) ?? recommendation?.items[0]
  const fields = useMemo(() => (selected ? requiredFields(selected.type) : []), [selected])
  const extraDocs = useMemo(() => extraDocsHint(search?.hits ?? []), [search])

  const makeDraft = () => {
    if (!selected) return
    setDraft(buildDraft({ query: q, agency: selected.agency, agencyType: selected.type, answers, region }))
  }

  const trackDefaults = useMemo<TrackDefaults | null>(() => {
    if (!selected || !draft) return null
    const topics = search?.hits.slice(0, 10).flatMap((h) => h.item.topics) ?? []
    const g = matchGroup(q, topics)
    return {
      title: draft.title,
      agency: selected.agency,
      agencyType: selected.type,
      expectedBusinessDays: selected.expectedBusinessDays,
      groupId: g && isJoined(g.id) ? g.id : undefined,
    }
  }, [selected, draft, q, search])

  if (!q) {
    return (
      <Container className="pt-8">
        <EmptyState
          title="먼저 어떤 일인지 알려주세요"
          description="문의 내용을 입력하면 비슷한 답변을 찾아드려요. 추가로 문의할 내용이 있으면 처리기관에 보낼 민원 초안을 만들 수 있어요."
          action={
            <Link to="/" className="font-bold text-compass">
              처음으로
            </Link>
          }
        />
      </Container>
    )
  }

  return (
    <main id="main" className="pb-16">
      <Band tone="mint" inner="pb-6 pt-6 md:pb-8 md:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink to={`/search?q=${encodeURIComponent(q)}`} label="검색 결과로" />
          <p className="text-[13px] font-bold text-ink-muted">민원 쓰기</p>
        </div>
        <div className="mt-4 max-w-xl">
          <Stepper current={step} onJump={(s) => setStep(s)} />
        </div>
      </Band>

      <Container className="mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div className="min-w-0">
            {loading || !recommendation || !selected ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : step === 1 ? (
              <RecommendationStep
                recommendation={recommendation}
                selectedRank={selectedRank}
                onSelect={setSelectedRank}
                region={region}
                onChangeRegion={() => setRegionOpen(true)}
                onNext={() => setStep(2)}
              />
            ) : step === 2 ? (
              <RequiredInfoStep
                agency={selected.agency}
                type={selected.type}
                fields={fields}
                answers={answers}
                onChange={(k, v) => setAnswers((a) => ({ ...a, [k]: v }))}
                extraDocs={extraDocs}
                onBack={() => setStep(1)}
                onNext={() => {
                  makeDraft()
                  setStep(3)
                }}
              />
            ) : draft ? (
              <DraftStep
                draft={draft}
                onChange={setDraft}
                agency={selected.agency}
                expectedDays={selected.expectedBusinessDays}
                onBack={() => setStep(2)}
                onRegenerate={() => {
                  makeDraft()
                  toast('입력한 정보로 초안을 다시 만들었어요')
                }}
                onRegister={() => setRegisterOpen(true)}
              />
            ) : null}
          </div>

          <aside className="hidden space-y-4 self-start lg:sticky lg:top-24 lg:block">
            <div className="rounded-card bg-surface-2 p-5">
              <p className="text-[12.5px] font-bold text-ink-muted">내 고민</p>
              <p className="mt-1 text-[15.5px] font-bold leading-snug">{q}</p>
              {recommendation && (
                <div className="mt-4 flex items-center gap-4">
                  <CompassDial shares={recommendation.typeShares} dominant={recommendation.dominantType} size={88} showPct={false} />
                  <dl className="min-w-0 flex-1 space-y-1.5 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">추천 기관 유형</dt>
                      <dd className="text-right font-bold">{AGENCY_TYPE_LABEL[recommendation.dominantType]}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">처리기관</dt>
                      <dd className="truncate text-right font-bold">{selected && !selected.placeholder ? selected.agency : '확인 중'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">예상 기간</dt>
                      <dd className="tnum text-right font-bold">{selected && !selected.placeholder ? `${selected.expectedBusinessDays}영업일` : '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">사는 지역</dt>
                      <dd className="text-right font-bold">
                        {region ? (
                          <button type="button" className="hover:text-compass" onClick={() => setRegionOpen(true)}>
                            {regionName(region)}
                          </button>
                        ) : (
                          <button type="button" className="text-compass" onClick={() => setRegionOpen(true)}>
                            선택하기
                          </button>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
            <div className="rounded-card bg-sun-tint p-5 text-[13.5px] leading-relaxed text-ink-muted">
              <p className="font-extrabold text-ink">초안은 이렇게 만들어요</p>
              <p className="mt-1">입력한 내용을 바탕으로 초안을 만들고, 필요한 정보가 없으면 [ ]로 표시해요. 제출 전에 빈칸을 채우고 전체 내용을 확인해 주세요.</p>
            </div>
          </aside>
        </div>
      </Container>

      {regions && <RegionPicker open={regionOpen} onClose={() => setRegionOpen(false)} regions={regions} value={region} onChange={setRegion} />}
      {trackDefaults && (
        <RegisterTrackingSheet
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          defaults={trackDefaults}
          agencyNames={(agencies ?? []).slice(0, 300).map((a) => a.name)}
          onSave={(input) => {
            addTracked(input)
            setRegisterOpen(false)
            toast('내 민원에 등록했어요')
            navigate('/track')
          }}
        />
      )}
    </main>
  )
}
