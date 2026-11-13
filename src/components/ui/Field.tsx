import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const inputClass =
  'w-full rounded-2xl border border-transparent bg-surface-2 px-4 text-[15px] text-ink placeholder:text-ink-faint transition-colors focus:border-compass focus:bg-surface focus:outline-none focus:ring-4 focus:ring-compass/10 disabled:opacity-60'

interface FieldProps {
  label: string
  hint?: string
  htmlFor?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({ label, hint, htmlFor, required, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[15px] font-bold text-ink">
        {label}
        {required ? <span className="ml-1 text-compass">*</span> : <span className="ml-1.5 text-xs font-medium text-ink-faint">선택</span>}
      </label>
      {hint && <p className="text-[13px] text-ink-muted">{hint}</p>}
      {children}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, 'h-12', className)} {...props} />
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean
  minRows?: number
}

export function Textarea({ className, autoGrow = true, minRows = 3, value, ...props }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !autoGrow) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value, autoGrow])
  return <textarea ref={ref} rows={minRows} value={value} className={cn(inputClass, 'py-3 leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(inputClass, 'h-12 appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}
