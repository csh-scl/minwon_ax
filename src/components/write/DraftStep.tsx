import { Badge } from '@/components/ui/Badge'
import { Button, ExternalButtonLink } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Lead, PageTitle } from '@/components/layout/Page'
import { useToast } from '@/context/ToastContext'
import { draftToText, placeholdersIn } from '@/services/draftService'
import type { Draft } from '@/types'

interface DraftStepProps {
  draft: Draft
  onChange: (d: Draft) => void
  agency: string
  expectedDays: number
  onBack: () => void
  onRegenerate: () => void
  onRegister: () => void
}

export const EPEOPLE_URL = 'https://www.epeople.go.kr/nep/pttn/gnrlPttn/pttnQnaApplicationForm.npaid'

export function DraftStep({ draft, onChange, agency, expectedDays, onBack, onRegenerate, onRegister }: DraftStepProps) {
  const { toast } = useToast()
  const placeholders = [...new Set([...placeholdersIn(draft.title), ...placeholdersIn(draft.body), ...placeholdersIn(draft.request)])]

  const copy = async () => {
    const text = draftToText(draft)
    try {
      await navigator.clipboard.writeText(text)
      toast('초안을 복사했어요')
    } catch {
      toast('복사할 수 없어요. 내용을 선택해 직접 복사해 주세요', 'signal')
    }
  }

  return (
    <div>
      <PageTitle>초안이 준비됐어요</PageTitle>
      <Lead>
        {agency}에 보내는 초안이에요. 빈칸과 전체 내용을 확인한 뒤 제출해 주세요. 예상 처리기간은 <span className="tnum font-extrabold text-ink">{expectedDays}영업일</span>이며, 실제 처리기간은 달라질 수 있어요.
      </Lead>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {placeholders.length > 0 ? (
          <>
            <Badge tone="check" size="md">채워야 할 항목 {placeholders.length}개</Badge>
            {placeholders.map((p) => (
              <span key={p} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-muted">
                [{p}]
              </span>
            ))}
          </>
        ) : (
          <Badge tone="fresh" size="md">모든 항목이 채워졌어요</Badge>
        )}
      </div>

      <div className="mt-5 space-y-4 rounded-card bg-surface p-5 shadow-card md:p-6">
        <Field label="제목" htmlFor="draft-title" required>
          <Input id="draft-title" value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} className="font-bold" />
        </Field>
        <Field label="내용" htmlFor="draft-body" required>
          <Textarea id="draft-body" value={draft.body} onChange={(e) => onChange({ ...draft, body: e.target.value })} minRows={6} className="text-[15.5px] leading-7" />
        </Field>
        <Field label="요청사항" htmlFor="draft-request" required>
          <Textarea id="draft-request" value={draft.request} onChange={(e) => onChange({ ...draft, request: e.target.value })} minRows={2} />
        </Field>
        <div className="flex justify-end">
          <button type="button" onClick={onRegenerate} className="inline-flex items-center gap-1 text-[13px] font-bold text-ink-muted hover:text-ink">
            <Icon name="refresh" size={14} />
            입력한 정보로 다시 만들기
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="lg" onClick={copy} className="flex-1">
            <Icon name="copy" size={18} />
            복사하기
          </Button>
          <ExternalButtonLink href={EPEOPLE_URL} variant="sun" size="lg" className="flex-[1.4]" onClick={() => void copy()}>
            복사하고 국민신문고로 가기
            <Icon name="external" size={16} />
          </ExternalButtonLink>
        </div>
        <Button variant="ghost" full size="lg" onClick={onRegister}>
          이미 접수했다면 내 민원에 등록하기
        </Button>
        <button type="button" onClick={onBack} className="mx-auto block py-1 text-[13px] font-bold text-ink-muted hover:text-ink">
          이전 단계로
        </button>
      </div>
    </div>
  )
}
