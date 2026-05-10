import { useState, useEffect, useCallback } from 'react'

// Generic data fetching hook with loading/error states
export function useApi(fetchFn, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result.data ?? result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

// Mutation hook (create/update/delete)
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const mutate = async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutateFn(...args)
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
