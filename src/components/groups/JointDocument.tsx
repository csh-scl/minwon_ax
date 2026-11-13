import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/context/ToastContext'

interface JointDocumentProps {
  text: string
  filename: string
}

export function JointDocument({ text, filename }: JointDocumentProps) {
  const { toast } = useToast()

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast('공동민원 문서를 내려받았어요')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast('문서를 복사했어요')
    } catch {
      toast('복사할 수 없어요. 내용을 선택해 직접 복사해 주세요', 'signal')
    }
  }

  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap bg-surface-2 p-5 font-sans text-[14px] leading-relaxed md:p-6">{text}</pre>
      <div className="flex gap-2 p-4">
        <Button variant="sun" onClick={download} className="flex-1">
          <Icon name="download" size={16} />
          문서 내려받기
        </Button>
        <Button variant="outline" onClick={copy} className="flex-1">
          <Icon name="copy" size={16} />
          복사하기
        </Button>
      </div>
    </div>
  )
}
