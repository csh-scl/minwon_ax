import { useEffect } from 'react'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - 민원나침반` : '민원나침반'
  }, [title])
}
