import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'sun' | 'secondary' | 'outline' | 'ghost' | 'signal' | 'ink' | 'white'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface StyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
}

/* 알약 모양 버튼. 노란 'sun' 은 화면에서 가장 중요한 행동 하나에만 씁니다. */
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-compass text-white hover:bg-compass-deep shadow-[0_6px_16px_-8px_rgb(47_107_234/0.6)]',
  sun: 'bg-sun text-ink hover:bg-sun-deep shadow-[0_8px_20px_-8px_rgb(242_184_0/0.7)]',
  secondary: 'bg-surface-2 text-ink hover:bg-surface-3',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-compass hover:bg-compass-tint',
  signal: 'bg-signal-tint text-signal-deep hover:bg-[#fbd9d2]',
  ink: 'bg-ink text-white hover:bg-[#0f1422]',
  white: 'bg-surface text-ink shadow-card hover:bg-surface-2',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1',
  md: 'h-11 px-5 text-[15px] gap-1.5',
  lg: 'h-[54px] px-6 text-[16px] gap-2',
}

export function buttonClass({ variant = 'primary', size = 'md', full = false }: StyleProps, className?: string): string {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-bold transition-colors disabled:pointer-events-none disabled:opacity-50',
    VARIANT[variant],
    SIZE[size],
    full && 'w-full',
    className,
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps

export function Button({ variant, size, full, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, full }, className)} {...props} />
}

type ButtonLinkProps = LinkProps & StyleProps

export function ButtonLink({ variant, size, full, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, full }, className)} {...props} />
}

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps

export function ExternalButtonLink({ variant, size, full, className, ...props }: ExternalLinkProps) {
  return <a target="_blank" rel="noreferrer noopener" className={buttonClass({ variant, size, full }, className)} {...props} />
}
