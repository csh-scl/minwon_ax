import { useCallback, useState } from 'react'
import { addTracked, listTracked, removeTracked, updateTracked } from '@/services/trackingService'
import type { TrackedComplaint } from '@/types'

export function useTracking() {
  const [items, setItems] = useState<TrackedComplaint[]>(() => listTracked())

  const add = useCallback((input: Omit<TrackedComplaint, 'id' | 'createdAt'>) => {
    const created = addTracked(input)
    setItems(listTracked())
    return created
  }, [])

  const update = useCallback((id: string, patch: Partial<TrackedComplaint>) => {
    setItems(updateTracked(id, patch))
  }, [])

  const remove = useCallback((id: string) => {
    setItems(removeTracked(id))
  }, [])

  return { items, add, update, remove }
}
