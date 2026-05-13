# Them Bookshop — API

Ruby on Rails 7.1 API-only backend for Kenya's school supply e-commerce store. Handles products, guest orders, M-Pesa payments, and admin management.

## Prerequisites

- Ruby 3.2.2
- Bundler
- PostgreSQL (running)
- Redis (running — for Sidekiq)

## Setup

```bash
cp .env.example .env
bundle install
rails db:create db:migrate db:seed
```

### Environment Variables

Key variables — see `.env.example` for all:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection |
| `SECRET_KEY_BASE` | Yes | — | Rails secret key base |
| `JWT_SECRET` | Yes | — | Admin JWT signing key (HS256) |
| `JWT_EXPIRY_HOURS` | No | 24 | Token lifetime |
| `MPESA_CONSUMER_KEY` | Yes* | — | Daraja API consumer key |
| `MPESA_CONSUMER_SECRET` | Yes* | — | Daraja API consumer secret |
| `MPESA_SHORTCODE` | Yes* | 174379 | Paybill/Till number |
| `MPESA_PASSKEY` | Yes* | — | Daraja online passkey |
| `MPESA_CALLBACK_URL` | Yes* | — | Public URL for M-Pesa callbacks |
| `MPESA_ENV` | No | sandbox | `sandbox` or `production` |
| `SMTP_HOST` | No | smtp.gmail.com | SMTP server |
| `SMTP_PORT` | No | 587 | SMTP port |
| `SMTP_USERNAME` | Yes† | — | SMTP login |
| `SMTP_PASSWORD` | Yes† | — | SMTP password (app password for Gmail) |
| `MAIL_FROM` | No | noreply@thembookshop.co.ke | From address for customer emails |
| `ADMIN_EMAIL_NOTIFY` | Yes† | — | Where admin order alerts go |
| `FRONTEND_URL` | No | http://localhost:5173 | For email links and CORS |
| `APP_HOST` | No | http://localhost:3000 | For Active Storage URL generation |
| `CORS_ORIGINS` | No | localhost:5173 | Comma-separated allowed origins |
| `REDIS_URL` | Yes* | redis://localhost:6379/0 | Sidekiq connection |
| `AWS_*` | No | — | S3 for production Active Storage (use R2 instead) |

\* Required for M-Pesa / Sidekiq in production
† Required if sending emails

## Running

```bash
rails s                     # API → http://localhost:3000

# In separate terminal:
bundle exec sidekiq         # Background jobs (emails, M-Pesa status polling)
```

## Database

```bash
rails db:create             # Create database
rails db:migrate            # Run migrations
rails db:seed               # Seed 30 products + admin user
rails db:seed:replant       # Reset + re-seed
```

## API Endpoints

### Public (no auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/products` | List products (filterable: `category`, `class_level`, `subject`, `q`) |
| `GET` | `/api/v1/products/:id` | Single product |
| `POST` | `/api/v1/orders` | Create order (triggers M-Pesa STK Push) |
| `GET` | `/api/v1/orders/:reference` | Lookup order by reference |
| `POST` | `/api/v1/payments/mpesa` | Manual M-Pesa STK Push re-trigger |
| `POST` | `/api/v1/payments/callback` | Safaricom M-Pesa callback webhook |

### Admin (JWT required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/auth/login` | Login (returns JWT) |
| `GET` | `/admin/auth/me` | Current admin profile |
| `PATCH` | `/admin/auth/credentials` | Update email/password |
| `GET` | `/admin/orders` | List orders (filterable: `status`, `q`, `from`, `to`) |
| `GET` | `/admin/orders/:id` | Order detail with items + payments |
| `PATCH` | `/admin/orders/:id/update_status` | Transition order status |
| `POST` | `/admin/orders/:id/cancel` | Cancel order (restores stock) |
| `GET` | `/admin/orders/stats` | Dashboard metrics |
| `GET` | `/admin/products` | List all products (including inactive) |
| `GET` | `/admin/products/:id` | Product detail |
| `POST` | `/admin/products` | Create product |
| `PATCH` | `/admin/products/:id` | Update product |
| `DELETE` | `/admin/products/:id` | Delete (or soft-delete if has orders) |
| `POST` | `/admin/products/:id/upload_image` | Upload product image |
| `DELETE` | `/admin/products/:id/remove_image` | Remove product image |
| `PATCH` | `/admin/products/:id/restock` | Add stock quantity |
| `GET` | `/admin/products/low_stock` | Products below threshold |

## Models

| Model | Key Fields |
|---|---|
| `Product` | name, price, category, class_level, subject, stock_quantity, badge, active |
| `Order` | reference, customer_name/phone/email, delivery_address, subtotal, delivery_fee, total_amount, status |
| `OrderItem` | product_id, quantity, unit_price, total_price, product_name_snapshot |
| `Payment` | order_id, method (mpesa), status, amount, phone_number, mpesa_receipt_number |
| `AdminUser` | email, password_digest, name, phone, active |

## Order State Machine

```
pending → payment_initiated → paid → processing → completed
                              ↓
                          failed / cancelled
```

- `cancelled` can transition from any state except `completed`
- Cancellation restores stock automatically
- Failed payments restore stock automatically

## Services

| Service | File | Purpose |
|---|---|---|
| `OrderCreator` | `app/services/order_creator.rb` | Validates stock, creates order + items, deducts inventory (transactional) |
| `MpesaService` | `app/services/mpesa_service.rb` | Daraja OAuth + STK Push + status query (Faraday) |
| `JsonWebToken` | `app/services/json_web_token.rb` | JWT encode/decode (HS256) |

## Background Jobs

| Job | Queue | Trigger |
|---|---|---|
| `OrderNotificationJob` | `mailers` | Order created, payment received, status update |
| `MpesaStatusCheckJob` | `default` | Polls M-Pesa for pending payments (scheduled, retry 5x) |

## Tests

```bash
bundle exec rspec
```

Test suite uses RSpec, FactoryBot, Shoulda Matchers, WebMock, and VCR.
