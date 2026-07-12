# MediCore — Multi-Tenant Healthcare SaaS Application

MediCore is a full-stack SaaS platform that enables clinics and hospitals to manage patients, billing, and payments in a completely isolated multi-tenant environment. Multiple hospitals/clinics can use the same platform simultaneously, with each clinic's data fully separated from others.

---

## Features

- **Multi-tenant architecture** — each clinic sees only their own data, even on a shared database
- **Patient management** — add, search, edit and delete patient records
- **Invoice & billing** — create invoices per patient, track pending and paid status
- **Online payments** — Razorpay payment integration with HMAC-verified webhooks
- **Cash payments** — mark invoices as cash paid with payment method tracking
- **Printable receipts** — professional invoice receipt per patient visit
- **Secure authentication** — JWT tokens with BCrypt password hashing
- **Dashboard** — real-time stats for patients, revenue, and pending payments

---

## Tech Stack

| | Technology |
|---|---|
| **Backend** | Java 23, `com.sun.net.httpserver` |
| **Database** | MySQL 8 + HikariCP connection pooling |
| **Authentication** | JWT + BCrypt |
| **Payments** | Razorpay SDK + HMAC-SHA256 webhook verification |
| **Frontend** | React 18 + Vite + React Router |
| **Build** | Maven |

---

## Architecture

```
React (localhost:5173)
        |
        | HTTP / JSON
        |
Java HttpServer (localhost:8080)
        |
   ┌────┴──────────────────────────────────────┐
   │  CorsFilter      — all routes             │
   │  AuthFilter      — JWT verification       │
   │  SecuredHandler  — protects handlers      │
   │  TenantContext   — ThreadLocal per req    │
   │                                           │
   │  /api/register   → AuthHandler            │
   │  /api/login      → LoginHandler           │
   │  /api/patients   → PatientHandler         │
   │  /api/invoices   → InvoiceHandler         │
   │  /api/payments   → PaymentHandler         │
   │  /api/webhook    → WebhookHandler         │
   └───────────────────────────────────────────┘
        |
        | JDBC (HikariCP)
        |
MySQL (medicore_db)
   ├── tenants
   ├── users
   ├── patients   ← tenant_id on every row
   └── invoices   ← tenant_id on every row
```

---

## Multi-Tenancy

Every table has a `tenant_id` column. On registration, each clinic gets a unique `tenant_id` embedded in their JWT token. This ID is stored in a `ThreadLocal` for each request, so every database query automatically scopes to that clinic without passing it as a parameter everywhere.

```
Clinic A logs in → sees only Clinic A's patients and invoices
Clinic B logs in → sees only Clinic B's patients and invoices
Same database. Same server. Zero data leakage.
```

---

## Security

| Concern | Approach |
|---------|----------|
| Passwords | BCrypt hashing (cost factor 12), never stored or logged as plain text |
| Authentication | JWT tokens signed with HMAC256, expire in 24 hours |
| SQL Injection | `PreparedStatement` used throughout — no string concatenation in SQL |
| Payment fraud | Razorpay webhooks verified via HMAC-SHA256 signature before any invoice update |

---

## Payment Flow

```
Invoice created (PENDING)
  → POST /api/payments → Razorpay order created
  → Patient pays via Razorpay checkout
  → Razorpay sends webhook to server
  → Server verifies HMAC signature
  → Invoice updated to PAID (method: ONLINE)
  → Receipt available for print
```

Cash payments bypass the gateway — a single API call marks the invoice PAID with `payment_method = CASH`.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | None | Register clinic |
| POST | `/api/login` | None | Login, returns JWT |
| GET | `/api/patients` | JWT | All patients |
| POST | `/api/patients` | JWT | Add patient |
| PUT | `/api/patients/:id` | JWT | Update patient |
| DELETE | `/api/patients/:id` | JWT | Delete patient |
| GET | `/api/invoices` | JWT | All invoices |
| POST | `/api/invoices` | JWT | Create invoice |
| POST | `/api/invoices/:id/cash-paid` | JWT | Mark cash paid |
| POST | `/api/payments` | JWT | Create payment order |
| POST | `/api/webhook/razorpay` | HMAC | Payment webhook |

---

## Running Locally

**Prerequisites:** Java 23, MySQL 8+, Node.js 18+, Maven 3+

```bash
# Backend
mysql -u root -p -e "CREATE DATABASE medicore_db;"
# Update DB credentials in DBConnection.java
mvn compile exec:java -Dexec.mainClass="com.medicore.Main"
# Runs on http://localhost:8080

# Frontend
cd medicore-frontend
npm install && npm run dev
# Runs on http://localhost:5173
```

---

## Project Structure

```
MediCore/
├── src/main/java/com/medicore/
│   ├── Main.java
│   ├── auth/          Registration, login
│   ├── context/       TenantContext
│   ├── db/            DBConnection
│   ├── filter/        CorsFilter, AuthFilter, SecuredHandler
│   ├── invoice/       Invoice handlers
│   ├── patient/       Patient handlers
│   ├── payment/       Razorpay, webhook, signature
│   ├── repository/    Database operations
│   └── security/      JwtUtil
│
medicore-frontend/
├── src/
│   ├── api/           auth.js, patients.js, invoices.js
│   ├── pages/         Landing, Login, Register, Dashboard, PrintInvoice
│   └── styles/        Per-page CSS files
```

---
## ✅ Summary

This project demonstrates a real-world SaaS pattern: **shared infrastructure, isolated data**, backed by industry-standard security practices (hashing, JWT, prepared statements, webhook verification) and a clean payment lifecycle.

---

## Author

Punam Nikam | GitHub - https://github.com/Punam-Nikam
