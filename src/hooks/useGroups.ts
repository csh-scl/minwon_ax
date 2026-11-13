import { useCallback, useState } from 'react'
import {
  createGroup,
  joinGroup,
  joinedIds,
  leaveGroup,
  listGroups,
  markSubmitted,
  submittedIds,
} from '@/services/groupService'
import type { ConcernGroup } from '@/types'

export function useGroups() {
  const [groups, setGroups] = useState<ConcernGroup[]>(() => listGroups())
  const [joined, setJoined] = useState<string[]>(() => joinedIds())
  const [submitted, setSubmitted] = useState<string[]>(() => submittedIds())

  const sync = useCallback(() => {
    setGroups(listGroups())
    setJoined(joinedIds())
    setSubmitted(submittedIds())
  }, [])

  const join = useCallback(
    (id: string) => {
      joinGroup(id)
      sync()
    },
    [sync],
  )
  const leave = useCallback(
    (id: string) => {
      leaveGroup(id)
      sync()
    },
    [sync],
  )
  const submit = useCallback(
    (id: string) => {
      markSubmitted(id)
      sync()
    },
    [sync],
  )
  const create = useCallback(
    (input: Parameters<typeof createGroup>[0]) => {
      const g = createGroup(input)
      sync()
      return g
    },
    [sync],
  )

  return { groups, joined, submitted, join, leave, submit, create, sync }
}
