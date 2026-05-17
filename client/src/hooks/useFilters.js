import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useFilters(initialSearch = '', initialCategory = 'all') {
  const [search, setSearch]         = useState(initialSearch)
  const [category, setCategory]     = useState(initialCategory)
  const [classLevel, setClassLevel] = useState('all')
  const [subject, setSubject]       = useState('all')
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [meta, setMeta]             = useState(null)
  const [page, setPage]             = useState(1)

  const debounceRef = useRef(null)
  const mountedRef  = useRef(false)
  const fetchIdRef  = useRef(0)

  const fetchProducts = useCallback(async (params) => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params.q)                                       query.set('q', params.q)
      if (params.category && params.category !== 'all')   query.set('category', params.category)
      if (params.classLevel && params.classLevel !== 'all') query.set('class_level', params.classLevel)
      if (params.subject && params.subject !== 'all')     query.set('subject', params.subject)
      if (params.page)                                    query.set('page', params.page)
      query.set('per_page', '24')

      const res  = await fetch(`${API_BASE}/api/v1/products?${query}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      if (id !== fetchIdRef.current) return
      setProducts(data.data || [])
      setMeta(data.meta || null)
    } catch (e) {
      if (id !== fetchIdRef.current) return
      setError('Could not load products. Is the API running?')
      console.error(e)
    } finally {
      if (id === fetchIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const isSearchTyping = search !== '' && mountedRef.current
    const delay = isSearchTyping ? 350 : 0
    mountedRef.current = true
    debounceRef.current = setTimeout(() => {
      fetchProducts({ q: search, category, classLevel, subject, page })
    }, delay)
    return () => clearTimeout(debounceRef.current)
  }, [search, category, classLevel, subject, page])

  const reset = () => {
    setSearch('')
    setCategory('all')
    setClassLevel('all')
    setSubject('all')
    setPage(1)
  }

  return {
    search, setSearch,
    category, setCategory,
    classLevel, setClassLevel,
    subject, setSubject,
    products,
    loading,
    error,
    meta,
    page, setPage,
    reset,
    hasFilters: category !== 'all' || classLevel !== 'all' || subject !== 'all' || search !== '',
  }
}
