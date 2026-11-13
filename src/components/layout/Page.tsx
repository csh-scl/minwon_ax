import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

/** 가로 폭을 맞추는 컨테이너 */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 md:px-6', className)}>{children}</div>
}

export function Page({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <main id="main" className={cn('w-full pb-32 lg:pb-20', className)}>
      <div className={cn('mx-auto w-full px-4 pt-6 md:px-6 md:pt-10', wide ? 'max-w-[1200px]' : 'max-w-[1200px]')}>{children}</div>
    </main>
  )
}

interface BandProps {
  children: ReactNode
  tone?: 'hero' | 'mint' | 'peach' | 'sky' | 'cloud' | 'none'
  className?: string
  inner?: string
}

/** 화면 폭 전체를 채우는 색 띠. 안쪽은 컨테이너 폭으로 맞춥니다. */
export function Band({ children, tone = 'none', className, inner }: BandProps) {
  const bg =
    tone === 'hero' ? 'band-hero' : tone === 'mint' ? 'band-mint' : tone === 'peach' ? 'band-peach' : tone === 'sky' ? 'band-sky' : tone === 'cloud' ? 'bg-surface-2' : ''
  return (
    <section className={cn('w-full', bg, className)}>
      <Container className={inner}>{children}</Container>
    </section>
  )
}

interface TwoColumnProps {
  children: ReactNode
  aside?: ReactNode
  asideOnMobile?: 'below' | 'hidden'
}

/** 본문 + 오른쪽 레일. 모바일에서는 한 열로 쌓입니다. */
export function TwoColumn({ children, aside, asideOnMobile = 'below' }: TwoColumnProps) {
  return (
    <div className={cn('grid gap-8 lg:gap-12', !!aside && 'lg:grid-cols-[minmax(0,1fr)_340px]')}>
      <div className="min-w-0">{children}</div>
      {aside && (
        <aside className={cn('space-y-4 self-start lg:sticky lg:top-24', asideOnMobile === 'hidden' && 'hidden lg:block')}>{aside}</aside>
      )}
    </div>
  )
}

export function BackLink({ to, label = '뒤로' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="-ml-1 inline-flex items-center gap-0.5 rounded-md py-1 pr-2 text-sm font-bold text-ink-muted hover:text-ink">
      <Icon name="chevron-left" size={18} />
      {label}
    </Link>
  )
}

export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn('text-[28px] font-extrabold leading-[1.22] tracking-[-0.02em] md:text-[36px]', className)}>{children}</h1>
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-3 text-[15px] leading-relaxed text-ink-muted md:text-[16px]', className)}>{children}</p>
}

interface SectionHeadProps {
  children: ReactNode
  sub?: ReactNode
  more?: { to: string; label?: string }
  aside?: ReactNode
  className?: string
}

/** 상상대로 서울의 '공지사항 >' 처럼 큰 제목 + 오른쪽 '전체 보기' */
export function SectionHead({ children, sub, more, aside, className }: SectionHeadProps) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2', className)}>
      <div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.01em] md:text-[26px]">{children}</h2>
        {sub && <p className="mt-1 text-[14px] text-ink-muted md:text-[15px]">{sub}</p>}
      </div>
      {more && (
        <Link to={more.to} className="inline-flex items-center gap-0.5 rounded-full py-1 text-[14px] font-bold text-ink-muted hover:text-compass">
          {more.label ?? '전체 보기'}
          <Icon name="chevron-right" size={16} />
        </Link>
      )}
      {aside}
    </div>
  )
}

export function SectionTitle({ children, aside, className }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-4', className)}>
      <h2 className="text-[18px] font-extrabold tracking-tight">{children}</h2>
      {aside && <div className="text-[13px] text-ink-muted">{aside}</div>}
    </div>
  )
}
