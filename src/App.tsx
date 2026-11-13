import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SessionProvider } from '@/context/SessionContext'
import { ToastProvider } from '@/context/ToastContext'
import { CaseDetailPage } from '@/pages/CaseDetailPage'
import { GroupDetailPage } from '@/pages/GroupDetailPage'
import { GroupsPage } from '@/pages/GroupsPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SearchPage } from '@/pages/SearchPage'
import { TrackPage } from '@/pages/TrackPage'
import { WritePage } from '@/pages/WritePage'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname, search])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ToastProvider>
          <ScrollToTop />
          <div className="flex min-h-dvh flex-col">
            <a
              href="#main"
              className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-[14px] font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              본문 바로가기
            </a>
            <Header />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cases/:id" element={<CaseDetailPage />} />
                <Route path="/write" element={<WritePage />} />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/:id" element={<GroupDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  )
}
