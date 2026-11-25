# FixPro — Electronics Store & Repair Service Platform

> Full-stack web platform for electronics & home appliance repair booking, used-device catalog, spare parts showcase, order & warranty tracking.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://fixpro-production.vercel.app/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://fixpro-api-whpt.onrender.com/api/docs)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

- **Live Web App:** https://fixpro-production.vercel.app/
- **API Swagger Docs:** https://fixpro-api-whpt.onrender.com/api/docs

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core User Flows](#core-user-flows)
- [Database Design (ERD)](#database-design-erd)
- [Key Engineering Highlights](#key-engineering-highlights)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Local Development](#local-development)

---

## Overview

**FixPro** digitizes the end-to-end workflow of an electronics & home appliance repair shop:

- **Repair Booking & Tracking:** Customers submit repair requests online (with SMS OTP verification for guests), look up ticket status by phone number, review item-level repair quotes, and track completion progress.
- **Used Appliances & Spare Parts Catalog:** Filterable catalog supporting both serial-tracked refurbished appliances (with condition grading & in-store viewing appointments) and spare parts with technical specifications.
- **Service Articles & SEO Content:** Published service introductions and repair guides dynamically cross-linked with related services and compatible products.
- **Customer Portal:** Unified account dashboard for profile & avatar management, repair history, order history, warranty lookup, and favorites.

---

## System Architecture

```mermaid
flowchart LR
    Client["Browser / Mobile Client"]

    subgraph Frontend ["Frontend (Vercel)"]
        Next["Next.js 15 App Router<br/>React 19 · Tailwind CSS · TanStack Query"]
    end

    subgraph Backend ["Backend API (Render · Docker)"]
        Nest["NestJS 11 REST API<br/>TypeORM · Passport JWT · Swagger"]
    end

    subgraph Data ["Managed Data Layer"]
        MySQL[("MySQL 8 (Aiven · SSL)")]
        Redis[("Redis (Upstash · TLS)")]
    end

    subgraph External ["Third-Party Integrations"]
        Google["Google OAuth 2.0"]
        ESMS["eSMS.vn OTP Gateway"]
        Cloud["Cloudinary Media CDN"]
    end

    Client -->|HTTPS| Next
    Next -->|REST + HttpOnly Cookies| Nest
    Nest -->|SQL Queries| MySQL
    Nest -->|OTP State & Rate Limits| Redis
    Nest -->|OAuth Flow| Google
    Nest -->|SMS Verification| ESMS
    Nest -->|Image Upload / Cleanup| Cloud
```

---

## Core User Flows

### 1. Guest / Customer Repair Booking & Quick Tracking

```mermaid
sequenceDiagram
    actor User as Customer
    participant Web as Next.js Client
    participant API as NestJS API
    participant Redis as Upstash Redis
    participant SMS as eSMS.vn
    participant DB as MySQL 8

    User->>Web: Fill device category, model & issue description
    Web->>API: POST /auth/otp/challenges (phone, purpose=repair)
    API->>Redis: Check cooldown & IP/phone rate limit, store HMAC OTP
    API->>SMS: Send 6-digit SMS OTP
    SMS-->>User: Receive OTP code
    User->>Web: Enter 6-digit OTP
    Web->>API: POST /auth/otp/challenges/verify
    API->>Redis: Verify digest (max 5 attempts) & issue one-time token
    API-->>Web: verificationToken
    Web->>API: POST /repair (payload + verificationToken)
    API->>DB: Create repair ticket & repair_item records
    API-->>Web: Repair ticket code (e.g. RP-XXXXXX)
```

### 2. Authentication & Session Lifecycle

```mermaid
flowchart TD
    A["User Login"] --> B{"Auth Method"}
    B -->|Phone + Password| C["POST /auth/login"]
    B -->|Google OAuth 2.0| D["GET /auth/google -> Callback -> Ticket"]
    D --> E{"Existing Phone Linked?"}
    E -->|Yes| F["POST /auth/google/complete"]
    E -->|No| G["Verify Phone via SMS OTP"] --> F
    C --> H["Issue Access Token (15m) + HttpOnly Refresh Cookie (7d)"]
    F --> H
    H --> I["API Request with Bearer Access Token"]
    I -->|401 Expired| J["Axios Interceptor -> POST /auth/refresh"]
    J -->|Valid Refresh Cookie| H
    J -->|Invalid / Revoked| K["Redirect to /login"]
```

---

## Database Design (ERD)

```mermaid
erDiagram
    USER ||--o| CUSTOMER_PROFILE : "has"
    USER ||--o{ REPAIR : "submits"
    USER ||--o{ ORDER : "places"
    USER ||--o{ WARRANTY : "owns"
    USER ||--o{ APPOINTMENT : "books"

    CATEGORY ||--o{ PRODUCT : "classifies"
    CATEGORY ||--o{ SERVICE : "groups"
    CATEGORY ||--o{ CONTENT : "categorizes"

    PRODUCT ||--o{ PRODUCT_SPECIFICATION : "details"
    PRODUCT ||--o{ OLD_PRODUCT : "serialized units"
    PRODUCT }o--o{ BRAND : "product_brand"
    SERVICE }o--o{ PRODUCT : "service_product"

    REPAIR ||--o{ REPAIR_ITEM : "contains"
    REPAIR_ITEM ||--o{ REPAIR_ITEM_QUOTE : "quoted by"
    SERVICE ||--o{ REPAIR_ITEM : "applied to"

    ORDER ||--o{ ORDER_ITEM : "includes"
    ORDER_ITEM ||--o{ WARRANTY : "generates"
    OLD_PRODUCT ||--o{ APPOINTMENT : "scheduled for"

    CONTENT }o--o{ SERVICE : "content_service"
    CONTENT }o--o{ PRODUCT : "content_product"

    USER {
        int id PK
        varchar phone UK
        varchar email UK
        varchar name
        enum role
    }
    PRODUCT {
        int id PK
        int category_id FK
        varchar name
        varchar model
        decimal selling_price
        enum tracking_type
        int quantity
    }
    OLD_PRODUCT {
        int id PK
        int product_id FK
        varchar serial_number UK
        enum condition_status
        enum status
        decimal selling_price
    }
    REPAIR {
        int id PK
        varchar code UK
        int customer_id FK
        datetime received_at
        enum status
    }
    REPAIR_ITEM {
        int id PK
        int repair_id FK
        int category_id FK
        varchar device_model
        enum status
        decimal total_amount
    }
    ORDER {
        int id PK
        varchar code UK
        int customer_id FK
        decimal final_amount
        enum payment_status
        enum status
    }
    WARRANTY {
        int id PK
        int order_item_id FK
        int customer_id FK
        varchar serial_number
        date start_date
        date end_date
        enum status
    }
    CONTENT {
        int id PK
        varchar slug UK
        varchar title
        varchar content_type
        enum status
        boolean show_on_services
    }
```

> Media assets (`PRODUCT`, `OLD_PRODUCT`, `CONTENT`, `USER`) are managed polymorphically via a dedicated `media_file` table backed by Cloudinary public IDs for automatic cleanup on replacement/deletion.

---

## Key Engineering Highlights

- **Hardened OTP Verification Architecture:** Reusable `OtpModule` with `challengeId` lifecycle, HMAC-SHA256 hashed codes in Redis, resend cooldown (`retryAfterSeconds`), phone/IP throttling, 5-attempt lockout, and single-use purpose-bound verification tokens.
- **Secure Auth & Seamless Token Refresh:** Short-lived JWT Access Tokens paired with `HttpOnly` Refresh Token cookies (`SameSite=None; Secure` for cross-origin production), automatic Axios request queuing during token refresh, and Google OAuth 2.0 with ticket-based completion.
- **Client-Side Image Optimization:** Browser-side WebP compression before upload, MIME/magic-byte validation on the server, Cloudinary stream uploads, and automatic old-asset cleanup on avatar update.
- **Cross-Linked Domain Data:** Product detail pages dynamically resolve matching repair services and published service articles; service articles cross-link to related services and available catalog items.
- **Cloud-Native Production Setup:** Containerized NestJS API (Render), Edge-served Next.js frontend (Vercel), SSL-enforced MySQL 8 (Aiven), and TLS Redis (Upstash) with automated CD on push to `main`.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query, Zustand, Axios, Sonner |
| **Backend** | NestJS 11, TypeScript, TypeORM, Passport JWT, class-validator, Swagger (OpenAPI), ioredis |
| **Database & Cache** | MySQL 8 (Aiven), Redis 7 (Upstash) |
| **Integrations** | Google OAuth 2.0, eSMS.vn REST API, Cloudinary |
| **Deployment** | Vercel (Frontend), Render + Docker (Backend) |

---

## Screenshots

> Add 3–4 screenshots captured from https://fixpro-production.vercel.app/ into `docs/screenshots/` and uncomment below:

<!--
| Home & Quick Repair Booking | Product Catalog & Detail |
| --- | --- |
| ![Homepage](docs/screenshots/home.png) | ![Products](docs/screenshots/products.png) |

| Service Articles & Related Items | Customer Profile & Repair Tracking |
| --- | --- |
| ![Services](docs/screenshots/services.png) | ![Profile](docs/screenshots/profile.png) |
-->

---

## Project Structure

```text
.
├── backend/                # NestJS 11 REST API
│   └── src/
│       ├── auth/           # JWT, Refresh cookie, Google OAuth
│       ├── otp/            # Redis challenge, rate-limit, eSMS provider
│       ├── product/        # Products, used appliances, categories, brands, services
│       ├── repair/         # Repair intake, quick lookup, quotes, status flow
│       ├── order/          # Orders & order items
│       ├── warranty/       # Warranty records & customer lookup
│       ├── appointment/    # Used-device viewing appointments
│       ├── content/        # Public service articles & cross-linking
│       ├── media/          # Cloudinary upload & polymorphic media_file
│       └── user/           # Customer profiles & password management
└── frontend/               # Next.js 15 App Router
    └── src/
        ├── app/(client)/   # Public store, services, booking, customer portal
        ├── components/     # Reusable UI primitives & layout components
        ├── hooks/          # Auth, favorites, validation hooks
        ├── lib/            # Axios interceptor, error mapping, WebP compression
        └── service/        # Typed API clients
```

---

## Local Development

### Prerequisites
- Node.js 20+
- MySQL 8+ and Redis 7+

### 1. Backend
```bash
cd backend
cp .env.example .env   # Configure DB, Redis, JWT, Cloudinary, eSMS/mock OTP
npm install
npm run start:dev      # Runs on http://localhost:3001 (Swagger: /api/docs)
```

### 2. Frontend
```bash
cd frontend
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:3001 in frontend/.env.local
npm run dev            # Runs on http://localhost:3000
```
