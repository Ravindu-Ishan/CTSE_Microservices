# OTSS Frontend — Axiom Support Portal

Frontend for the Online Ticket Support System (OTSS), themed as the support portal for **Axiom**, a fictional tactical game. Built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v4 + WSO2 IAM v7.2 (OIDC) |
| HTTP Client | Axios |
| Font | Geist Sans / Geist Mono |

## Features

- **Axiom landing page** with Play, Patch Notes, About, and Support navigation
- **End-user registration** via custom form → User Service
- **WSO2 SSO login** for all authenticated users
- **End-user dashboard**: create tickets, track status, reply to staff
- **Staff dashboard**: view assigned tickets, reply, close tickets, manage online status and capacity
- **Admin dashboard**: queue stats, manual ticket assignment, all-tickets view, user management
- **Role-based routing** enforced via Next.js middleware

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Landing pages (no auth required)
│   ├── auth/              # Login, register, error pages
│   ├── dashboard/         # END_USER protected routes
│   ├── staff/             # STAFF protected routes
│   ├── admin/             # ADMIN protected routes
│   └── api/auth/          # NextAuth.js route handler
├── components/
│   ├── ui/                # Reusable primitives (Button, Card, Badge, Input…)
│   ├── layout/            # LandingNav, DashboardShell, Footer
│   └── tickets/           # TicketCard, TicketList, MessageThread…
└── lib/
    ├── api/               # Axios API modules per service
    ├── auth/              # NextAuth config + type augmentation
    └── types/             # TypeScript interfaces from OpenAPI specs
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
- Microservice URLs (or leave as localhost for development)
- WSO2 IAM base URL, client ID, and client secret
- A random `AUTH_SECRET` (run `openssl rand -base64 32`)
- `NEXTAUTH_URL` pointing to this app

### 3. Register the app in WSO2 IAM

1. Create an **OAuth2/OIDC Application** in WSO2 IAM (Service Provider)
2. Set **Allowed Grant Types**: `Code`
3. Add **Callback URL**: `http://localhost:3000/api/auth/callback/wso2`
4. Copy the **Client ID** and **Client Secret** into `.env.local`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_USER_SERVICE_URL` | User Service base URL |
| `NEXT_PUBLIC_TICKET_SERVICE_URL` | Ticket Service base URL |
| `NEXT_PUBLIC_QUEUE_SERVICE_URL` | Queue Service base URL |
| `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` | Notification Service base URL |
| `NEXT_PUBLIC_WSO2_BASE_URL` | WSO2 IS base URL (e.g. `https://host:9443`) |
| `NEXT_PUBLIC_WSO2_MYACCOUNT_URL` | WSO2 MyAccount URL for self-service profile updates |
| `WSO2_CLIENT_ID` | OAuth2 app Client ID (server-only) |
| `WSO2_CLIENT_SECRET` | OAuth2 app Client Secret (server-only) |
| `AUTH_SECRET` | NextAuth secret (server-only) |
| `NEXTAUTH_URL` | Full URL of this frontend |

In Kubernetes, set `NEXT_PUBLIC_*` values via ConfigMap and `WSO2_CLIENT_SECRET` / `AUTH_SECRET` via Secrets.

## User Roles

| Role | Access |
|---|---|
| `END_USER` | `/dashboard/*` — create tickets, reply, view profile |
| `STAFF` | `/staff/*` — manage assigned tickets, reply, close, toggle online status |
| `ADMIN` | `/admin/*` — queue management, all tickets, user list |

Role is resolved at login by querying `GET /profiles?email=<email>` on the User Service.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```
