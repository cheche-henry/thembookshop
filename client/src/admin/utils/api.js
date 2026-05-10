// ── API client for admin ───────────────────────────────────────────────────
// All requests automatically include the JWT token from localStorage

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken() {
  try {
    const raw = localStorage.getItem('tbsadmin-auth')
    return raw ? JSON.parse(raw)?.state?.token : null
  } catch { return null }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) delete headers['Content-Type']

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data.message || data.error || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),

  // ── Auth ──────────────────────────────────────────────────────────────────
  login:   (email, password) => request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me:      ()                => request('/admin/auth/me'),
  updateCredentials: (body)  => request('/admin/auth/credentials', { method: 'PATCH', body: JSON.stringify(body) }),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  stats: () => request('/admin/orders/stats'),

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    list:        (params = {}) => request('/admin/products?' + new URLSearchParams(params)),
    get:         (id)          => request(`/admin/products/${id}`),
    create:      (formData)    => request('/admin/products', { method: 'POST',   body: formData }),
    update:      (id, formData)=> request(`/admin/products/${id}`, { method: 'PATCH', body: formData }),
    delete:      (id)          => request(`/admin/products/${id}`, { method: 'DELETE' }),
    uploadImage: (id, formData)=> request(`/admin/products/${id}/upload_image`, { method: 'POST', body: formData }),
    removeImage: (id)          => request(`/admin/products/${id}/remove_image`, { method: 'DELETE' }),
    restock:     (id, qty)     => request(`/admin/products/${id}/restock`, { method: 'PATCH', body: JSON.stringify({ quantity: qty }) }),
    lowStock:    ()            => request('/admin/products/low_stock'),
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    list:         (params = {}) => request('/admin/orders?' + new URLSearchParams(params)),
    get:          (id)          => request(`/admin/orders/${id}`),
    updateStatus: (id, status)  => request(`/admin/orders/${id}/update_status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    cancel:       (id, reason)  => request(`/admin/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
    stats:        ()            => request('/admin/orders/stats'),
  },
}
