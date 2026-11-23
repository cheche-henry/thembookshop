import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const ALL = 'all'

const FILTER_KEYS = ['search', 'category', 'subcategory', 'stage', 'classLevel', 'subject', 'subsubject']

// Storefront filter state. The URL is the durable copy of the filters so that
// reloads, browser history and shared links all restore the same shelf.
export function useFilters(initial = {}) {
  const [search, setSearch]             = useState(initial.search || '')
  const [category, setCategory]         = useState(initial.category || ALL)
  const [subcategory, setSubcategory]   = useState(initial.subcategory || ALL)
  const [stage, setStage]               = useState(initial.stage || ALL)
  const [classLevel, setClassLevel]     = useState(initial.classLevel || ALL)
  const [subject, setSubject]           = useState(initial.subject || ALL)
  const [subsubject, setSubsubject]     = useState(initial.subsubject || ALL)

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [meta, setMeta]         = useState(null)
  const [facets, setFacets]     = useState(null)
  const [page, setPage]         = useState(initial.page || 1)

  const [searchParams, setSearchParams] = useSearchParams()
  const paramsString = searchParams.toString()
  const lastSyncedRef = useRef(null)

  const debounceRef = useRef(null)
  const mountedRef  = useRef(false)
  const fetchIdRef  = useRef(0)

  // Facet counts come from the API so the sidebar never shows an empty shelf.
  useEffect(() => {
    let cancelled = false

    fetch(`${API_BASE}/api/v1/products/facets`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setFacets(json.data)
      })
      .catch(() => {
        // Facets are a progressive enhancement; the static taxonomy still works.
      })

    return () => { cancelled = true }
  }, [])

  // External URL changes (navbar search, back button, shared link) update state.
  useEffect(() => {
    if (lastSyncedRef.current === paramsString) return

    const read = (key) => searchParams.get(key) || ALL
    setSearch(searchParams.get('search') || '')
    setCategory(read('category'))
    setSubcategory(read('subcategory'))
    setStage(read('stage'))
    setClassLevel(read('class_level'))
    setSubject(read('subject'))
    setSubsubject(read('subsubject'))
    setPage(Math.max(1, Number(searchParams.get('page')) || 1))
    lastSyncedRef.current = paramsString
    // searchParams is intentionally read through paramsString.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString])

  // State changes are written back to the URL without adding history entries.
  useEffect(() => {
    const next = new URLSearchParams()
    if (search) next.set('search', search)
    if (category !== ALL) next.set('category', category)
    if (subcategory !== ALL) next.set('subcategory', subcategory)
    if (stage !== ALL) next.set('stage', stage)
    if (classLevel !== ALL) next.set('class_level', classLevel)
    if (subject !== ALL) next.set('subject', subject)
    if (subsubject !== ALL) next.set('subsubject', subsubject)
    if (page > 1) next.set('page', String(page))

    const nextString = next.toString()
    if (nextString === paramsString) return

    lastSyncedRef.current = nextString
    setSearchParams(next, { replace: true })
  }, [search, category, subcategory, stage, classLevel, subject, subsubject, page, paramsString, setSearchParams])

  const fetchProducts = useCallback(async (params) => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (params.q)                                       query.set('q', params.q)
      if (params.category && params.category !== ALL)     query.set('category', params.category)
      if (params.subcategory && params.subcategory !== ALL) query.set('subcategory', params.subcategory)
      if (params.stage && params.stage !== ALL)           query.set('stage', params.stage)
      if (params.classLevel && params.classLevel !== ALL) query.set('class_level', params.classLevel)
      if (params.subject && params.subject !== ALL)       query.set('subject', params.subject)
      if (params.subsubject && params.subsubject !== ALL) query.set('subsubject', params.subsubject)
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
      setError('Could not load products. Check your connection and try again.')
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
      fetchProducts({ q: search, category, subcategory, stage, classLevel, subject, subsubject, page })
    }, delay)
    return () => clearTimeout(debounceRef.current)
  }, [search, category, subcategory, stage, classLevel, subject, subsubject, page, fetchProducts])

  // Any filter change starts a new result set, so the page has to go back to 1
  // (otherwise page 5 of the previous filters is requested and often empty).
  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const selectCategory = (value) => {
    setCategory(value)
    // A subcategory only exists inside its department.
    setSubcategory(ALL)
    setPage(1)
  }

  const selectSubject = (value) => {
    setSubject(value)
    // Fasihi is a component of Kiswahili, not a peer subject.
    setSubsubject(ALL)
    setPage(1)
  }

  // Stage and class level describe the same axis at different granularity, so
  // selecting one clears the other instead of silently producing no results.
  const selectStage = (value) => {
    setStage(value)
    if (value !== ALL) setClassLevel(ALL)
    setPage(1)
  }

  const selectLevel = (value) => {
    setClassLevel(value)
    if (value !== ALL) setStage(ALL)
    setPage(1)
  }

  const reset = () => {
    setSearch('')
    setCategory(ALL)
    setSubcategory(ALL)
    setStage(ALL)
    setClassLevel(ALL)
    setSubject(ALL)
    setSubsubject(ALL)
    setPage(1)
  }

  const refetch = useCallback(() => {
    fetchProducts({ q: search, category, subcategory, stage, classLevel, subject, subsubject, page })
  }, [fetchProducts, search, category, subcategory, stage, classLevel, subject, subsubject, page])

  const hasFilters = FILTER_KEYS.some((key) => {
    const value = { search, category, subcategory, stage, classLevel, subject, subsubject }[key]
    return value !== ALL && value !== ''
  })

  return {
    search, setSearch: changeFilter(setSearch),
    category, setCategory: selectCategory,
    subcategory, setSubcategory: changeFilter(setSubcategory),
    stage, setStage: selectStage,
    classLevel, setClassLevel: selectLevel,
    subject, setSubject: selectSubject,
    subsubject, setSubsubject: changeFilter(setSubsubject),
    products,
    loading,
    error,
    meta,
    facets,
    page, setPage,
    reset,
    refetch,
    hasFilters,
  }
}
