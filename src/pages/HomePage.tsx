import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSearch } from '@/components/home/HeroSearch'
import { NextSteps } from '@/components/home/NextSteps'
import { TopicFamilies } from '@/components/home/TopicFamilies'
import { Band, Container, SectionHead } from '@/components/layout/Page'
import { useSession } from '@/context/SessionContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGroups } from '@/hooks/useGroups'
import { listTracked } from '@/services/trackingService'

/**
 * 첫 화면은 '답을 먼저 찾기' 하나만 맡습니다.
 * 히어로 검색 → 분야별 찾기 → 다음 단계(쓰기·추적·같은 고민)로 가는 문. 현황·집계는 각 서브 페이지가 맡습니다.
 */
export function HomePage() {
  const navigate = useNavigate()
  const { lastQuery, setLastQuery } = useSession()
  const [q, setQ] = useState('')
  useDocumentTitle()

  const tracked = useMemo(() => listTracked(), [])
  const { groups, joined } = useGroups()

  const submit = (text: string = q) => {
    const t = text.trim()
    if (!t) return
    setLastQuery(t)
    navigate(`/search?q=${encodeURIComponent(t)}`)
  }

  return (
    <main id="main" className="pb-16">
      <Band tone="hero" inner="pb-10 pt-8 md:pb-14 md:pt-12">
        <HeroSearch value={q} onChange={setQ} onSubmit={(t) => submit(t)} />
      </Band>

      <Container className="mt-14">
        <SectionHead sub="민원 사례를 분야별로 모았어요. 관심 있는 분야를 선택해 많이 본 사례를 살펴보세요.">분야별 찾기</SectionHead>
        <TopicFamilies />
      </Container>

      <Container className="mt-16">
        <SectionHead sub="민원 초안을 작성하거나 접수한 민원을 관리하고, 같은 고민을 가진 사람들과 함께할 수 있어요.">찾은 다음에는</SectionHead>
        <NextSteps lastQuery={lastQuery} tracked={tracked} groups={groups} joined={joined} />
      </Container>
    </main>
  )
}
