import { cn } from '@/lib/cn'

export interface TabItem<K extends string> {
  key: K
  label: string
  count?: number
}

interface TabsProps<K extends string> {
  items: TabItem<K>[]
  value: K
  onChange: (key: K) => void
  'aria-label'?: string
}

/* 상상대로 서울의 '분야별 제안 | 지역별 제안' 처럼 밑줄로 고르는 탭 */
export function Tabs<K extends string>({ items, value, onChange, ...rest }: TabsProps<K>) {
  return (
    <div role="tablist" aria-label={rest['aria-label']} className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
      {items.map((it, i) => {
        const active = it.key === value
        return (
          <div key={it.key} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className="mx-1 h-4 w-px bg-line-strong" />}
            <button
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(it.key)}
              className={cn(
                'relative inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-2 text-[16px] font-bold transition-colors md:text-[19px]',
                active ? 'text-compass-deep' : 'text-ink-muted hover:text-ink',
              )}
            >
              {it.label}
              {typeof it.count === 'number' && <span className={cn('tnum text-[13px] font-semibold', active ? 'text-compass' : 'text-ink-faint')}>{it.count}</span>}
              {active && <span className="absolute inset-x-2 -bottom-0.5 h-[3px] rounded-full bg-sun" />}
            </button>
          </div>
        )
      })}
    </div>
  )
}
