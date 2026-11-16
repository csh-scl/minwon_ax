import { useState } from 'react'
import { GroupRow } from '@/components/groups/GroupRow'
import { Band, Container, PageTitle } from '@/components/layout/Page'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGroups } from '@/hooks/useGroups'

type Filter = 'all' | 'open' | 'ready' | 'filed' | 'mine'

/** 같은 고민: 그룹 목록이 주인공. 머리는 제목과 한 문장, 그 아래 탭으로 거릅니다. */
export function GroupsPage() {
  const { groups, joined, join, leave } = useGroups()
  const { toast } = useToast()
  const [filter, setFilter] = useState<Filter>('all')
  useDocumentTitle('같은 고민')

  const sorted = [...groups].sort((a, b) => b.members - a.members)
  const open = sorted.filter((g) => g.members < g.threshold)
  const ready = sorted.filter((g) => g.members >= g.threshold && !g.filed)
  const filed = sorted.filter((g) => g.filed)
  const mine = sorted.filter((g) => joined.includes(g.id))
  const visible = { all: sorted, open, ready, filed, mine }[filter]

  const tabs: TabItem<Filter>[] = [
    { key: 'all', label: '전체', count: sorted.length },
    { key: 'open', label: '참여자 모집 중', count: open.length },
    { key: 'ready', label: '문서 준비됨', count: ready.length },
    { key: 'filed', label: '제출됨', count: filed.length },
    { key: 'mine', label: '참여 중', count: mine.length },
  ]

  return (
    <main id="main" className="pb-16">
      <Band tone="mint" inner="pb-8 pt-8 md:pb-10 md:pt-12">
        <PageTitle>
          같은 고민을 가진
          <br />
          이웃을 모았어요
        </PageTitle>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:text-[16px]">
          "나도 같은 문제예요"를 누르면 참여할 수 있어요. 30명이 모이면 참여·제출·지연 현황을 담은 공동민원 문서를 만들어 드리고, 대표자가 내용을 확인한 뒤 국민신문고에 직접 제출해요.
        </p>
      </Band>

      <Container className="mt-6 md:mt-8">
        <Tabs items={tabs} value={filter} onChange={setFilter} aria-label="그룹 상태" />
        <div className="mt-5 space-y-3">
          {visible.length === 0 ? (
            <EmptyState title={filter === 'mine' ? '참여 중인 그룹이 없어요' : '해당하는 그룹이 없어요'} description={filter === 'mine' ? '목록에서 같은 문제를 찾아 참여해 보세요' : undefined} />
          ) : (
            visible.map((g) => {
              const isJoined = joined.includes(g.id)
              return (
                <GroupRow
                  key={g.id}
                  group={g}
                  joined={isJoined}
                  onToggleJoin={() => {
                    if (isJoined) {
                      leave(g.id)
                      toast('그룹에서 나왔어요')
                    } else {
                      join(g.id)
                      toast('같은 고민 그룹에 참여했어요')
                    }
                  }}
                />
              )
            })
          )}
        </div>
      </Container>
    </main>
  )
}
