import { Notice } from '@/components/ui/Notice'
import { formatDate } from '@/lib/format'
import { amendedLaws } from '@/services/lawService'
import type { CaseItem } from '@/types'

interface LawChangeNoticeProps {
  item: CaseItem
  detailed?: boolean
}

/** 답변이 인용한 법령이 답변일 이후 개정됐을 때 */
export function LawChangeNotice({ item, detailed = false }: LawChangeNoticeProps) {
  const changes = amendedLaws(item)
  if (changes.length === 0) return null
  const first = changes[0]
  return (
    <Notice
      tone="signal"
      title="답변 이후 바뀐 내용이 있어요"
      action={
        <a href={first.link} target="_blank" rel="noreferrer noopener" className="underline-offset-2 hover:underline">
          최신 법령 보기
        </a>
      }
    >
      {detailed ? (
        <ul className="mt-1 space-y-1">
          {changes.map((c) => (
            <li key={c.name}>
              「{c.name}」 {formatDate(c.amendedAt)} 개정 · {c.summary}
            </li>
          ))}
        </ul>
      ) : (
        <>
          「{first.name}」이 {formatDate(first.amendedAt)}에 개정됐어요{changes.length > 1 ? ` 외 ${changes.length - 1}건` : ''}
        </>
      )}
    </Notice>
  )
}
