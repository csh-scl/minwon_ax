import { ExternalButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'

interface DelayGuideSheetProps {
  kind: 'extension' | 'acrc' | null
  onClose: () => void
}

const GUIDES = {
  extension: {
    title: '처리기간 연장 통지 확인하기',
    description: '처리기간을 넘길 때 기관은 연장 사유와 새 처리기한을 알려야 해요.',
    steps: [
      '국민신문고 > 나의 민원 > 처리상태에서 "처리기간 연장" 표시와 연장 사유를 확인해요.',
      '연장 통지가 없다면 담당 부서에 처리 현황과 예정일을 문의할 수 있어요. 답변에 적힌 담당 연락처를 쓰면 돼요.',
      '이송이 반복되면 "민원 이송 내역"에서 어느 기관으로 넘어갔는지 보고, 마지막 기관을 추적 정보에 반영해 두세요.',
    ],
    link: { href: 'https://www.epeople.go.kr/nep/utilHistory/mySmgPttn/mySmgPttnList.paid', label: '국민신문고에서 내 민원 보기' },
    law: '민원 처리에 관한 법률 제21조(처리기간의 연장), 제16조(민원의 이송)',
  },
  acrc: {
    title: '국민권익위원회 고충민원 알아보기',
    description: '기관의 처리가 부당하거나 지연될 때 권익위에 고충민원을 낼 수 있어요.',
    steps: [
      '처리기간을 넘겼는데 연장 통지가 없거나, 답변이 왔지만 사실 확인 없이 종결된 경우가 대상이에요.',
      '국민신문고에서 "고충민원"으로 신청하거나 국민권익위원회(국번 없이 110)에 상담할 수 있어요.',
      '기존 민원 번호, 접수일, 답변 내용을 함께 적으면 검토가 빨라요. 추적 정보의 접수일과 기관을 그대로 쓰면 돼요.',
    ],
    link: { href: 'https://www.acrc.go.kr', label: '국민권익위원회 안내 보기' },
    law: '부패방지 및 국민권익위원회의 설치와 운영에 관한 법률 제39조(고충민원의 신청)',
  },
}

export function DelayGuideSheet({ kind, onClose }: DelayGuideSheetProps) {
  const g = kind ? GUIDES[kind] : null
  return (
    <Sheet
      open={!!g}
      onClose={onClose}
      title={g?.title ?? ''}
      description={g?.description}
      footer={
        g && (
          <ExternalButtonLink href={g.link.href} full size="lg">
            {g.link.label}
            <Icon name="external" size={16} />
          </ExternalButtonLink>
        )
      }
    >
      {g && (
        <>
          <ol className="space-y-3">
            {g.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="tnum mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-xl bg-surface-2 px-4 py-3 text-[13px] text-ink-muted">근거: {g.law}</p>
        </>
      )}
    </Sheet>
  )
}
