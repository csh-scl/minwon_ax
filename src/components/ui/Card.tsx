import type { HTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type CardTone = 'white' | 'cloud' | 'sky' | 'mint' | 'peach' | 'sun'

const TONE: Record<CardTone, string> = {
  white: 'bg-surface shadow-card',
  cloud: 'bg-surface-2',
  sky: 'bg-compass-band',
  mint: 'bg-mint-band',
  peach: 'bg-peach-band',
  sun: 'bg-sun-tint',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  tone?: CardTone
}

/* 테두리 없는 둥근 면. 흰 카드는 그림자로, 색 카드는 면 색으로 구분합니다. */
export function Card({ padded = true, tone = 'white', className, ...props }: CardProps) {
  return <div className={cn('rounded-card', TONE[tone], padded && 'p-5 md:p-6', className)} {...props} />
}

export function CardLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn('block rounded-card bg-surface p-5 shadow-card transition-shadow hover:shadow-float md:p-6', className)}
      {...props}
    />
  )
}
