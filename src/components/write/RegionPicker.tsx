import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Field'
import { Sheet } from '@/components/ui/Sheet'
import type { Region, RegionChoice } from '@/types'

interface RegionPickerProps {
  open: boolean
  onClose: () => void
  regions: Region[]
  value: RegionChoice | null
  onChange: (r: RegionChoice) => void
}

export function RegionPicker({ open, onClose, regions, value, onChange }: RegionPickerProps) {
  const [sido, setSido] = useState(value?.sido ?? regions[0]?.sido ?? '')
  const [district, setDistrict] = useState(value?.district ?? '')

  useEffect(() => {
    if (open) {
      setSido(value?.sido ?? regions[0]?.sido ?? '')
      setDistrict(value?.district ?? '')
    }
  }, [open, value, regions])

  const districts = regions.find((r) => r.sido === sido)?.districts ?? []

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="사는 지역"
      description="지자체·교육청 소관 민원은 지역에 따라 처리기관이 달라져요. 선택한 지역은 이 브라우저에만 저장돼요."
      footer={
        <Button
          full
          size="lg"
          disabled={!sido}
          onClick={() => {
            onChange({ sido, district: district || undefined })
            onClose()
          }}
        >
          이 지역 선택하기
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="시·도" htmlFor="region-sido" required>
          <Select
            id="region-sido"
            value={sido}
            onChange={(e) => {
              setSido(e.target.value)
              setDistrict('')
            }}
          >
            {regions.map((r) => (
              <option key={r.sido} value={r.sido}>
                {r.sido}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="시·군·구" htmlFor="region-district" hint="목록에 없으면 비워 두세요">
          <Select id="region-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">선택 안 함</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Sheet>
  )
}
