import { useState, useMemo } from 'react'
import { products } from '../data/products'
export function useFilters() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [classLevel, setClassLevel] = useState('all')
  const [subject, setSubject] = useState('all')
  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || (p.subject && p.subject.toLowerCase().includes(search.toLowerCase()))
    const matchCategory = category === 'all' || p.category === category
    const matchLevel = classLevel === 'all' || p.classLevel === classLevel
    const matchSubject = subject === 'all' || p.subject === subject
    return matchSearch && matchCategory && matchLevel && matchSubject
  }), [search, category, classLevel, subject])
  const reset = () => { setSearch(''); setCategory('all'); setClassLevel('all'); setSubject('all') }
  return { search, setSearch, category, setCategory, classLevel, setClassLevel, subject, setSubject, filtered, reset, hasFilters: category !== 'all' || classLevel !== 'all' || subject !== 'all' || search !== '' }
}
