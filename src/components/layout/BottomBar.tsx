import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface BottomBarProps {
  children: ReactNode
  /** 데스크톱에서 본문 흐름에 그대로 두거나 숨깁니다(오른쪽 레일에 같은 동작이 있을 때) */
  desktop?: 'inline' | 'hidden'
  note?: ReactNode
}

/** 모바일 하단 고정 행동 영역 */
export function BottomBar({ children, desktop = 'inline', note }: BottomBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 bg-surface/95 shadow-bar backdrop-blur',
        desktop === 'inline' ? 'lg:static lg:mt-8 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none' : 'lg:hidden',
      )}
    >
      <div className={cn('safe-bottom mx-auto w-full max-w-[1200px] px-4 pt-3 md:px-6', desktop === 'inline' && 'lg:px-0 lg:pt-0 lg:pb-0')}>
        {note && <div className="mb-2.5 text-center text-[13px] font-bold text-compass lg:text-left">{note}</div>}
        <div className="flex gap-2">{children}</div>
      </div>
    </div>
  )
}
