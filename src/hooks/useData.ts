import { api } from '@/services/api'
import { searchCases } from '@/services/searchService'
import { useAsync } from './useAsync'

export function useAgencies() {
  return useAsync(() => api.getAgencies(), [])
}

export function useRegions() {
  return useAsync(() => api.getRegions(), [])
}

export function useMeta() {
  return useAsync(() => api.getMeta(), [])
}

export function useCase(id: string | undefined) {
  return useAsync(() => (id ? api.getCase(id) : Promise.resolve(undefined)), [id])
}

export function useSearch(query: string, topic?: string, limit?: number) {
  return useAsync(
    () => (query.trim() || topic ? searchCases(query, { topic, limit }) : Promise.resolve(null)),
    [query, topic, limit],
  )
}
