# 🌿 KidEnDu — Backend API

> A production-grade REST API for the KidEnDu personal-brand e-commerce platform. Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**, it covers authentication, product management, cart, orders, Stripe payments, reviews, messaging, notifications, coupons, and admin analytics.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Security & Middleware Stack](#security--middleware-stack)
- [Authentication Flow](#authentication-flow)
- [Data Models](#data-models)
- [API Documentation](#api-documentation)
  - [Health Check](#health-check)
  - [Auth](#auth-apiaauth)
  - [Users](#users-apiusers)
  - [Products](#products-apiproducts)
  - [Cart](#cart-apicart)
  - [Wishlist](#wishlist-apiwishlist)
  - [Orders](#orders-apiorders)
  - [Payments](#payments-apipayments)
  - [Reviews](#reviews-apireviews)
  - [Coupons](#coupons-apicoupons)
  - [Messages](#messages-apimessages)
  - [Notifications](#notifications-apinotifications)
  - [Analytics (Admin)](#analytics-apiadminanalytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Language | TypeScript 5 |
| Framework | Express.js |
| Database | MongoDB via Mongoose |
| Authentication | JWT (Access + Refresh tokens) + OTP email verification |
| File Uploads | Multer (memory) + Cloudinary |
| Payments | Stripe (PaymentIntents + Webhooks) |
| Email | Nodemailer (SMTP) or Resend API |
| Validation | Zod (schema-first, runs before controllers) |
| Security | Helmet, CORS, express-mongo-sanitize, express-rate-limit |
| Logging | Morgan (dev: colorized, prod: Apache Combined) |
| Env validation | Zod at startup — crashes fast on misconfiguration |

---

## Project Architecture

```
Client (React/Next.js)
        │
        ▼
   Express App (app.ts)
        │
   ┌────┴────────────────────────────────────┐
   │   Security Middleware Stack              │
   │   Helmet · CORS · Mongo-Sanitize         │
   │   Cookie-Parser · Morgan · Rate Limiter  │
   └────┬────────────────────────────────────┘
        │
   ┌────┴──────────────────────┐
   │   Router Layer (routes/)  │
   │   /api/auth               │
   │   /api/users              │
   │   /api/products           │
   │   /api/cart               │
   │   /api/wishlist           │
   │   /api/orders             │
   │   /api/payments           │
   │   /api/reviews            │
   │   /api/coupons            │
   │   /api/messages           │
   │   /api/notifications      │
   │   /api/admin/analytics    │
   └────┬──────────────────────┘
        │
   ┌────┴──────────────────────┐
   │   Middleware Chain         │
   │   protect (JWT verify)     │
   │   adminOnly (role check)   │
   │   validate (Zod schema)    │
   │   uploadImage (Multer)     │
   └────┬──────────────────────┘
        │
   ┌────┴──────────────────────┐
   │   Controller Layer         │
   │   Business Logic           │
   └────┬──────────────────────┘
        │
   ┌────┴──────────────────────┐
   │   MongoDB via Mongoose     │
   │   Models + Indexes         │
   └───────────────────────────┘
```

---

## Folder Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app factory (middleware + routes)
│   ├── server.ts                 # Server startup, DB connect, graceful shutdown
│   │
│   ├── config/
│   │   ├── db.ts                 # MongoDB connection with retry logic
│   │   ├── env.ts                # Zod-validated environment variables
│   │   ├── cloudinary.ts         # Cloudinary SDK configuration
│   │   └── stripe.ts             # Stripe SDK configuration
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts    # Register, OTP, login, refresh, logout, reset
│   │   ├── user.controller.ts    # Profile, avatar, admin user management
│   │   ├── product.controller.ts # CRUD, image upload, search, categories
│   │   ├── cart.controller.ts    # Cart CRUD (per-user persistent cart)
│   │   ├── wishlist.controller.ts# Wishlist add/remove/list
│   │   ├── order.controller.ts   # Place order, order history, admin management
│   │   ├── payment.controller.ts # Stripe PaymentIntent + webhook handler
│   │   ├── review.controller.ts  # Reviews (verified purchase gate)
│   │   ├── coupon.controller.ts  # Admin coupon management + user validation
│   │   ├── message.controller.ts # Contact/chat messaging system
│   │   ├── notification.controller.ts # In-app notifications
│   │   └── analytics.controller.ts    # Admin dashboard statistics
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # protect (JWT), adminOnly, customerOnly
│   │   ├── error.middleware.ts   # Global error handler + 404 handler
│   │   ├── rateLimiter.middleware.ts  # API, auth, OTP, contact limiters
│   │   ├── upload.middleware.ts  # Multer (memory storage, image-only filter)
│   │   └── validate.middleware.ts     # Zod validation wrapper
│   │
│   ├── models/
│   │   ├── User.model.ts         # User with bcrypt password + JWT tokens
│   │   ├── Product.model.ts      # Product with 15 categories + auto-slug
│   │   ├── Order.model.ts        # Order with auto order number (KDU-YYYYMMDD-XXXXX)
│   │   ├── Cart.model.ts         # Persistent cart per user
│   │   ├── Review.model.ts       # Review with verified-purchase gate
│   │   ├── Coupon.model.ts       # Discount coupon with usage limits
│   │   ├── Wishlist.model.ts     # Wishlist per user
│   │   ├── Message.model.ts      # Contact/support messages
│   │   ├── Notification.model.ts # In-app notification system
│   │   └── KnowledgeDoc.model.ts # RAG knowledge base (AI phase)
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── wishlist.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── review.routes.ts
│   │   ├── coupon.routes.ts
│   │   ├── message.routes.ts
│   │   ├── notification.routes.ts
│   │   └── analytics.routes.ts
│   │
│   ├── services/
│   │   ├── email.service.ts      # OTP, welcome, password-reset, order emails
│   │   └── cloudinary.service.ts # Upload + delete images on Cloudinary
│   │
│   ├── utils/
│   │   ├── AppError.ts           # Custom operational error class
│   │   ├── catchAsync.ts         # Async error wrapper for controllers
│   │   ├── apiResponse.ts        # Standardized success response helper
│   │   └── generateToken.ts      # JWT sign/verify utilities
│   │
│   └── validators/
│       ├── auth.validator.ts
│       ├── product.validator.ts
│       ├── cart.validator.ts
│       ├── order.validator.ts
│       ├── review.validator.ts
│       ├── coupon.validator.ts
│       ├── message.validator.ts
│       ├── wishlist.validator.ts
│       └── user.validator.ts
│
├── .env                          # Local secrets (gitignored)
├── .env.example                  # Template for environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in every value before starting.

```env
# ─── Server ───────────────────────────────
NODE_ENV=development
PORT=5000

# ─── MongoDB ──────────────────────────────
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kidendu

# ─── JWT ──────────────────────────────────
JWT_ACCESS_SECRET=<min-32-chars-random-string>
JWT_REFRESH_SECRET=<min-32-chars-random-string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ─── Email (choose SMTP or Resend) ────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
# OR
RESEND_API_KEY=re_xxxxxxxxxxxx

EMAIL_FROM=noreply@kiduendu.com
EMAIL_FROM_NAME=KidEnDu

# ─── Cloudinary ───────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Stripe ───────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx   # set after configuring webhook endpoint

# ─── Frontend ─────────────────────────────
CLIENT_URL=http://localhost:5173

# ─── AI (optional, future phase) ──────────
GEMINI_API_KEY=
CHROMA_URL=
```

> **Startup validation:** The server validates every required env variable with Zod on startup. If any required variable is missing or invalid, the process exits immediately with a clear error message — no silent failures.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A running MongoDB instance (local or Atlas)
- Cloudinary account
- Stripe account

### Install & Run

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your actual credentials

# 3. Start development server (with ts-node/nodemon hot-reload)
npm run dev

# 4. Build for production
npm run build

# 5. Start production server
npm start
```

The server will log:

```
🌿 ─────────────────────────────────────────── 🌿
   KidEnDu API Server
   Environment  : development
   Port         : 5000
   Client URL   : http://localhost:5173
🌿 ─────────────────────────────────────────── 🌿
```

---

## Security & Middleware Stack

Every request passes through the following layers **in order**:

| # | Middleware | Purpose |
|---|---|---|
| 1 | `helmet` | Sets 15+ security HTTP headers (XSS, CSP, HSTS, etc.) |
| 2 | `cors` | Allows only the configured `CLIENT_URL` with credentials |
| 3 | `express-mongo-sanitize` | Strips MongoDB operator keys (`$`, `.`) from request input — prevents NoSQL injection |
| 4 | `express.raw` (Stripe only) | Raw body parsing for `/api/payments/webhook` — **must come before** `express.json()` |
| 5 | `express.json` | JSON body parser (10 MB limit) |
| 6 | `cookie-parser` | Parses httpOnly refresh-token cookie |
| 7 | `morgan` | HTTP request logger (`dev` format in development, `combined` in production) |
| 8 | `apiLimiter` | 100 requests / 15 min per IP on all `/api/*` routes |

---

## Authentication Flow

```
Register ──► Send OTP email ──► Verify OTP ──► Account active
                                                     │
                                                  Login
                                                     │
                                         ┌───────────┴───────────┐
                                         │                       │
                                  Access Token (15m)    Refresh Token (7d)
                                  (Bearer header)       (httpOnly cookie)
                                         │
                                    Token expires
                                         │
                                  POST /api/auth/refresh-token
                                         │
                                  New Access Token
```

### Token Details

| Token | Lifetime | Transport | Storage |
|---|---|---|---|
| Access Token | 15 minutes | `Authorization: Bearer <token>` | Client memory |
| Refresh Token | 7 days | httpOnly secure cookie | Browser cookie jar |

**Forgot Password flow:**
1. `POST /api/auth/forgot-password` → sends OTP to registered email
2. `POST /api/auth/reset-password` → verifies OTP + sets new password

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | 2–50 chars |
| `email` | String | unique, lowercase |
| `passwordHash` | String | bcrypt, `select: false` |
| `avatar` | `{url, publicId}` | Cloudinary |
| `role` | `guest \| customer \| admin` | default: `customer` |
| `isVerified` | Boolean | set `true` after OTP |
| `otp` | String | `select: false`, expires |
| `otpExpiry` | Date | `select: false` |
| `refreshToken` | String | `select: false` |
| `bio` | String | max 500 chars |
| `isBlocked` | Boolean | admin can block users |

### Product
| Field | Type | Notes |
|---|---|---|
| `title` | String | 3–200 chars |
| `slug` | String | auto-generated from title |
| `description` | String | full rich text |
| `shortDescription` | String | max 300 chars |
| `price` | Number | USD, min 0 |
| `compareAtPrice` | Number | original price for sale display |
| `stock` | Number | min 0 |
| `images` | `[{url, publicId, alt}]` | at least 1 required |
| `category` | Enum | 15 categories (see below) |
| `productType` | `physical \| service \| affiliate` | |
| `affiliateUrl` | String | for affiliate products |
| `isFeatured` | Boolean | |
| `rating` | Number | auto-updated by reviews (0–5) |
| `numReviews` | Number | auto-updated by reviews |
| `sku` | String | |
| `weight` | Number | grams, for shipping |

**Product Categories (15):**
`Fertility Supplements` · `Hormone Balance` · `PCOS` · `Prenatal` · `Male Fertility` · `Egg Quality` · `Hair Care` · `Skin & Face` · `Super Foods` · `Kids' Books` · `Kitchen Gadgets` · `Women's Supplements` · `Coaching Services` · `Books & Community` · `Wellness & Lifestyle`

### Order
| Field | Type | Notes |
|---|---|---|
| `orderNumber` | String | auto: `KDU-YYYYMMDD-XXXXX` |
| `items` | `[{productId, title, image, qty, price}]` | snapshot at purchase time |
| `shippingAddress` | `{fullName, address, city, state, postalCode, country, phone}` | |
| `subtotal / tax / shippingCost / discount` | Number | price breakdown |
| `couponCode` | String | |
| `totalPrice` | Number | final amount charged |
| `paymentStatus` | `pending \| paid \| failed \| refunded` | |
| `orderStatus` | `pending \| processing \| shipped \| delivered \| cancelled` | |
| `stripePaymentIntentId` | String | linked to Stripe |
| `trackingNumber` | String | |

### Review
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref: User |
| `productId` | ObjectId | ref: Product |
| `orderId` | ObjectId | enforces verified-purchase policy |
| `rating` | Number | 1–5 |
| `title` | String | max 100 chars |
| `comment` | String | 10–1000 chars |
| `isVerifiedPurchase` | Boolean | always `true` (gate in controller) |
| `helpfulVotes` | Number | |

> **Unique constraint:** One review per `(userId, productId)` pair.  
> **Auto-update:** After every save or delete, a Mongoose post-hook recalculates the product's `rating` and `numReviews`.

### Coupon
| Field | Type | Notes |
|---|---|---|
| `code` | String | unique, uppercase |
| `discountType` | `percentage \| fixed` | |
| `discountValue` | Number | % or USD amount |
| `minOrderAmount` | Number | minimum cart total |
| `maxUses` | Number | total usage cap |
| `usedCount` | Number | auto-incremented |
| `expiresAt` | Date | |
| `isActive` | Boolean | |

---

## API Documentation

All endpoints are prefixed with `/api`.

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [ ... ]  // Zod validation errors only
}
```

---

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Server health status |

**Response:**
```json
{
  "success": true,
  "message": "KidEnDu API is running 🌿",
  "environment": "development",
  "timestamp": "2025-06-14T00:00:00.000Z"
}
```

---

### Auth `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Create account, sends OTP email |
| `POST` | `/api/auth/verify-otp` | None | Verify email with OTP code |
| `POST` | `/api/auth/resend-otp` | None | Resend OTP to email (max 3/hour) |
| `POST` | `/api/auth/login` | None | Login with email + password |
| `POST` | `/api/auth/refresh-token` | Cookie | Exchange refresh token for new access token |
| `POST` | `/api/auth/logout` | None | Clear refresh token cookie |
| `POST` | `/api/auth/forgot-password` | None | Send OTP for password reset |
| `POST` | `/api/auth/reset-password` | None | Reset password with OTP |
| `POST` | `/api/auth/change-password` | 🔒 User | Change password while logged in |

#### `POST /api/auth/register`
```json
// Request Body
{
  "name": "Kidist Alemu",
  "email": "[EMAIL_ADDRESS]",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

// Response 201
{
  "success": true,
  "message": "Registration successful. Please check your email for the OTP verification code."
}
```

#### `POST /api/auth/verify-otp`
```json
// Request Body
{
  "email": "kidist@example.com",
  "otp": "482913"
}

// Response 200
{
  "success": true,
  "message": "Email verified successfully.",
  "accessToken": "<jwt-access-token>",
  "user": { "id": "...", "name": "Kidist Alemu", "email": "...", "role": "customer" }
}
```

#### `POST /api/auth/login`
```json
// Request Body
{
  "email": "kidist@example.com",
  "password": "SecurePassword123!"
}

// Response 200 — sets httpOnly refresh token cookie
{
  "success": true,
  "message": "Login successful.",
  "accessToken": "<jwt-access-token>",
  "user": { "id": "...", "name": "...", "email": "...", "role": "customer", "avatar": {...} }
}
```

#### `POST /api/auth/refresh-token`
```
// No body required — reads refreshToken from httpOnly cookie
// Response 200
{
  "success": true,
  "accessToken": "<new-jwt-access-token>"
}
```

#### `POST /api/auth/forgot-password`
```json
{ "email": "kidist@example.com" }
// Response 200
{ "success": true, "message": "Password reset OTP sent to your email." }
```

#### `POST /api/auth/reset-password`
```json
{
  "email": "kidist@example.com",
  "otp": "839201",
  "newPassword": "NewSecurePass456!"
}
```

#### `POST /api/auth/change-password` 🔒
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

### Users `/api/users`

All routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | 🔒 User | Get current user's profile |
| `PATCH` | `/api/users/profile` | 🔒 User | Update name / bio |
| `PUT` | `/api/users/avatar` | 🔒 User | Upload/replace avatar image |
| `GET` | `/api/users` | 🔒 Admin | Get all users (paginated) |
| `PATCH` | `/api/users/:id/block` | 🔒 Admin | Block or unblock a user |

#### `GET /api/users/profile` 🔒
```json
// Response 200
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Kidist Alemu",
    "email": "kidist@example.com",
    "role": "customer",
    "isVerified": true,
    "avatar": { "url": "https://res.cloudinary.com/...", "publicId": "..." },
    "bio": "",
    "isBlocked": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### `PATCH /api/users/profile` 🔒
```json
// Request Body (all fields optional)
{ "name": "Kidist A.", "bio": "Fertility coach & wellness advocate" }
```

#### `PUT /api/users/avatar` 🔒
```
Content-Type: multipart/form-data
Field: avatar (image file, max 5MB, jpg/png/webp)
```

#### `GET /api/users` 🔒 Admin
```
Query Params:
  page    (default: 1)
  limit   (default: 20)
  search  (name or email substring)
```

---

### Products `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | None | List products with filters & pagination |
| `GET` | `/api/products/categories` | None | Get all available categories |
| `GET` | `/api/products/:slug` | None | Get single product by slug |
| `POST` | `/api/products` | 🔒 Admin | Create a new product (with images) |
| `PUT` | `/api/products/:id` | 🔒 Admin | Update product (with images) |
| `DELETE` | `/api/products/:id` | 🔒 Admin | Delete product + Cloudinary images |

#### `GET /api/products`
```
Query Parameters:
  page        (default: 1)
  limit       (default: 12)
  category    (exact match, one of the 15 categories)
  search      (full-text: title, description, tags)
  sort        newest | price-asc | price-desc | top-rated | popular
  minPrice    (number)
  maxPrice    (number)
  isFeatured  (true | false)
  productType (physical | service | affiliate)
```

```json
// Response 200
{
  "success": true,
  "total": 48,
  "pages": 4,
  "page": 1,
  "limit": 12,
  "products": [ { "_id": "...", "title": "...", "slug": "...", "price": 39.99, ... } ]
}
```

#### `GET /api/products/:slug`
```json
// Response 200
{
  "success": true,
  "product": {
    "_id": "...",
    "title": "Fertility Boost Supplement",
    "slug": "fertility-boost-supplement",
    "description": "...",
    "price": 49.99,
    "compareAtPrice": 64.99,
    "stock": 200,
    "category": "Fertility Supplements",
    "rating": 4.8,
    "numReviews": 124,
    "images": [ { "url": "https://res.cloudinary.com/...", "publicId": "...", "alt": "..." } ],
    "inStock": true,
    "isOnSale": true
  }
}
```

#### `POST /api/products` 🔒 Admin
```
Content-Type: multipart/form-data

Fields:
  title             (string, required)
  description       (string, required)
  shortDescription  (string, optional)
  price             (number, required)
  compareAtPrice    (number, optional)
  stock             (number, required)
  category          (string, one of 15 categories)
  productType       (physical | service | affiliate, default: physical)
  affiliateUrl      (string, for affiliate type)
  isFeatured        (boolean string: "true" | "false")
  isActive          (boolean string: "true" | "false")
  tags              (JSON array string or comma-separated)
  sku               (string, optional)
  weight            (number, grams)
  images            (file[], up to 10 image files)
```

---

### Cart `/api/cart`

All routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/cart` | 🔒 User | Get current user's cart |
| `POST` | `/api/cart/items` | 🔒 User | Add item to cart |
| `PUT` | `/api/cart/items/:productId` | 🔒 User | Update item quantity |
| `DELETE` | `/api/cart/items/:productId` | 🔒 User | Remove item from cart |
| `DELETE` | `/api/cart` | 🔒 User | Clear entire cart |

#### `POST /api/cart/items` 🔒
```json
{ "productId": "64abc...", "qty": 2 }
```

#### `PUT /api/cart/items/:productId` 🔒
```json
{ "qty": 5 }
```

---

### Wishlist `/api/wishlist`

All routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | 🔒 User | Get user's wishlist |
| `POST` | `/api/wishlist/:productId` | 🔒 User | Add product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | 🔒 User | Remove product from wishlist |

---

### Orders `/api/orders`

All routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | 🔒 User | Place a new order |
| `GET` | `/api/orders/myorders` | 🔒 User | Get current user's order history |
| `GET` | `/api/orders/:id` | 🔒 User | Get single order by ID |
| `GET` | `/api/orders` | 🔒 Admin | Get all orders (paginated) |
| `PUT` | `/api/orders/:id/status` | 🔒 Admin | Update order status |

#### `POST /api/orders` 🔒
```json
{
  "items": [
    { "productId": "64abc...", "qty": 2 }
  ],
  "shippingAddress": {
    "fullName": "Kidist Alemu",
    "address": "123 Main St",
    "city": "Addis Ababa",
    "state": "AA",
    "postalCode": "1000",
    "country": "Ethiopia",
    "phone": "+251911000000"
  },
  "couponCode": "SAVE10"
}

// Response 201
{
  "success": true,
  "message": "Order placed successfully.",
  "order": {
    "_id": "...",
    "orderNumber": "KDU-20250614-47291",
    "totalPrice": 89.99,
    "paymentStatus": "pending",
    "orderStatus": "pending"
  }
}
```

#### `PUT /api/orders/:id/status` 🔒 Admin
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "1Z999AA10123456784"
}
// orderStatus: pending | processing | shipped | delivered | cancelled
```

---

### Payments `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-intent` | 🔒 User | Create Stripe PaymentIntent for an order |
| `POST` | `/api/payments/webhook` | Stripe sig | Handle Stripe webhook events |

#### `POST /api/payments/create-intent` 🔒
```json
// Request
{ "orderId": "64abc..." }

// Response 200
{
  "success": true,
  "clientSecret": "pi_xxxxx_secret_yyyyy",
  "paymentIntentId": "pi_xxxxx"
}
```

#### Stripe Webhook `POST /api/payments/webhook`
> **Note:** This endpoint must receive the **raw** request body (not JSON-parsed). It is configured in `app.ts` before `express.json()`. The webhook verifies the `Stripe-Signature` header to prevent spoofing.

**Handled Events:**
| Event | Action |
|---|---|
| `payment_intent.succeeded` | Sets order `paymentStatus: 'paid'`, `orderStatus: 'processing'` |
| `payment_intent.payment_failed` | Sets order `paymentStatus: 'failed'` |
| `charge.refunded` | Sets order `paymentStatus: 'refunded'` |

---

### Reviews `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reviews/product/:productId` | None | Get reviews for a product (paginated) |
| `POST` | `/api/reviews` | 🔒 User | Create a review (verified purchase required) |
| `PUT` | `/api/reviews/:id` | 🔒 Owner | Update own review |
| `DELETE` | `/api/reviews/:id` | 🔒 Owner/Admin | Delete review |
| `POST` | `/api/reviews/:id/helpful` | 🔒 User | Upvote review as helpful |

#### `GET /api/reviews/product/:productId`
```
Query Params:
  page    (default: 1)
  limit   (default: 10)
  sort    newest | helpful | highest | lowest
```

#### `POST /api/reviews` 🔒
> User must have a **paid order** containing the product (verified purchase gate).
```json
{
  "productId": "64abc...",
  "rating": 5,
  "title": "Life-changing supplement",
  "comment": "I've been taking this for 3 months and my bloodwork has improved significantly."
}
```

> After every review create, update, or delete — a Mongoose hook automatically recalculates the product's `rating` and `numReviews`.

---

### Coupons `/api/coupons`

All routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | 🔒 User | Check if a coupon is valid + get discount |
| `POST` | `/api/coupons` | 🔒 Admin | Create a new coupon |
| `GET` | `/api/coupons` | 🔒 Admin | List all coupons |
| `DELETE` | `/api/coupons/:id` | 🔒 Admin | Delete a coupon |

#### `POST /api/coupons/validate` 🔒
```json
// Request
{ "code": "SAVE20", "orderTotal": 150.00 }

// Response 200
{
  "success": true,
  "coupon": {
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 30.00
  }
}
```

#### `POST /api/coupons` 🔒 Admin
```json
{
  "code": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderAmount": 50,
  "maxUses": 100,
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
// discountType: percentage | fixed
```

---

### Messages `/api/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/messages` | Optional 🔒 | Send a contact/support message |
| `GET` | `/api/messages` | 🔒 Admin | List all messages |
| `GET` | `/api/messages/:id` | 🔒 Admin | Get single message with thread |
| `PATCH` | `/api/messages/:id/read` | 🔒 Admin | Mark message as read |
| `POST` | `/api/messages/:id/reply` | 🔒 Admin | Reply to a message (sends email) |
| `DELETE` | `/api/messages/:id` | 🔒 Admin | Delete a message |

#### `POST /api/messages`
> Works for both guests (provide name + email) and authenticated users.
```json
{
  "subject": "Question about fertility supplements",
  "body": "Hello, I'd like to know more about...",
  "guestName": "Jane Doe",       // if not logged in
  "guestEmail": "jane@example.com" // if not logged in
}
```

---

### Notifications `/api/notifications`

All routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | 🔒 User | Get all user notifications |
| `PATCH` | `/api/notifications/read-all` | 🔒 User | Mark all notifications as read |
| `PATCH` | `/api/notifications/:id/read` | 🔒 User | Mark specific notification as read |

```json
// GET /api/notifications Response
{
  "success": true,
  "notifications": [
    {
      "_id": "...",
      "userId": "...",
      "type": "order_shipped",
      "title": "Your order has been shipped!",
      "message": "Order KDU-20250614-47291 is on its way.",
      "isRead": false,
      "createdAt": "2025-06-14T10:00:00.000Z"
    }
  ]
}
```

---

### Analytics `/api/admin/analytics`

All routes require Admin authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/analytics/overview` | 🔒 Admin | Dashboard overview stats |
| `GET` | `/api/admin/analytics/sales-chart` | 🔒 Admin | Monthly revenue + orders (last 12 months) |
| `GET` | `/api/admin/analytics/low-stock` | 🔒 Admin | Products below stock threshold |

#### `GET /api/admin/analytics/overview` 🔒 Admin
```json
{
  "success": true,
  "data": {
    "revenue": 48923.50,
    "orders": 312,
    "users": 891,
    "products": 48
  },
  "message": "Dashboard overview fetched successfully"
}
```

#### `GET /api/admin/analytics/sales-chart` 🔒 Admin
```json
{
  "success": true,
  "data": {
    "chartData": [
      { "month": "Jul 2024", "revenue": 3200.00, "orders": 24 },
      { "month": "Aug 2024", "revenue": 4100.50, "orders": 31 },
      "..."
    ]
  }
}
```

#### `GET /api/admin/analytics/low-stock` 🔒 Admin
```
Query Params:
  threshold  (number, default: 10) — products with stock ≤ threshold
```
```json
{
  "success": true,
  "data": {
    "products": [
      { "_id": "...", "name": "Fertility Boost", "sku": "FB-001", "stock": 3, "price": 49.99 }
    ]
  }
}
```

---

## Error Handling

All errors flow through the global `error.middleware.ts` handler. Operational errors use the custom `AppError` class; Mongoose and Zod errors are automatically normalized.

| HTTP Code | Meaning |
|---|---|
| `400` | Bad Request — validation failed |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role permissions |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate resource (e.g., email, coupon code) |
| `422` | Unprocessable Entity — Zod schema validation errors |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error — unexpected server error |

**Validation Error Example (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

## Rate Limiting

| Limiter | Applies To | Limit |
|---|---|---|
| `apiLimiter` | All `/api/*` routes | 100 req / 15 min per IP |
| `authLimiter` | Login / OTP verify | 5 failed attempts / 15 min per IP |
| `otpResendLimiter` | OTP resend | 3 resends / hour per IP |
| `contactLimiter` | Message submission | 10 messages / hour per IP |

Rate limit headers are included in every response (`RateLimit-*` standard headers).

---

## Scripts

```bash
npm run dev      # Start dev server with hot reload (ts-node + nodemon)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled dist/server.js (production)
npm run lint     # ESLint check
npm run lint:fix # ESLint auto-fix
```

---

## Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals:
1. Stops accepting new connections
2. Waits for in-flight requests to complete
3. Force-exits after 10 seconds if shutdown stalls

Unhandled promise rejections and uncaught exceptions also trigger a graceful shutdown with logging.

---

> Built with ❤️ for KidEnDu — Kidist's personal brand platform.
