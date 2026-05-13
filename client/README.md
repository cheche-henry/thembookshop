# Them Bookshop — Client

React SPA for Kenya's school supply e-commerce store. Built with Vite, Tailwind CSS, and Zustand.

## Prerequisites

- Node.js 18+, npm

## Setup

```bash
npm install
cp .env.example .env
```

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Rails API base URL |

## Running

```bash
npm run dev          # dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview production build
```

## Project Structure

```
src/
├── admin/               # Admin panel (JWT-protected)
│   ├── components/      #  AdminLayout, AdminTable, StatusBadge, etc.
│   ├── pages/           #  Dashboard, Orders, Products, Settings, Login
│   ├── context/         #  authStore (Zustand + localStorage)
│   ├── hooks/           #  useApi, useMutation
│   └── utils/           #  api client (auto-attaches JWT)
├── components/          # Reusable UI
│   ├── Navbar.jsx       #  Sticky header, search, cart badge
│   ├── Footer.jsx       #  Links, contact, categories
│   ├── ProductCard.jsx  #  Product grid card with image fallback
│   ├── CartItem.jsx     #  Cart line with quantity stepper
│   ├── FilterSidebar.jsx # Category / class / subject filters
│   ├── Field.jsx        #  Form field wrapper with validation
│   ├── ErrorBoundary.jsx # React error boundary
│   ├── SkeletonCard.jsx #  Loading skeleton
│   └── EmptyState.jsx   #  Empty search / cart states
├── pages/               # Route-level pages
│   ├── HomePage.jsx     #  Hero, categories, featured products
│   ├── ShopPage.jsx     #  Product grid + filters + pagination
│   ├── ProductDetailPage.jsx # Full product view + related items
│   ├── CartPage.jsx     #  Cart with order summary
│   ├── CheckoutPage.jsx #  Customer form + M-Pesa payment flow
│   └── NotFoundPage.jsx #  404 page
├── context/
│   └── cartStore.js     # Zustand cart (persisted to localStorage)
├── hooks/
│   └── useFilters.js    # Debounced search + filter state
└── utils/
    └── format.js        # KES formatter, badge colour helpers
```

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/shop` | Product listing with search + filters |
| `/product/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with M-Pesa |
| `/admin/login` | Admin authentication |
| `/admin` | Dashboard |
| `/admin/orders` | Order management |
| `/admin/orders/:id` | Order detail |
| `/admin/products` | Product management |
| `/admin/products/new` | Create product |
| `/admin/products/:id/edit` | Edit product |
| `/admin/settings` | Admin profile settings |
| `*` | 404 |

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Zustand** (state management + persist middleware)
- **React Router v6**
- **Lucide React** (icons)

## Key Patterns

- **Image fallback**: All product images gracefully degrade to a BookOpen icon on load error
- **Fresh prices**: Checkout fetches current product prices from the API to avoid stale localStorage data
- **Cancelled fetches**: Product detail page uses a `cancelled` flag to prevent state updates after unmount
- **Debounced search**: Filter search debounces at 350ms; category/level/subject changes fire instantly
- **Error boundary**: Top-level ErrorBoundary catches render crashes with a recovery UI
