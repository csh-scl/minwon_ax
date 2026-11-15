import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Sheet } from '@/components/ui/Sheet'
import { todayISO } from '@/lib/businessDays'
import { AGENCY_TYPE_LABEL } from '@/services/recommendationService'
import { STATUS_LABEL } from '@/services/trackingService'
import type { AgencyStat, AgencyType, TrackStatus, TrackedComplaint } from '@/types'

interface TrackFormProps {
  open: boolean
  onClose: () => void
  initial?: TrackedComplaint
  agencies: AgencyStat[]
  onSave: (input: Omit<TrackedComplaint, 'id' | 'createdAt'>) => void
}

const EMPTY = { title: '', agency: '', agencyType: 'local' as AgencyType, receivedAt: '', status: 'processing' as TrackStatus, transfers: '0', expected: '14' }

export function TrackForm({ open, onClose, initial, agencies, onSave }: TrackFormProps) {
  const [f, setF] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    setF(
      initial
        ? {
            title: initial.title,
            agency: initial.agency,
            agencyType: initial.agencyType,
            receivedAt: initial.receivedAt,
            status: initial.status,
            transfers: String(initial.transfers),
            expected: String(initial.expectedBusinessDays),
          }
        : { ...EMPTY, receivedAt: todayISO() },
    )
  }, [open, initial])

  const set = (patch: Partial<typeof EMPTY>) => setF((prev) => ({ ...prev, ...patch }))

  // 기관명을 고르면 유형과 예상 처리기간을 데이터에서 채워 줍니다.
  const onAgency = (name: string) => {
    const stat = agencies.find((a) => a.name === name)
    set(stat ? { agency: name, agencyType: stat.type, expected: String(stat.expectedBusinessDays) } : { agency: name })
  }

  const valid = f.title.trim() && f.agency.trim() && f.receivedAt && Number(f.expected) > 0

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? '민원 정보 수정' : '민원 직접 등록'}
      description="국민신문고에 접수한 민원의 제목·처리기관·접수일을 입력해 주세요. 민원 본문은 저장하지 않아요."
      footer={
        <Button
          full
          size="lg"
          disabled={!valid}
          onClick={() =>
            onSave({
              title: f.title.trim(),
              agency: f.agency.trim(),
              agencyType: f.agencyType,
              receivedAt: f.receivedAt,
              status: f.status,
              transfers: Number(f.transfers) || 0,
              expectedBusinessDays: Number(f.expected),
              groupId: initial?.groupId,
              note: initial?.note,
            })
          }
        >
          {initial ? '저장하기' : '내 민원에 등록하기'}
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="민원 제목" htmlFor="tf-title" required>
          <Input id="tf-title" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="예: 통학로 공사로 인도가 막혔어요" />
        </Field>
        <Field label="처리기관" htmlFor="tf-agency" required hint="목록에 있는 기관을 선택하면 기관 유형과 예상 처리기간을 채워 드려요">
          <Input id="tf-agency" list="tf-agency-names" value={f.agency} onChange={(e) => onAgency(e.target.value)} placeholder="예: 서울특별시 서초구" />
          <datalist id="tf-agency-names">
            {agencies.slice(0, 300).map((a) => (
              <option key={a.name} value={a.name} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="기관 유형" htmlFor="tf-type" required>
            <Select id="tf-type" value={f.agencyType} onChange={(e) => set({ agencyType: e.target.value as AgencyType })}>
              {(Object.keys(AGENCY_TYPE_LABEL) as AgencyType[]).map((k) => (
                <option key={k} value={k}>
                  {AGENCY_TYPE_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="상태" htmlFor="tf-status" required>
            <Select id="tf-status" value={f.status} onChange={(e) => set({ status: e.target.value as TrackStatus })}>
              {(Object.keys(STATUS_LABEL) as TrackStatus[]).map((k) => (
                <option key={k} value={k}>
                  {STATUS_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
          <Field label="접수일" htmlFor="tf-date" required className="col-span-2 sm:col-span-1">
            <Input id="tf-date" type="date" value={f.receivedAt} max={todayISO()} onChange={(e) => set({ receivedAt: e.target.value })} />
          </Field>
          <Field label="처리기간" htmlFor="tf-days" required>
            <Input id="tf-days" type="number" min={1} max={90} value={f.expected} title="영업일 기준" onChange={(e) => set({ expected: e.target.value })} />
          </Field>
          <Field label="이송 횟수" htmlFor="tf-transfers">
            <Input id="tf-transfers" type="number" min={0} max={20} value={f.transfers} onChange={(e) => set({ transfers: e.target.value })} />
          </Field>
        </div>
      </div>
    </Sheet>
  )
}
