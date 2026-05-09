# 📚 Them Bookshop

Kenya's trusted school supply e-commerce store — a fully responsive React frontend for browsing and purchasing primary & secondary school learning materials.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Running

```bash
# 1. Unzip the project folder
cd them-bookshop

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Navbar.jsx         – Sticky header with search + cart
│   ├── Footer.jsx         – Links, contact, categories
│   ├── ProductCard.jsx    – Product grid card
│   ├── CartItem.jsx       – Cart line item with qty controls
│   ├── FilterSidebar.jsx  – Category / class / subject filters
│   ├── SkeletonCard.jsx   – Loading skeleton animation
│   └── EmptyState.jsx     – Empty cart / no results states
│
├── pages/              # Full page components (routed)
│   ├── HomePage.jsx       – Hero, categories, featured products
│   ├── ShopPage.jsx       – Product grid + search + filters
│   ├── ProductDetailPage.jsx – Single product view
│   ├── CartPage.jsx       – Cart items + order summary
│   └── CheckoutPage.jsx   – Customer form + M-Pesa UI
│
├── context/
│   └── cartStore.js       – Zustand cart store (persisted to localStorage)
│
├── hooks/
│   └── useFilters.js      – Filter/search logic with useMemo
│
├── utils/
│   └── format.js          – KES formatter, badge colour helpers
│
├── data/
│   └── products.js        – 30 mock products + filter option arrays
│
├── App.jsx             – Router setup, scroll-to-top
├── main.jsx            – React entry point
└── index.css           – Tailwind base + custom utility classes
```

---

## 🎨 Design Decisions

| Choice | Reason |
|---|---|
| **Nunito** (display) + **DM Sans** (body) | Friendly, readable, educational feel |
| **Green + Sky Blue** palette | Fresh, trustworthy, school-appropriate |
| **Zustand** for cart | Lightweight, easy localStorage persistence |
| **Mobile-first** layout | Most Kenyan parents browse on phones |
| **Filter chips** (active filters shown) | Clear UX for non-technical users |
| **Skeleton loaders** | Smooth perceived performance |

---

## 🔌 Where to Add Backend Integration

### 1. Product Data (`src/data/products.js`)
Replace the exported `products` array with an API call:
```js
// TODO: Replace with:
const { data: products } = await fetch('/api/products').then(r => r.json())
```

### 2. Cart Store (`src/context/cartStore.js`)
When a user account system is ready, sync cart to the backend on add/remove.

### 3. Checkout (`src/pages/CheckoutPage.jsx`)
Look for the comment `// TODO: Call M-Pesa STK Push API here` and integrate:
- **Safaricom Daraja API** — STK Push (`/mpesa/stkpush/v1/processrequest`)
- Your Node.js/Django/Laravel backend handles the OAuth token + callback

```js
// TODO: Replace fake submit with:
const res = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({ items, customer: form, total }),
})
const { orderId, mpesaPromptSent } = await res.json()
```

### 4. Images
Replace `images.unsplash.com` URLs with your own product images hosted on Cloudinary, S3, or a CDN.

---

## 📱 Pages

| Route | Page |
|---|---|
| `/` | Home — hero, categories, featured products |
| `/shop` | Shop — all products with filters + search |
| `/product/:id` | Product detail — image, description, add to cart |
| `/cart` | Cart — items, quantities, totals |
| `/checkout` | Checkout — customer form + M-Pesa button (UI only) |

---

## ✅ Features

- [x] 30 mock products (textbooks, revision, stationery, bags)
- [x] Filter by category, class level, subject
- [x] Full-text search
- [x] Active filter chips with one-click clear
- [x] Persistent cart (localStorage via Zustand)
- [x] Add/remove/update quantity in cart
- [x] Responsive mobile-first layout
- [x] Loading skeleton animations
- [x] Empty states (no products, empty cart)
- [x] Back to School promotional banner
- [x] Checkout form with validation
- [x] M-Pesa payment UI (frontend only)
- [x] Product detail page with related items
- [x] Breadcrumb navigation

---

## 🛠 Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS 3**
- **Zustand** (cart state + localStorage)
- **React Router v6**
- **Lucide React** (icons)
- **Google Fonts** – Nunito + DM Sans

---

*Built for Them Bookshop, Kenya 🇰🇪*
