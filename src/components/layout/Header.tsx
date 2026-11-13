import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CompassMark } from '@/components/brand/CompassMark'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { listTracked, summarizeTracked } from '@/services/trackingService'

const NAV: { to: string; label: string }[] = [
  { to: '/', label: '민원 찾기' },
  { to: '/track', label: '내 민원' },
  { to: '/groups', label: '같은 고민' },
]

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const overdue = useMemo(() => summarizeTracked(listTracked()).overdue, [location.key])
  const [q, setQ] = useState('')
  const onHome = location.pathname === '/'

  useEffect(() => {
    setQ('')
  }, [location.key])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = q.trim()
    if (!t) return
    navigate(`/search?q=${encodeURIComponent(t)}`)
  }

  return (
    <>
      <div className="bg-surface-2 text-[12.5px] text-ink-muted">
        <div className="mx-auto flex h-8 w-full max-w-[1200px] items-center gap-2.5 px-4 md:px-6">
          <span className="rounded-sm bg-compass px-1.5 py-px text-[11px] font-extrabold leading-4 text-white">시범</span>
          <span className="truncate">국민신문고 공개 질의응답 데이터로 만든 시민 민원 안내 서비스</span>
          <nav aria-label="관련 누리집" className="ml-auto hidden shrink-0 items-center gap-4 font-semibold md:flex">
            <a href="https://www.epeople.go.kr" target="_blank" rel="noreferrer noopener" className="hover:text-ink">국민신문고</a>
            <a href="https://www.gov.kr" target="_blank" rel="noreferrer noopener" className="hover:text-ink">정부24</a>
            <a href="https://www.law.go.kr" target="_blank" rel="noreferrer noopener" className="hover:text-ink">국가법령정보센터</a>
          </nav>
        </div>
      </div>
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 px-4 md:h-[76px] md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded-md">
          <CompassMark size={30} />
          <span className="text-[19px] font-extrabold tracking-tight">민원나침반</span>
        </Link>

        <nav aria-label="주요 메뉴" className="ml-auto flex items-center gap-0.5 md:ml-6 md:gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[14px] font-bold transition-colors md:px-3.5 md:text-[16px]',
                  isActive ? 'text-compass-deep' : 'text-ink-muted hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {n.to === '/track' && overdue > 0 && (
                    <span className="absolute right-1 top-1.5 h-2 w-2 rounded-full bg-signal ring-2 ring-paper" aria-label="기간 초과 민원 있음" />
                  )}
                  {isActive && <span className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-sun md:inset-x-3.5" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {!onHome && (
          <form onSubmit={submit} role="search" className="relative ml-auto hidden w-[300px] lg:block">
            <label htmlFor="header-q" className="sr-only">
              민원 내용 검색
            </label>
            <input
              id="header-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="고민을 적어 보세요"
              className="h-11 w-full rounded-full border border-line bg-surface pl-4 pr-11 text-[14px] placeholder:text-ink-faint focus:border-compass focus:outline-none focus:ring-4 focus:ring-compass/10"
            />
            <button type="submit" aria-label="찾기" className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-compass hover:bg-compass-tint">
              <Icon name="search" size={18} />
            </button>
          </form>
        )}
      </div>
    </header>
    </>
  )
}
