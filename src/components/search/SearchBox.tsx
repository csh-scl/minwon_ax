import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { HERO_PLACEHOLDER } from '@/data/popular'

interface SearchBoxProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  hero?: boolean
  placeholder?: string
  buttonLabel?: string
  autoFocus?: boolean
}

export function SearchBox({
  value,
  onChange,
  onSubmit,
  hero = false,
  placeholder = HERO_PLACEHOLDER,
  buttonLabel = '비슷한 민원 찾기',
  autoFocus,
}: SearchBoxProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onSubmit()
    }
  }

  if (hero) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!value.trim()) {
            document.getElementById('hero-query')?.focus()
            return
          }
          onSubmit()
        }}
        className="space-y-3"
      >
        <label htmlFor="hero-query" className="sr-only">
          민원 내용
        </label>
        <Textarea
          id="hero-query"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          minRows={3}
          autoFocus={autoFocus}
          className="min-h-[120px] rounded-[20px] px-5 py-4 text-[17px] leading-relaxed md:text-[19px]"
        />
        <Button type="submit" size="lg" className="w-full md:w-auto md:min-w-[180px]">
          <Icon name="search" size={18} />
          {buttonLabel}
        </Button>
      </form>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="relative"
    >
      <Icon name="search" size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-compass" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="다른 말로 다시 찾아보기"
        aria-label="민원 내용"
        className="h-14 rounded-full bg-surface pl-13 pr-28 text-[16px] shadow-card ring-1 ring-ink/5 md:h-16 md:text-[17px]"
      />
      <Button type="submit" size="md" variant="ink" className="absolute right-2 top-1/2 -translate-y-1/2" disabled={!value.trim()}>
        다시 찾기
      </Button>
    </form>
  )
}
