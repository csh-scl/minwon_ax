import { useMemo, useState } from 'react'
import { Band, Container, PageTitle } from '@/components/layout/Page'
import { DelayGuideSheet } from '@/components/track/DelayGuideSheet'
import { TrackCard } from '@/components/track/TrackCard'
import { TrackForm } from '@/components/track/TrackForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { useAgencies } from '@/hooks/useData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTracking } from '@/hooks/useTracking'
import { listGroups } from '@/services/groupService'
import { isActive, progressOf, summarizeTracked } from '@/services/trackingService'
import type { TrackedComplaint } from '@/types'

type Filter = 'all' | 'active' | 'overdue' | 'answered'

/** 내 민원: 목록이 주인공. 머리에는 상태 한 줄, 그 아래 탭으로 거르고, 오른쪽에는 기한 안내 하나만 둡니다. */
export function TrackPage() {
  const { items, add, update, remove } = useTracking()
  const { data: agencies } = useAgencies()
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TrackedComplaint | undefined>()
  const [guide, setGuide] = useState<'extension' | 'acrc' | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  useDocumentTitle('내 민원')

  const summary = summarizeTracked(items)
  const groups = useMemo(() => new Map(listGroups().map((g) => [g.id, g])), [])

  // 기간 초과 → 처리 중 → 답변 완료 순, 같은 묶음 안에서는 접수가 오래된 것부터
  const ordered = useMemo(() => {
    const rank = (t: TrackedComplaint) => (!isActive(t) ? 2 : progressOf(t).overdue ? 0 : 1)
    return [...items].sort((a, b) => rank(a) - rank(b) || a.receivedAt.localeCompare(b.receivedAt))
  }, [items])
  const visible = ordered.filter((t) =>
    filter === 'all' ? true : filter === 'answered' ? !isActive(t) : filter === 'overdue' ? isActive(t) && progressOf(t).overdue : isActive(t),
  )

  const tabs: TabItem<Filter>[] = [
    { key: 'all', label: '전체', count: items.length },
    { key: 'active', label: '처리 중', count: summary.active },
    { key: 'overdue', label: '기간 초과', count: summary.overdue },
    { key: 'answered', label: '답변 완료', count: summary.answered },
  ]

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const confirmRemove = (t: TrackedComplaint) => {
    if (window.confirm('추적 목록에서 삭제할까요?')) {
      remove(t.id)
      toast('삭제했어요')
    }
  }

  return (
    <main id="main" className="pb-32 lg:pb-16">
      <Band tone="peach" inner="pb-8 pt-8 md:pb-10 md:pt-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <PageTitle>
              {summary.overdue > 0 ? (
                <>
                  <span className="tnum text-signal">{summary.overdue}건</span>이 설정한 처리기간을 넘겼어요
                </>
              ) : summary.active > 0 ? (
                <>
                  처리 중인 민원이 <span className="tnum text-compass">{summary.active}건</span> 있어요
                </>
              ) : items.length > 0 ? (
                '처리 중인 민원이 없어요'
              ) : (
                '접수한 민원을 한곳에서 관리해요'
              )}
            </PageTitle>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted md:text-[16px]">
              {summary.overdue > 0
                ? '민원 카드에서 연장 통지 확인 방법과 고충민원 안내를 볼 수 있어요.'
                : '접수 정보를 등록하면 주말·공휴일을 제외한 경과 일수와 예상 완료일을 계산해 드려요. 처리 상태는 직접 업데이트해 주세요.'}
            </p>
          </div>
          <Button variant="sun" size="lg" onClick={openCreate} className="hidden lg:inline-flex">
            <Icon name="plus" size={18} />
            직접 등록하기
          </Button>
        </div>
      </Band>

      <Container className="mt-6 md:mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div className="min-w-0">
            {items.length > 0 && <Tabs items={tabs} value={filter} onChange={setFilter} aria-label="민원 상태" />}
            <div className="mt-5 space-y-4">
              {items.length === 0 ? (
                <EmptyState
                  title="등록한 민원이 없어요"
                  description="접수한 민원의 제목·처리기관·접수일을 등록해 관리해 보세요."
                  action={
                    <Button variant="sun" size="lg" onClick={openCreate}>
                      <Icon name="plus" size={16} />
                      직접 등록하기
                    </Button>
                  }
                />
              ) : visible.length === 0 ? (
                <EmptyState title="선택한 상태에 해당하는 민원이 없어요" />
              ) : (
                visible.map((t) => (
                  <TrackCard
                    key={t.id}
                    item={t}
                    group={t.groupId ? groups.get(t.groupId) : undefined}
                    onStatus={(status) => {
                      update(t.id, { status })
                      toast(status === 'answered' ? '답변 완료로 바꿨어요' : status === 'processing' ? '다시 처리 중으로 바꿨어요' : '상태를 바꿨어요')
                    }}
                    onTransferred={() => {
                      update(t.id, { status: 'transferred', transfers: t.transfers + 1 })
                      toast('이송 횟수를 1회 추가했어요')
                    }}
                    onEdit={() => {
                      setEditing(t)
                      setFormOpen(true)
                    }}
                    onRemove={() => confirmRemove(t)}
                    onGuide={setGuide}
                  />
                ))
              )}
            </div>
          </div>

          <aside className="self-start lg:sticky lg:top-24">
            <div className="rounded-card bg-surface-2 p-5">
              <h2 className="text-[16px] font-extrabold">처리기간 안내</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                이곳의 예상 완료일은 등록한 처리기간을 기준으로 계산해요. 실제 처리 예정일과 연장 여부는 국민신문고에서 확인하고, 변경된 내용은 민원 정보에 반영해 주세요.
              </p>
              <ul className="mt-3 divide-y divide-line/70 border-t border-line/70">
                <li>
                  <button type="button" onClick={() => setGuide('extension')} className="flex w-full items-center justify-between py-3 text-left text-[14px] font-bold hover:text-compass-deep">
                    연장 통지 확인하기
                    <Icon name="chevron-right" size={16} className="text-ink-faint" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setGuide('acrc')} className="flex w-full items-center justify-between py-3 text-left text-[14px] font-bold hover:text-compass-deep">
                    고충민원 알아보기
                    <Icon name="chevron-right" size={16} className="text-ink-faint" />
                  </button>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-surface/95 shadow-bar backdrop-blur lg:hidden">
        <div className="safe-bottom mx-auto w-full max-w-[1200px] px-4 pt-3">
          <Button variant="sun" size="lg" full onClick={openCreate}>
            <Icon name="plus" size={16} />
            직접 등록하기
          </Button>
        </div>
      </div>

      <TrackForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        agencies={agencies ?? []}
        onSave={(input) => {
          if (editing) {
            update(editing.id, input)
            toast('저장했어요')
          } else {
            add(input)
            toast('내 민원에 등록했어요')
          }
          setFormOpen(false)
        }}
      />
      <DelayGuideSheet kind={guide} onClose={() => setGuide(null)} />
    </main>
  )
}
