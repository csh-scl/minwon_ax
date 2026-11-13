import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notice'
import { Lead, PageTitle } from '@/components/layout/Page'
import { cn } from '@/lib/cn'
import { AGENCY_TYPE_LABEL } from '@/services/recommendationService'
import type { AgencyType, RequiredField } from '@/types'

interface RequiredInfoStepProps {
  agency: string
  type: AgencyType
  fields: RequiredField[]
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
  extraDocs: { count: number; examples: string[] }
  onBack: () => void
  onNext: () => void
}

export function RequiredInfoStep({ agency, type, fields, answers, onChange, extraDocs, onBack, onNext }: RequiredInfoStepProps) {
  const missing = fields.filter((f) => f.required && !answers[f.key]?.trim()).length
  const filled = fields.filter((f) => answers[f.key]?.trim()).length
  return (
    <div>
      <PageTitle>
        빠진 정보가 없는지
        <br />
        확인할게요
      </PageTitle>
      <Lead>
        {agency}에 보낼 {AGENCY_TYPE_LABEL[type]} 민원에 필요한 정보를 입력해 주세요. 아직 모르는 정보는 비워 두어도 초안을 만들 수 있어요.
      </Lead>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="점검 항목">
        {fields.map((f) => {
          const ok = !!answers[f.key]?.trim()
          return (
            <li key={f.key} className={cn('inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold', ok ? 'bg-mint-tint text-mint-deep' : 'bg-surface-2 text-ink-muted')}>
              <Icon name={ok ? 'check' : 'minus'} size={13} />
              {f.label}
            </li>
          )
        })}
        <li className="tnum ml-auto self-center text-[13px] text-ink-faint">
          {fields.length}개 중 {filled}개 입력
        </li>
      </ul>

      <div className="mt-6 space-y-5 rounded-card bg-surface p-5 shadow-card md:p-6">
        {fields.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint} htmlFor={`field-${f.key}`} required={f.required}>
            {f.key === 'detail' ? (
              <Textarea id={`field-${f.key}`} value={answers[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)} placeholder={f.placeholder} minRows={2} />
            ) : (
              <Input id={`field-${f.key}`} value={answers[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)} placeholder={f.placeholder} />
            )}
          </Field>
        ))}
      </div>

      {extraDocs.count > 0 && (
        <Notice tone="amber" className="mt-5" title={`비슷한 민원 ${extraDocs.count}건에서 담당자가 구체적인 상황 설명이나 추가 자료를 요청했어요`}>
          날짜와 장소를 구체적으로 적고, 사진 등 참고 자료는 국민신문고에 제출할 때 첨부해 주세요.
          {extraDocs.examples.length > 0 && <span className="mt-1 block text-[12px] opacity-80">예: {extraDocs.examples.join(' / ')}</span>}
        </Notice>
      )}

      <div className="mt-8 flex gap-2">
        <Button variant="outline" size="lg" onClick={onBack}>
          <Icon name="chevron-left" size={18} />
          이전 단계로
        </Button>
        <Button size="lg" className="flex-1" onClick={onNext}>
          {missing > 0 ? `초안 만들기 (빈 항목 ${missing}개는 [ ]로 남겨요)` : '초안 만들기'}
          <Icon name="arrow-right" size={18} />
        </Button>
      </div>
    </div>
  )
}
