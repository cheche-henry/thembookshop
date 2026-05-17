import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, X, Plus, Minus, Package } from 'lucide-react'
import { api } from '../utils/api'
import { Input, Select, Textarea, Btn } from '../components/AdminInput'

const CATEGORIES  = ['Textbooks','Revision Books','Storybooks','Exercise Books','Pens & Pencils','Geometry Sets','Rulers','School Bags']
const CLASS_LEVELS = ['','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Form 1','Form 2','Form 3','Form 4']
const SUBJECTS    = ['','Mathematics','English','Science','Kiswahili','Biology','Chemistry','Physics','Geography','History','Social Studies','Creative Arts']
const BADGES      = ['','Best Seller','New','New Edition','Popular','Exam Prep','Bundle Deal','Value Pack','Kids Favorite']

const EMPTY = { name:'', description:'', price:'', category:'', class_level:'', subject:'', stock_quantity:'0', active: true, badge:'', sort_order:'0' }

export default function ProductFormPage() {
  const { id }              = useParams()
  const isEdit              = Boolean(id)
  const navigate            = useNavigate()
  const fileRef             = useRef()

  const [form, setForm]           = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImgPrev] = useState(null)
  const [existingImage, setExisting] = useState(null)
  const [loading, setLoading]     = useState(isEdit)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})
  const [restockQty, setRestock]  = useState(0)
  const [restocking, setRestocking] = useState(false)
  const stockFocused = useRef(false)

  useEffect(() => {
    if (!isEdit) return
    api.products.get(id).then(res => {
      const p = res.data
      setForm({
        name:           p.name || '',
        description:    p.description || '',
        price:          p.price || '',
        category:       p.category || '',
        class_level:    p.class_level || '',
        subject:        p.subject || '',
        stock_quantity: String(p.stock_quantity ?? '0'),
        active:         p.active ?? true,
        badge:          p.badge || '',
        sort_order:     p.sort_order ?? '0',
      })
      setExisting(p.image_url)
      setLoading(false)
    }).catch(e => { alert(e.message); navigate('/admin/products') })
  }, [id])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: null }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImgPrev(URL.createObjectURL(file))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name     = 'Name is required'
    if (!form.price)          e.price    = 'Price is required'
    if (isNaN(form.price) || Number(form.price) <= 0) e.price = 'Price must be a positive number'
    if (!form.category)       e.category = 'Category is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(`product[${k}]`, v))
      if (imageFile) fd.append('product[image]', imageFile)

      if (isEdit) {
        await api.products.update(id, fd)
      } else {
        await api.products.create(fd)
      }
      navigate('/admin/products')
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRestock = async () => {
    if (!restockQty || restockQty <= 0) return
    setRestocking(true)
    try {
      const res = await api.products.restock(id, restockQty)
      if (!stockFocused.current) {
        setForm(f => ({ ...f, stock_quantity: String(res.data.stock_quantity) }))
      }
      setRestock(0)
      alert(`Stock updated to ${res.data.stock_quantity}`)
    } catch (e) {
      alert(e.message)
    } finally {
      setRestocking(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!confirm('Remove product image?')) return
    try {
      await api.products.removeImage(id)
      setExisting(null)
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-3xl">
      <div className="h-6 bg-white/5 rounded w-32" />
      <div className="h-96 bg-white/5 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/products" className="text-gray-500 hover:text-green-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Products
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300">{isEdit ? 'Edit Product' : 'New Product'}</span>
      </div>

      <h1 className="text-white font-bold text-2xl">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400">Basic Info</h2>

          <Input
            label="Product Name"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. KLB Mathematics Grade 4"
            error={errors.name}
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the product…"
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (KES)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="380"
              error={errors.price}
            />
            <Input
              label="Stock Quantity"
              type="text"
              inputMode="numeric"
              value={form.stock_quantity}
              onChange={e => {
                const v = e.target.value
                if (v === '' || /^\d+$/.test(v)) set('stock_quantity', v)
              }}
              onFocus={() => { stockFocused.current = true }}
              onBlur={() => { stockFocused.current = false }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              error={errors.category}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select
              label="Badge (optional)"
              value={form.badge}
              onChange={e => set('badge', e.target.value)}
            >
              {BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Class Level" value={form.class_level} onChange={e => set('class_level', e.target.value)}>
              {CLASS_LEVELS.map(l => <option key={l} value={l}>{l || '— Not applicable —'}</option>)}
            </Select>
            <Select label="Subject" value={form.subject} onChange={e => set('subject', e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s || '— Not applicable —'}</option>)}
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="sr-only" />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-700'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-gray-300">Active (visible in store)</span>
            </label>
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400">Product Image</h2>

          {(imagePreview || existingImage) ? (
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-white/10 group">
              <img src={imagePreview || existingImage} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImgPrev(null); if (!imagePreview) handleRemoveImage() }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-48 h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600 hover:border-green-500/50 hover:text-green-500 transition-all group"
            >
              <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Upload Image</span>
              <span className="text-xs mt-1">JPEG, PNG, WebP</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" />

          {!imagePreview && !existingImage && (
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
              <Upload className="w-4 h-4" /> Choose file
            </button>
          )}
        </div>

        {/* Restock (edit only) */}
        {isEdit && (
          <div className="bg-gray-900 border border-amber-500/20 rounded-2xl p-6 space-y-3">
            <h2 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Quick Restock</h2>
            <p className="text-gray-500 text-xs">Current stock: <span className="text-white font-semibold">{form.stock_quantity}</span></p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                <button type="button" onClick={() => setRestock(q => Math.max(0, q-1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-white font-bold text-sm">{restockQty}</span>
                <button type="button" onClick={() => setRestock(q => q+1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Btn type="button" variant="secondary" onClick={handleRestock} loading={restocking} disabled={restockQty <= 0}>
                Add {restockQty} units
              </Btn>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Btn type="button" variant="ghost" onClick={() => navigate('/admin/products')}>Cancel</Btn>
          <Btn type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Btn>
        </div>
      </form>
    </div>
  )
}
