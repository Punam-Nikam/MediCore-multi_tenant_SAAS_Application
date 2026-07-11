# MediCore — Multi-Tenant Healthcare SaaS Platform

> A production-grade multi-tenant SaaS application built from scratch using **Core Java** , JDBC, MySQL, JWT authentication, BCrypt security, and Razorpay payment integration — with a React frontend.

---

## 🏥 What is MediCore?

MediCore is a **Software-as-a-Service (SaaS) platform** designed for clinics and hospitals to manage patients, generate invoices, and collect payments online — all within a **completely isolated, secure, multi-tenant environment**.

Think of it like Zoho or Freshbooks, but built specifically for Indian healthcare clinics.

---

## 🎯 Why This Project Matters


- **Core Java** — HTTP handling, routing, dependency injection all done manually using Core Java
- **Real multi-tenancy** — 100+ clinics can use the same app simultaneously, with zero data leakage between them
- **Production security patterns** — JWT auth, BCrypt hashing, HMAC webhook verification, SQL injection prevention
- **Real payment integration pattern** — Razorpay order creation, webhook handling, HMAC signature verification
- **Layered architecture** — Controller → Service → Repository pattern, built manually without frameworks

---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Language | Java 23 (Core Java) | Deep understanding of concepts |
| HTTP Server | `com.sun.net.httpserver.HttpServer` | Built into JDK, no Undertow/Tomcat needed |
| Database | MySQL | Industry standard relational database |
| ORM/DB Access | JDBC + HikariCP | Raw SQL + connection pooling |
| Authentication | JWT (`java-jwt`) | Stateless, scalable auth |
| Password Security | BCrypt (`jbcrypt`) | Salted, slow hashing — industry standard |
| Payment Gateway | Razorpay SDK + HMAC webhook | Simulated in test mode |
| JSON | Jackson (`jackson-databind`) | Java ↔ JSON serialization |
| Frontend | React + Vite | Modern SPA, connected to REST API |
| Build Tool | Maven | Dependency management |

---

## 🏗️ Architecture

```
React Frontend (localhost:5173)
        ↕ HTTP (JSON)
Java HttpServer (localhost:8080)
    ├── CorsFilter           — handles CORS for all routes
    ├── AuthFilter           — verifies JWT on protected routes
    ├── SecuredHandler       — wraps protected handlers
    ├── TenantContext        — ThreadLocal stores tenant_id per request
    │
    ├── /api/register        → AuthHandler (creates tenant + user)
    ├── /api/login           → LoginHandler (returns JWT)
    ├── /api/patients        → PatientHandler (CRUD, tenant-isolated)
    ├── /api/invoices        → InvoiceHandler (CRUD, ownership-verified)
    ├── /api/payments        → PaymentHandler (Razorpay order creation)
    └── /api/webhook/razorpay → WebhookHandler (HMAC verified, marks PAID)
        ↕ JDBC (HikariCP connection pool)
MySQL Database (medicore_db)
    ├── tenants    — one row per clinic
    ├── users      — clinic staff (OWNER/DOCTOR/RECEPTIONIST)
    ├── patients   — all tenant_id isolated
    └── invoices   — linked to patients, tenant-isolated
```

---

## 🔐 Multi-Tenancy — How It Works
 
Every clinic that signs up is a **tenant**. Every table in the database has a `tenant_id` column, so each row "belongs" to one clinic.
 
- When a clinic registers, it gets a unique `tenant_id`.
- Every login generates a JWT token that carries this `tenant_id` inside it.
- On every request, the server reads the `tenant_id` from the token and only fetches/updates rows matching that ID.
**In short:** one shared database, one shared codebase, but each clinic only ever sees its own patients, invoices, and staff.
 
---
 
## 🔑 Security — Key Ideas
 
| Concern | How it's handled |
|---|---|
| **Passwords** | Never stored as plain text. They're run through **BCrypt hashing** before saving, and checked (not decrypted) on login. |
| **Authentication** | A **JWT token** is issued at login containing the user's ID, role, and tenant ID. It's verified on every protected request instead of re-checking username/password each time. |
| **SQL Injection** | All queries use **PreparedStatements** with `?` placeholders — user input is never glued directly into SQL text, so attackers can't inject malicious commands. |
| **Payment Fraud** | Razorpay webhook calls are verified using **HMAC signature checking** — the server recomputes a signature from the payload and compares it to the one Razorpay sent, rejecting anything that doesn't match. This stops attackers from faking a "payment successful" call. |
 
---
 
## 🗄️ Database Schema — Overview
 
Four core tables, linked by `tenant_id` for isolation:
 
