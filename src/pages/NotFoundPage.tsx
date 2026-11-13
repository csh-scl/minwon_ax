import { Link } from 'react-router-dom'
import { Container } from '@/components/layout/Page'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <Container className="pt-10">
      <EmptyState
        title="페이지를 찾을 수 없어요"
        description="주소가 바뀌었거나 없는 페이지예요"
        action={
          <Link to="/" className="font-bold text-compass">
            처음으로
          </Link>
        }
      />
    </Container>
  )
}
