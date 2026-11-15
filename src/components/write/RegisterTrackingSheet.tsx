import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Sheet } from '@/components/ui/Sheet'
import { todayISO } from '@/lib/businessDays'
import { AGENCY_TYPE_LABEL } from '@/services/recommendationService'
import type { AgencyType, TrackedComplaint } from '@/types'

export interface TrackDefaults {
  title: string
  agency: string
  agencyType: AgencyType
  expectedBusinessDays: number
  groupId?: string
}

interface RegisterTrackingSheetProps {
  open: boolean
  onClose: () => void
  defaults: TrackDefaults
  agencyNames: string[]
  onSave: (input: Omit<TrackedComplaint, 'id' | 'createdAt'>) => void
}

/** 접수한 민원을 추적 목록에 등록. 본문은 저장하지 않고 제목·기관·접수일만 받습니다. */
export function RegisterTrackingSheet({ open, onClose, defaults, agencyNames, onSave }: RegisterTrackingSheetProps) {
  const [title, setTitle] = useState(defaults.title)
  const [agency, setAgency] = useState(defaults.agency)
  const [agencyType, setAgencyType] = useState<AgencyType>(defaults.agencyType)
  const [receivedAt, setReceivedAt] = useState(todayISO())
  const [expected, setExpected] = useState(String(defaults.expectedBusinessDays))

  useEffect(() => {
    if (open) {
      setTitle(defaults.title)
      setAgency(defaults.agency)
      setAgencyType(defaults.agencyType)
      setReceivedAt(todayISO())
      setExpected(String(defaults.expectedBusinessDays))
    }
  }, [open, defaults])

  const valid = title.trim() && agency.trim() && receivedAt && Number(expected) > 0

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="접수한 민원 등록하기"
      description="제목·처리기관·접수일을 확인해 주세요. 등록한 정보를 바탕으로 지난 기간을 계산하며, 민원 본문은 저장하지 않아요."
      footer={
        <Button
          full
          size="lg"
          disabled={!valid}
          onClick={() =>
            onSave({
              title: title.trim(),
              agency: agency.trim(),
              agencyType,
              receivedAt,
              status: 'processing',
              transfers: 0,
              expectedBusinessDays: Number(expected),
              groupId: defaults.groupId,
            })
          }
        >
          내 민원에 등록하기
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="민원 제목" htmlFor="trk-title" required>
          <Input id="trk-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="처리기관" htmlFor="trk-agency" required>
          <Input id="trk-agency" list="agency-names" value={agency} onChange={(e) => setAgency(e.target.value)} />
          <datalist id="agency-names">
            {agencyNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>
        <Field label="기관 유형" htmlFor="trk-type" required>
          <Select id="trk-type" value={agencyType} onChange={(e) => setAgencyType(e.target.value as AgencyType)}>
            {(Object.keys(AGENCY_TYPE_LABEL) as AgencyType[]).map((k) => (
              <option key={k} value={k}>
                {AGENCY_TYPE_LABEL[k]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="접수일" htmlFor="trk-date" required>
            <Input id="trk-date" type="date" value={receivedAt} max={todayISO()} onChange={(e) => setReceivedAt(e.target.value)} />
          </Field>
          <Field label="처리기간" htmlFor="trk-days" required>
            <Input id="trk-days" type="number" min={1} max={90} value={expected} onChange={(e) => setExpected(e.target.value)} />
          </Field>
        </div>
      </div>
    </Sheet>
  )
}
