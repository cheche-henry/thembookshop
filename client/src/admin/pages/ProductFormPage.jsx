import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ImageOff, Minus, Plus, Upload } from 'lucide-react'
import { api } from '../utils/api'
import { Input, Select, Textarea } from '../../components/ui/Form'
import { Button } from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import {
  TAXONOMY, DEPARTMENTS, SUBJECTS, SUBJECT_COMPONENTS, STAGES, CLASS_LEVELS, BADGES,
} from '../../utils/catalogue'

// Used until /api/v1/products/meta resolves, and if the request fails.
const FALLBACK_META = {
  categories:  DEPARTMENTS.map((name) => ({ name, subcategories: TAXONOMY[name] })),
  subjects:    SUBJECTS.map((name) => ({ name, components: SUBJECT_COMPONENTS[name] || [] })),
  stages:      Object.entries(STAGES).map(([name, levels]) => ({ name, levels })),
  class_levels: CLASS_LEVELS,
  badges:      BADGES,
}

const EMPTY = {
  name: '', description: '', price: '',
  category: '', subcategory: '',
  stage: '', class_levels: [],
  subject: '', subsubject: '',
  stock_quantity: '0', active: true, badge: '', sort_order: '0',
}

function Panel({ title, description, children }) {
  return (
    <section className="border border-line bg-surface">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </section>
  )
}

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const fileRef = useRef()
  const { toast } = useToast()

  const [form, setForm] = useState(EMPTY)
  const [meta, setMeta] = useState(FALLBACK_META)
  const [rawName, setRawName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [restockQty, setRestock] = useState(0)
  const [restocking, setRestocking] = useState(false)
  const [imageModal, setImageModal] = useState(false)
  const stockFocused = useRef(false)

  // Taxonomy comes from the API so the form and storefront cannot drift apart.
  useEffect(() => {
    api.products.catalogueMeta()
      .then((res) => { if (res?.data) setMeta(res.data) })
      .catch(() => { /* keep the bundled fallback */ })
  }, [])

  useEffect(() => {
    if (!isEdit) return

    api.products.get(id)
      .then((res) => {
        const product = res.data
        const levels = Array.isArray(product.class_levels) && product.class_levels.length
          ? product.class_levels
          : (product.class_level ? [product.class_level] : [])

        setForm({
          name:           product.name || '',
          description:    product.description || '',
          price:          product.price || '',
          category:       product.category || '',
          subcategory:    product.subcategory || '',
          stage:          product.stage || '',
          class_levels:   levels,
          subject:        product.subject || '',
          subsubject:     product.subsubject || '',
          stock_quantity: String(product.stock_quantity ?? '0'),
          active:         product.active ?? true,
          badge:          product.badge || '',
          sort_order:     product.sort_order ?? '0',
        })
        setRawName(product.raw_name || '')
        setExistingImage(product.image_url || null)
        setLoading(false)
      })
      .catch((loadError) => {
        toast({ title: 'Product could not be loaded', description: loadError.message, tone: 'error' })
        navigate('/admin/products')
      })
  }, [id, isEdit, navigate, toast])

  const subcategories = meta.categories.find((entry) => entry.name === form.category)?.subcategories || []
  const components = meta.subjects.find((entry) => entry.name === form.subject)?.components || []
  const levelOrder = meta.class_levels || CLASS_LEVELS

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: null }))
  }

  const setCategory = (value) => {
    // A subcategory only exists inside its department.
    setForm((current) => ({ ...current, category: value, subcategory: '' }))
    setErrors((current) => ({ ...current, category: null, subcategory: null }))
  }

  const setSubject = (value) => {
    // Fasihi is a component of Kiswahili, not a peer subject.
    setForm((current) => ({ ...current, subject: value, subsubject: '' }))
    setErrors((current) => ({ ...current, subject: null, subsubject: null }))
  }

  const toggleLevel = (level) => {
    setForm((current) => {
      const next = current.class_levels.includes(level)
        ? current.class_levels.filter((entry) => entry !== level)
        : [...current.class_levels, level]
      next.sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b))
      return { ...current, class_levels: next }
    })
    setErrors((current) => ({ ...current, class_levels: null }))
  }

  const handleImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((previous) => ({ ...previous, image: 'Choose a JPEG, PNG or WebP file.' }))
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({ ...previous, image: 'The image must be smaller than 5 MB.' }))
      event.target.value = ''
      return
    }

    setErrors((previous) => ({ ...previous, image: null }))
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter the product name.'
    if (!form.price || Number(form.price) <= 0) next.price = 'Enter a price greater than zero.'
    if (!form.category) next.category = 'Choose a department.'
    if (!form.subcategory) next.subcategory = 'Choose a subcategory.'
    if (form.subsubject && !form.subject) next.subject = 'Choose a subject before its component.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)

    try {
      const data = new FormData()

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'class_levels') return

        if (typeof value === 'boolean') {
          data.append(`product[${key}]`, value ? 'true' : 'false')
        } else {
          data.append(`product[${key}]`, value ?? '')
        }
      })

      if (form.class_levels.length) {
        form.class_levels.forEach((level) => data.append('product[class_levels][]', level))
      } else {
        // Sends an empty array so clearing every level is possible on update.
        data.append('product[class_levels][]', '')
      }

      if (imageFile) data.append('product[image]', imageFile)

      if (isEdit) await api.products.update(id, data)
      else await api.products.create(data)

      toast({ title: isEdit ? 'Product saved' : 'Product created', description: form.name.trim() })
      navigate('/admin/products')
    } catch (submitError) {
      toast({ title: 'Product could not be saved', description: submitError.message, tone: 'error' })
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
        setForm((current) => ({ ...current, stock_quantity: String(res.data.stock_quantity) }))
      }
      setRestock(0)
      toast({ title: 'Stock updated', description: `Now ${res.data.stock_quantity} in stock.` })
    } catch (restockError) {
      toast({ title: 'Stock could not be updated', description: restockError.message, tone: 'error' })
    } finally {
      setRestocking(false)
    }
  }

  const handleRemoveImage = async () => {
    setImageModal(false)

    try {
      await api.products.removeImage(id)
      setExistingImage(null)
      toast({ title: 'Image removed' })
    } catch (removeError) {
      toast({ title: 'Image could not be removed', description: removeError.message, tone: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4" aria-busy="true">
        <div className="skeleton h-5 w-40 rounded-sm" />
        <div className="skeleton h-64 rounded-md" />
        <div className="skeleton h-80 rounded-md" />
      </div>
    )
  }

  const preview = imagePreview || existingImage

  return (
    <div className="max-w-3xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/admin/products" className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-ink">{isEdit ? 'Edit product' : 'New product'}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold text-ink">{isEdit ? 'Edit product' : 'Add product'}</h1>
        {isEdit && rawName && (
          <p className="mt-1 text-xs text-muted">
            Imported row: <span className="font-mono text-body">{rawName}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel title="Details" description="How the product appears on its own page.">
          <Input
            label="Product name"
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="KLB Mathematics Grade 4"
            error={errors.name}
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            placeholder="What the book or item covers"
            rows={4}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price (KES)"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.price}
              onChange={(event) => set('price', event.target.value)}
              placeholder="380"
              error={errors.price}
            />
            <Input
              label="Stock quantity"
              type="text"
              inputMode="numeric"
              value={form.stock_quantity}
              onChange={(event) => {
                const value = event.target.value
                if (value === '' || /^\d+$/.test(value)) set('stock_quantity', value)
              }}
              onFocus={() => { stockFocused.current = true }}
              onBlur={() => { stockFocused.current = false }}
            />
          </div>
        </Panel>

        <Panel title="Catalogue" description="Used by the shop filters and search.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Department"
              value={form.category}
              onChange={(event) => setCategory(event.target.value)}
              error={errors.category}
            >
              <option value="">Select department</option>
              {meta.categories.map((entry) => (
                <option key={entry.name} value={entry.name}>{entry.name}</option>
              ))}
            </Select>
            <Select
              label="Subcategory"
              value={form.subcategory}
              onChange={(event) => set('subcategory', event.target.value)}
              error={errors.subcategory}
              disabled={!form.category}
            >
              <option value="">{form.category ? 'Select subcategory' : 'Choose a department first'}</option>
              {subcategories.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Subject"
              optional
              value={form.subject}
              onChange={(event) => setSubject(event.target.value)}
              error={errors.subject}
            >
              <option value="">Not subject-specific</option>
              {meta.subjects.map((entry) => (
                <option key={entry.name} value={entry.name}>{entry.name}</option>
              ))}
            </Select>
            <Select
              label="Subject component"
              optional
              value={form.subsubject}
              onChange={(event) => set('subsubject', event.target.value)}
              disabled={!components.length}
            >
              <option value="">{components.length ? 'None' : 'No components'}</option>
              {components.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Stage-wide level"
              optional
              value={form.stage}
              onChange={(event) => set('stage', event.target.value)}
              hint="For references that span a stage, such as atlases."
            >
              <option value="">Not stage-wide</option>
              {meta.stages.map((stage) => (
                <option key={stage.name} value={stage.name}>{stage.name}</option>
              ))}
            </Select>
            <Select
              label="Badge"
              optional
              value={form.badge}
              onChange={(event) => set('badge', event.target.value)}
            >
              <option value="">None</option>
              {meta.badges.map((badge) => (
                <option key={badge} value={badge}>{badge}</option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-ink">Class levels</span>
              {form.class_levels.length > 0 && (
                <button
                  type="button"
                  onClick={() => set('class_levels', [])}
                  className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Clear levels
                </button>
              )}
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted">
              Select every level this product serves. A book used in both Form 3 and Form 4 needs both selected.
            </p>

            <div className="space-y-3">
              {meta.stages.map((stage) => (
                <div key={stage.name}>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{stage.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stage.levels.map((level) => {
                      const selected = form.class_levels.includes(level)
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => toggleLevel(level)}
                          aria-pressed={selected}
                          className={`rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : 'border-line-strong bg-surface text-body hover:border-brand-700 hover:text-brand-800'
                          }`}
                        >
                          {level}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
            <label className="flex cursor-pointer items-center gap-3">
              <span className="relative inline-flex">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => set('active', event.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-brand-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-700/30 peer-focus-visible:ring-offset-2" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
              <span className="text-sm text-body">Visible in the store</span>
            </label>

            <div className="w-32">
              <Input
                label="Sort order"
                type="text"
                inputMode="numeric"
                value={form.sort_order}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === '' || /^-?\d+$/.test(value)) set('sort_order', value)
                }}
              />
            </div>
          </div>
        </Panel>

        <Panel title="Product image" description="JPEG, PNG or WebP up to 5 MB.">
          {preview ? (
            <div className="flex flex-wrap items-start gap-5">
              <div className="w-40 flex-shrink-0 border border-line bg-muted-surface p-2">
                <div className="aspect-[2/3]">
                  <img src={preview} alt="Product preview" className="h-full w-full object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Replace image
                </Button>
                <Button
                  type="button"
                  variant="danger-ghost"
                  size="sm"
                  onClick={() => {
                    if (imagePreview) {
                      setImageFile(null)
                      setImagePreview(null)
                    } else {
                      setImageModal(true)
                    }
                  }}
                >
                  <ImageOff className="h-4 w-4" aria-hidden="true" />
                  {imagePreview ? 'Discard selection' : 'Remove image'}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-paper px-6 py-10 text-muted transition-colors hover:border-brand-700 hover:text-brand-800"
            >
              <Upload className="h-6 w-6" aria-hidden="true" />
              <span className="text-sm font-medium">Choose an image</span>
              <span className="text-xs">JPEG, PNG or WebP</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImage}
            className="sr-only"
            tabIndex={-1}
          />

          {errors.image && <p className="text-xs text-danger">{errors.image}</p>}
        </Panel>

        {isEdit && (
          <Panel title="Quick restock" description="Adds units to the current stock count.">
            <p className="text-sm text-body">
              Current stock: <span className="font-semibold tabular-nums text-ink">{form.stock_quantity}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-md border border-line-strong">
                <button
                  type="button"
                  onClick={() => setRestock((value) => Math.max(0, value - 1))}
                  className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink"
                  aria-label="Decrease restock quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-semibold tabular-nums text-ink">{restockQty}</span>
                <button
                  type="button"
                  onClick={() => setRestock((value) => value + 1)}
                  className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-muted-surface hover:text-ink"
                  aria-label="Increase restock quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleRestock}
                loading={restocking}
                disabled={restockQty <= 0}
              >
                Add {restockQty} {restockQty === 1 ? 'unit' : 'units'}
              </Button>
            </div>
          </Panel>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>

      <Modal
        open={imageModal}
        onClose={() => setImageModal(false)}
        title="Remove the product image?"
        description="The product stays published with a placeholder cover until a new image is uploaded."
        size="sm"
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setImageModal(false)}>Keep image</Button>
          <Button variant="danger" onClick={handleRemoveImage}>Remove image</Button>
        </div>
      </Modal>
    </div>
  )
}