- **tenants** — one row per registered clinic (name, contact info, subscription plan).
- **users** — staff accounts (doctors, owners) belonging to a tenant, with roles and hashed passwords.
- **patients** — patient records, always scoped to a tenant.
- **invoices** — billing records linked to both a tenant and a patient, tracking amount, status (`PENDING`/`PAID`), and payment method.
**Relationship in one line:** `tenants → users/patients → invoices`, all connected by foreign keys, with `tenant_id` acting as the isolation boundary everywhere.
 
---
 
## 💳 Payment Flow — Step by Step
 
1. Clinic creates an invoice → starts as `PENDING`.
2. Clinic clicks **"Pay now"** → a Razorpay order is created.
3. Patient completes payment (simulated in test mode).
4. Razorpay notifies the server via a **webhook**.
5. Server verifies the webhook's authenticity (HMAC check).
6. Invoice is updated to `PAID`, with method `ONLINE`.
7. Receipt becomes available for printing.
**Cash payments** skip the Razorpay steps entirely — clicking **"Mark as cash paid"** instantly sets the invoice to `PAID` with method `CASH`.
 
---
 
## 🚀 Running the Project

### Prerequisites
- Java 23
- MySQL 8+
- Maven 3+

### Backend Setup

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE medicore_db;

# 2. Run the SQL schema (see /database/schema.sql)

# 3. Update DB credentials in DBConnection.java
# DB_URL = "jdbc:mysql://localhost:3306/medicore_db"
# DB_USER = "root"
# DB_PASS = "yourpassword"

# 4. Build and run
mvn compile exec:java -Dexec.mainClass="com.medicore.Main"

# Server starts at http://localhost:8080
```

### Frontend Setup

```bash
cd medicore-frontend
npm install
npm run dev

# Frontend starts at http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | None | Register new clinic |
| POST | `/api/login` | None | Login, returns JWT |
| GET | `/api/patients` | JWT | Get all patients (tenant-isolated) |
| POST | `/api/patients` | JWT | Add new patient |
| GET | `/api/patients/:id` | JWT | Get single patient |
| PUT | `/api/patients/:id` | JWT | Update patient |
| DELETE | `/api/patients/:id` | JWT | Delete patient |
| GET | `/api/invoices` | JWT | Get all invoices |
| POST | `/api/invoices` | JWT | Create invoice |
| POST | `/api/invoices/:id/cash-paid` | JWT | Mark paid by cash |
| POST | `/api/payments` | JWT | Create Razorpay order |
| POST | `/api/webhook/razorpay` | HMAC | Payment confirmation |

---

## 🎓 Key Concepts Demonstrated

| Concept | Where Used | Why It Matters |
|---------|-----------|----------------|
| Multi-tenancy | Every DB query | Data isolation between clinics |
| ThreadLocal | TenantContext.java | Thread-safe per-request storage |
| JWT auth | AuthFilter.java | Stateless, scalable authentication |
| BCrypt | AuthHandler.java | Secure password storage |
| HMAC | WebhookHandler.java | Webhook authenticity verification |
| PreparedStatement | All repositories | SQL injection prevention |
| Connection pooling | HikariCP | Efficient DB connections |
| CORS | CorsFilter.java | Cross-origin request handling |
| Repository pattern | *Repository.java | Clean separation of DB concerns |

---

## 📁 Project Structure

```
MediCore/
├── src/main/java/com/medicore/
│   ├── Main.java                    ← HTTP server entry point
│   ├── auth/                        ← Registration, login, JWT
│   ├── config/                      ← Hibernate/DB config
│   ├── context/                     ← TenantContext (ThreadLocal)
│   ├── db/                          ← DBConnection (HikariCP)
│   ├── filter/                      ← AuthFilter, CorsFilter, SecuredHandler
│   ├── invoice/                     ← Invoice CRUD handlers
│   ├── patient/                     ← Patient CRUD handlers
│   ├── payment/                     ← Razorpay, Webhook, SignatureHandler
│   ├── repository/                  ← All database operations
│   └── security/                    ← JwtUtil, AES encryption
│
medicore-frontend/
├── src/
│   ├── api/                         ← auth.js, patients.js, invoices.js
│   ├── pages/                       ← Landing, Login, Register, Dashboard, PrintInvoice
│   ├── styles/                      ← Landing.css, Auth.css, Dashboard.css
│   └── App.jsx                      ← React Router setup
└── package.json
```

---

## 👨‍💻 Author

Built as a learning project to deeply understand:
- Multi-tenant SaaS architecture
- Core Java backend development (without frameworks)
- JWT/BCrypt security implementation
- Payment gateway integration patterns
- React frontend development

---
## ✅ Summary
 
This project demonstrates a real-world SaaS pattern: **shared infrastructure, isolated data**, backed by industry-standard security practices (hashing, JWT, prepared statements, webhook verification) and a clean payment lifecycle.
---
