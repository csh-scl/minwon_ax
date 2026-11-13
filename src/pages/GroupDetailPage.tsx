import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CaseTile } from '@/components/cases/CaseTile'
import { GroupStats } from '@/components/groups/GroupStats'
import { JointDocument } from '@/components/groups/JointDocument'
import { BottomBar } from '@/components/layout/BottomBar'
import { BackLink, Band, Container, PageTitle, SectionHead } from '@/components/layout/Page'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notice'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { topicLabel } from '@/config/topics'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGroups } from '@/hooks/useGroups'
import { formatDate } from '@/lib/format'
import { buildJointDocument } from '@/services/groupService'
import { searchCases } from '@/services/searchService'

export function GroupDetailPage() {
  const { id } = useParams()
  const { groups, joined, submitted, join, leave, submit } = useGroups()
  const { toast } = useToast()
  const group = groups.find((g) => g.id === id)
  useDocumentTitle(group?.title)

  const evidence = useAsync(
    () => (group ? searchCases(group.query, { limit: 3 }).then((r) => r.hits.map((h) => h.item)) : Promise.resolve([])),
    [group?.query],
  )

  const reached = !!group && group.members >= group.threshold
  const doc = useMemo(() => (group && reached ? buildJointDocument(group, evidence.data ?? []) : ''), [group, reached, evidence.data])

  if (!group) {
    return (
      <Container className="pt-8">
        <EmptyState title="그룹을 찾을 수 없어요" action={<Link to="/groups" className="font-bold text-compass">같은 고민 목록으로</Link>} />
      </Container>
    )
  }

  const isJoined = joined.includes(group.id)
  const isSubmitted = submitted.includes(group.id)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: group.title, text: `같은 고민을 가진 ${group.members}명이 모였어요`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast('링크를 복사했어요')
    } catch {
      /* 공유 취소 */
    }
  }

  const toggleJoin = () => {
    if (isJoined) {
      leave(group.id)
      toast('그룹에서 나왔어요')
    } else {
      join(group.id)
      toast('같은 고민 그룹에 참여했어요')
    }
  }

  return (
    <main id="main" className="pb-32 lg:pb-16">
      <Band tone="mint" inner="pb-8 pt-6 md:pb-10 md:pt-8">
        <BackLink to="/groups" label="같은 고민 목록" />
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
          <span className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-bold shadow-card">{topicLabel(group.topic)}</span>
          {group.region && <span>{group.region}</span>}
          {group.agency && <span>처리기관 {group.agency}</span>}
          <span className="tnum">{formatDate(group.createdAt)} 시작</span>
        </div>
        <PageTitle className="mt-3 max-w-[48rem] text-[26px] md:text-[34px]">{group.title}</PageTitle>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:text-[16px]">{group.description}</p>
      </Band>

      <Container className="mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <section>
              <SectionHead sub="국민신문고 공개 답변 중 이 고민과 관련된 사례를 모았어요.">참고할 민원 사례</SectionHead>
              {evidence.loading ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : evidence.data && evidence.data.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {evidence.data.map((c) => (
                    <CaseTile key={c.id} item={c} />
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-ink-muted">아직 참고할 사례를 찾지 못했어요.</p>
              )}
            </section>

            <section className="mt-12">
              <SectionHead sub="참여자 현황, 제출·지연 건수, 공동 요청사항을 담아요.">공동민원 문서</SectionHead>
              {reached ? (
                <JointDocument text={doc} filename={`공동민원_${group.title.replace(/[\\/:*?"<>|]/g, '')}.txt`} />
              ) : (
                <div className="rounded-card bg-surface-2 p-5">
                  <div>
                    <p className="text-[16px] font-extrabold">
                      <span className="tnum">{group.threshold - group.members}명</span> 더 모이면 공동민원 문서를 볼 수 있어요
                    </p>
                    <p className="mt-0.5 text-[13.5px] text-ink-muted">같은 문제를 겪는 이웃에게 링크를 공유해 보세요.</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-24">
            <div className="rounded-card bg-surface p-5 shadow-card md:p-6">
              <GroupStats group={group} />
              <div className="mt-5 hidden space-y-2 lg:block">
                <Button variant={isJoined ? 'secondary' : 'primary'} size="lg" full onClick={toggleJoin} aria-pressed={isJoined}>
                  <Icon name={isJoined ? 'check' : 'plus'} size={16} />
                  {isJoined ? '참여 중' : '나도 같은 문제예요'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  full
                  disabled={isSubmitted}
                  onClick={() => {
                    submit(group.id)
                    toast('민원 제출 현황에 반영했어요')
                  }}
                >
                  {isSubmitted ? '제출 기록 완료' : '민원 제출했어요'}
                </Button>
                <Button variant="ghost" full onClick={share}>
                  <Icon name="share" size={16} />
                  이웃에게 공유하기
                </Button>
              </div>
            </div>
            <Notice tone="info" icon="info">
              문서는 대표자가 국민신문고에 직접 제출해요. 민원나침반이 대신 제출하지 않아요.
            </Notice>
          </aside>
        </div>
      </Container>

      <BottomBar desktop="hidden">
        <Button variant={isJoined ? 'secondary' : 'primary'} size="lg" className="flex-1" onClick={toggleJoin} aria-pressed={isJoined}>
          <Icon name={isJoined ? 'check' : 'plus'} size={16} />
          {isJoined ? '참여 중' : '나도 같은 문제예요'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isSubmitted}
          onClick={() => {
            submit(group.id)
            toast('민원 제출 현황에 반영했어요')
          }}
        >
          {isSubmitted ? '제출 기록 완료' : '제출했어요'}
        </Button>
        <Button variant="outline" size="lg" onClick={share} aria-label="이웃에게 공유하기">
          <Icon name="share" size={18} />
        </Button>
      </BottomBar>
    </main>
  )
}
