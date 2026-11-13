import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { ConcernGroup, TrackedComplaint } from '@/types'
import { summarizeTracked } from '@/services/trackingService'

interface NextStepsProps {
  lastQuery: string
  tracked: TrackedComplaint[]
  groups: ConcernGroup[]
  joined: string[]
}

interface Door {
  to: string
  eyebrow: string
  title: string
  desc: string
  status: string
  alert?: boolean
  tone: string
}

/**
 * 첫 화면의 '다음 단계'. 찾기(히어로) 다음에 이어지는 세 서브 페이지로 가는 문입니다.
 * 각 문은 목적지 페이지의 띠 색을 쓰고, 현황은 한 줄만 보여줍니다.
 */
export function NextSteps({ lastQuery, tracked, groups, joined }: NextStepsProps) {
  const t = summarizeTracked(tracked)
  const biggest = [...groups].sort((a, b) => b.members - a.members)[0]

  const doors: Door[] = [
    {
      to: lastQuery ? `/write?q=${encodeURIComponent(lastQuery)}` : '/write',
      eyebrow: '민원 쓰기',
      title: '처리기관에 보낼 민원을 써요',
      desc: '추천 기관과 예상 처리기간을 확인하고, 국민신문고에 제출할 초안을 만들어요.',
      status: lastQuery ? `최근 고민 “${lastQuery}”으로 이어서 쓸 수 있어요` : '먼저 민원 찾기에서 문의 내용을 입력해 주세요',
      tone: 'bg-compass-band hover:bg-compass-tint',
    },
    {
      to: '/track',
      eyebrow: '내 민원',
      title: '접수한 민원을 관리해요',
      desc: '접수 정보를 등록하면 지난 기간을 계산하고, 설정한 처리기간을 넘겼을 때 확인할 사항을 알려드려요.',
      status:
        t.active > 0
          ? `처리 중 ${t.active}건${t.overdue > 0 ? ` · 기간 초과 ${t.overdue}건` : ''}`
          : t.answered > 0
            ? `답변 완료 ${t.answered}건 · 처리 중인 민원은 없어요`
            : '아직 등록한 민원이 없어요',
      alert: t.overdue > 0,
      tone: 'bg-peach-band hover:bg-peach-tint',
    },
    {
      to: '/groups',
      eyebrow: '같은 고민',
      title: '같은 문제를 겪는 이웃과 모여요',
      desc: '글을 쓰지 않아도 참여할 수 있고, 30명이 모이면 공동민원 문서를 만들어 드려요.',
      status: joined.length > 0 ? `참여 중인 그룹 ${joined.length}개` : biggest ? `그룹 ${groups.length}개 · 가장 큰 그룹 ${biggest.members}명` : '아직 그룹이 없어요',
      tone: 'bg-mint-band hover:bg-mint-tint',
    },
  ]

  return (
    <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
      {doors.map((d) => (
        <li key={d.to}>
          <Link to={d.to} className={cn('flex h-full flex-col rounded-card p-5 transition-colors md:p-6', d.tone)}>
            <p className="text-[13px] font-bold text-ink-muted">{d.eyebrow}</p>
            <h3 className="mt-1.5 text-[19px] font-extrabold leading-snug tracking-tight">{d.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{d.desc}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <p className={cn('tnum min-w-0 truncate text-[13.5px] font-bold', d.alert ? 'text-signal-deep' : 'text-ink')}>{d.status}</p>
              <Icon name="arrow-right" size={18} className="shrink-0 text-ink-muted" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
