# Food Order Management — Technical Assessment

A full-stack food ordering application built as part of a technical interview assessment. It demonstrates end-to-end product flow: browse a menu, manage a cart, place an order, and track fulfillment status with live updates.

## For Reviewers

This section is intended to help you evaluate the submission quickly.

### Quick start

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/food_orders"
DIRECT_URL="postgresql://user:password@localhost:5432/food_orders"
```

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the test suite:

```bash
npm test
```

### Suggested evaluation path

1. **Home (`/`)** — Browse the menu, search items, add to cart, and complete checkout.
2. **Orders (`/orders`)** — View seeded and newly created orders; use search filters.
3. **Order detail (`/orders/[id]`)** — Confirm the status stepper and live SSE updates when status changes.
4. **API** — Exercise endpoints under `/api/menu` and `/api/orders` (see [API reference](#api-reference)).
5. **Tests** — Review coverage in `src/tests/api/` and `src/tests/components/`.

## Scope Implemented

| Area | Implementation |
| ---- | -------------- |
| Menu browsing | Server-rendered menu with client-side search (debounced) |
| Cart | Persistent client cart (Zustand) with quantity controls |
| Checkout | Form validation (React Hook Form + Zod), order creation via API |
| Order management | List, detail, search, status updates, deletion |
| Real-time tracking | Server-Sent Events (SSE) on order detail for status changes |
| Data layer | PostgreSQL + Prisma with migrations and seed data |
| Quality | API and component tests (Vitest, Testing Library, Supertest) |

## Architecture & Design Decisions

**Next.js App Router** — Server components load initial menu and order data; client components handle interactivity (cart, forms, live status).

**Separation of concerns**

- `src/app/` — Routes and API handlers
- `src/components/` — UI grouped by domain (menu, cart, checkout, orders)
- `src/lib/` — Shared utilities (Prisma client, order status helpers)
- `src/schemas/` — Shared Zod schemas for API and form validation
- `src/store/` — Client-only cart state (Zustand)

**State management**

- **Zustand** for the shopping cart — lightweight, no provider boilerplate for UI-only state.
- **TanStack Query** for server-fetched data and mutations where caching/refetch adds value.

**Validation** — `order-schema.ts` is shared between the checkout form and the create-order API, keeping client and server rules aligned.

**Order status** — A defined lifecycle (`ORDER_RECEIVED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`, plus `CANCELLED`) with helpers in `src/lib/order-status.ts` for normalization and step indexing in the UI.

**Real-time updates** — `GET /api/orders/[id]/events` streams status changes over SSE so the order detail page updates without polling.

**Database** — Prisma 7 with the PostgreSQL driver adapter; client generated to `src/generated/prisma`. Seed script resets and populates sample menu items and orders for a consistent demo experience.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Material UI 9, Tailwind CSS 4
- PostgreSQL, Prisma 7
- Zustand, TanStack Query, React Hook Form, Zod
- Vitest, Testing Library, Supertest

## Project Structure

```
food-order-management/
├── prisma/
│   ├── migrations/              # Database migrations
│   ├── schema.prisma              # MenuItem, Order, OrderItem models
│   └── seed.ts                    # Sample menu and orders
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── menu/              # GET menu items
│   │   │   └── orders/            # CRUD + status + SSE
│   │   ├── orders/                # Order history & detail pages
│   │   ├── page.tsx               # Home (menu)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── cart/                  # Drawer, line items, quantity
│   │   ├── checkout/              # Checkout form
│   │   ├── menu/                  # List, grid, cards
│   │   ├── orders/                # History, detail, status, lookup
│   │   └── common/                # React Query provider
│   ├── generated/prisma/          # Generated Prisma client
│   ├── hooks/                     # useDebounce, useScrollReveal
│   ├── lib/                       # Prisma singleton, order status
│   ├── schemas/                   # Zod schemas
│   ├── store/                     # Cart store
│   ├── tests/                     # API and component tests
│   └── theme/                     # MUI theme
├── prisma.config.ts
├── next.config.ts
└── vitest.config.ts
```

## Prerequisites

- Node.js 20+
- PostgreSQL

## Setup

1. Install dependencies: `npm install`
2. Add `.env` with `DATABASE_URL` and `DIRECT_URL` (see [Quick start](#quick-start))
3. Apply migrations: `npm run db:migrate`
4. Seed the database: `npm run db:seed`
5. Start dev server: `npm run dev`

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Run test suite |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Reset and seed sample data |

## API Reference

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/menu?q=` | List menu items (optional search) |
| `GET` | `/api/orders?q=` | Search orders by customer, phone, status, or ID |
| `POST` | `/api/orders` | Create order with line items |
| `GET` | `/api/orders/[id]` | Get order by ID |
| `DELETE` | `/api/orders/[id]` | Delete order |
| `PATCH` | `/api/orders/[id]/status` | Update order status |
| `GET` | `/api/orders/[id]/events` | SSE stream for status updates |

## Testing

Tests focus on behavior that matters for correctness:

- **API** (`src/tests/api/orders.test.ts`) — Order creation (including duplicate line merging and totals), validation, status updates, reads, deletes
- **Components** — Menu grid (add to cart), order history list (rendering and empty state)

```bash
npm test
```

## Trade-offs & Possible Extensions

Documented intentionally for review discussion:

- **Cart persistence** — In-memory (Zustand) only; `localStorage` or session persistence would improve UX across refreshes.
- **Auth** — No authentication; orders are identified by ID and searchable fields. Production would need user accounts or secure order tokens.
- **Admin UI** — Status can be updated via API; a dedicated admin/kitchen view was out of scope for this assessment.
- **Payments** — Checkout captures delivery details only; payment integration was not required.

## Deployment

Configured for Vercel (`vercel.json`). Set `DATABASE_URL` (and `DIRECT_URL` if needed) in the deployment environment and run `npm run db:migrate` as part of release.
