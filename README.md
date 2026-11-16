# Them Bookshop

Kenyan e-commerce platform for school books and supplies — CBC and KCSE aligned. React frontend, Rails API, M-Pesa payments.

## Architecture

```
them-bookshop/
├── api/          # Ruby on Rails 7.1 API (PostgreSQL, Sidekiq, M-Pesa)
└── client/       # React 18 + Vite SPA (Tailwind, Zustand)
```

## Quick Start

### Prerequisites
- Ruby 3.3.4, Bundler
- Node.js 20+, npm
- PostgreSQL running
- Redis running (for Sidekiq and rate limiting)

### API

```bash
cd api
cp .env.example .env      # edit with your credentials
bundle install
rails db:create db:migrate db:seed
rails s                    # → http://localhost:3000
```

### Client

```bash
cd client
npm install
cp .env.example .env
npm run dev                # → http://localhost:5173
```

### Admin Panel

Login at `http://localhost:5173/admin/login`.

The first admin account is created by `rails db:seed` from `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in `api/.env` (defaults live in `.env.example`). Change both
before seeding anything other than a local development database.

### Background Jobs

```bash
bundle exec sidekiq        # processes email & M-Pesa status check jobs
```

## Features

### Store (Public)
- Product catalog with filtering (category, class level, subject, search)
- Product detail page with related items
- Cart persisted to localStorage via Zustand
- Guest checkout with M-Pesa STK Push payments
- Order lookup by reference + the phone number used at checkout
- Order confirmation page with payment status

### Admin
- Dashboard with revenue stats, order counts, low-stock alerts
- Order management with status state machine (pending → paid → processing → completed)
- Product CRUD with image upload via Active Storage
- Product restock and low-stock filtering
- JWT-based authentication
- Order cancellation with automatic stock restoration

### Payments
- M-Pesa Daraja API integration (STK Push)
- Authenticated callback handler (shared token and/or IP allowlist)
- Automatic stock restore on payment failure (idempotent)
- Asynchronous M-Pesa status polling via Sidekiq

### Emails
- Order confirmation, payment received, status update
- Admin new-order alerts
- SMTP via Gmail or any provider, sent asynchronously via Sidekiq

## Deployment Overview

| Service | Recommended | Cost |
|---|---|---|
| Frontend | Cloudflare Pages / Vercel | Free |
| API + workers | Oracle Cloud Free Tier VM | Free |
| Database | Supabase (PostgreSQL) | Free (500 MB) |
| Redis | Upstash | Free (100 MB) |
| File storage | Cloudflare R2 (S3-compatible) | Free (10 GB) |
| Email | Cloudflare Email Routing → Gmail SMTP | Free |
| Domain | Namecheap / Cloudflare | ~$10/yr |

### Environment Variables (`api/.env`)

Key variables — see `.env.example` for full list:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Token signing key |
| `MPESA_*` | Safaricom Daraja API credentials |
| `MPESA_CALLBACK_URL` | Must be `https://<api-host>/api/v1/payments/callback` (append `?token=…` when `MPESA_CALLBACK_TOKEN` is set) |
| `MPESA_CALLBACK_TOKEN` | Shared secret required on callbacks (strongly recommended) |
| `MPESA_CALLBACK_IPS` | Optional comma-separated Safaricom source IPs |
| `SMTP_*` | Email sending (Gmail app password) |
| `CORS_ORIGINS` | Allowed frontend origins |
| `FRONTEND_URL` | For email links and CORS |
| `APP_HOST` | Public API base URL used for uploaded image URLs |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account created by the seed |
