import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { CaseItem } from '@/types'
import { CaseCard } from './CaseCard'

interface CaseListProps {
  items: CaseItem[]
  pageSize?: number
  showKind?: boolean
}

/** 두 열 격자. '더 보기'로 한 묶음씩 펼칩니다. */
export function CaseList({ items, pageSize = 8, showKind = false }: CaseListProps) {
  const [shown, setShown] = useState(pageSize)
  const visible = items.slice(0, shown)
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {visible.map((it) => (
          <CaseCard key={it.id} item={it} showKind={showKind} />
        ))}
      </div>
      {shown < items.length && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="lg" onClick={() => setShown((s) => s + pageSize)}>
            {Math.min(pageSize, items.length - shown)}건 더 보기
          </Button>
        </div>
      )}
    </div>
  )
}
