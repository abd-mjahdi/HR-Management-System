# 🏢 Workline HR — Multi-Tenant Employee & Time Tracking SaaS

[![CI](https://github.com/abd-mjahdi/hr-system/actions/workflows/ci.yml/badge.svg)](https://github.com/abd-mjahdi/hr-system/actions/workflows/ci.yml)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21.2-red.svg?logo=angular)](https://angular.dev/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?logo=openjdk)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Liquibase](https://img.shields.io/badge/Liquibase-Schema%20Management-blueviolet.svg?logo=liquibase)](https://www.liquibase.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?logo=docker)](https://www.docker.com/)

> **A production-ready, full-stack B2B SaaS platform** designed for enterprise employee attendance tracking, timesheet approval hierarchies, leave management workflows, and payroll auditing across isolated organizations (tenants).

---

## 🌟 Executive Overview

In medium-to-large distributed organizations, attendance tracking and leave management are frequently fragmented across spreadsheets, disparate chat threads, and manual paper trails. This creates payroll calculation discrepancies, compliance liabilities, and manager blind spots.

**Workline HR** replaces these ad-hoc workflows with a centralized, multi-tenant digital platform built to real-world software engineering standards:
* **Host-Based Multi-Tenancy:** Automated company isolation using custom subdomains (e.g., `acme.localhost` and `globex.localhost`).
* **Granular Role-Based Access Control (RBAC):** Three distinct roles (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`) with method-level authorization.
* **Transactional Email Outbox Pattern:** High-reliability background mail delivery resilient to network blips and third-party downtime.
* **Audit-Proof Compliance:** Automatic audit trail logging for security-sensitive actions and time/leave corrections.
* **Payroll & Overtime Engine:** Configurable daily (>8h) and weekly (>40h) overtime aggregation with CSV/Excel export.

---

## 🏗️ Architecture & Engineering Highlights

```
                                      [ Browser / Client ]
                                                │
                          Host Header: {slug}.workline.casa / {slug}.localhost
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │    Angular 21 SPA     │ (Standalone, Signals, Vitest)
                                    └───────────┬───────────┘
                                                │  REST API + JWT Bearer
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Spring Boot 3.3 Backend                                                                │
│                                                                                        │
│   ┌───────────────────────────┐      ┌───────────────────────────┐                     │
│   │   TenantResolutionFilter  │ ───► │  TenantContext (Thread)   │                     │
│   └─────────────┬─────────────┘      └─────────────┬─────────────┘                     │
│                 │                                  │                                   │
│                 ▼                                  │ Enforces Organization Scoping     │
│   ┌───────────────────────────┐                    ▼                                   │
│   │  JwtAuthenticationFilter  │ ───► ┌───────────────────────────┐                     │
│   └─────────────┬─────────────┘      │ Spring Security Method    │                     │
│                 │                    │ Security (@PreAuthorize)  │                     │
│                 ▼                    └─────────────┬─────────────┘                     │
│   ┌───────────────────────────┐                    │                                   │
│   │ REST Controllers & DTOs   │ ◄──────────────────┘                                   │
│   └─────────────┬─────────────┘                                                        │
│                 │                                                                      │
│                 ▼                                                                      │
│   ┌───────────────────────────┐       ┌──────────────────────────┐                     │
│   │ Business Services Layer   │ ────► │ Transactional Outbox     │ ──► [ Mailpit/SMTP] │
│   └─────────────┬─────────────┘       └──────────────────────────┘                     │
│                 │                                                                      │
│                 ▼                                                                      │
│   ┌───────────────────────────┐                                                        │
│   │ Spring Data JPA + Specs   │ ───►  [ PostgreSQL 17 (Multi-Tenant Schema) ]          │
│   └───────────────────────────┘       Managed via Liquibase Versioned Migrations        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Engineering Decisions
1. **Tenant Isolation via Subdomain Resolution:** Tenants are resolved dynamically at the servlet filter level from incoming `Host` / `X-Forwarded-Host` headers without trusting client payload tampering.
2. **Stateless JWT Security & Brute-Force Defense:** Cryptographically signed tokens with tenant context validation. Integrated sliding-window lockout protection that temporarily locks accounts after repeated failed attempts.
3. **Database Versioning via Liquibase:** Schema definitions (`001-init-schema.sql`), test seeds (`002-seed-data.sql`), and email outboxes (`003-email-outbox.sql`) are version-controlled with zero manual DDL.
4. **Modern Frontend Architecture:** Angular 21 with Standalone Components, typed reactive forms, native control flows (`@if`, `@for`), and automated Vitest test suite.

---

## 👥 Role Capabilities Matrix

| Feature | Employee | Manager | HR Admin |
| :--- | :---: | :---: | :---: |
| **Clock-In / Clock-Out & Break Tracking** | ✅ | ✅ | ✅ |
| **Personal Timesheet History & Daily Stats** | ✅ | ✅ | ✅ |
| **Time Correction Requests (Post-Lock)** | ✅ | ✅ | ✅ |
| **Leave Request Submission & Balance Tracking** | ✅ | ✅ | ✅ |
| **Team Timesheet Approvals & Rejections** | ❌ | ✅ | ✅ |
| **Team Leave Approval / Denial with Context** | ❌ | ✅ | ✅ |
| **Team Availability & Overlap Insights** | ❌ | ✅ | ✅ |
| **Company-Wide People & Membership Directory** | ❌ | ❌ | ✅ |
| **Employee Invitations & Onboarding Links** | ❌ | ❌ | ✅ |
| **Department & Project Allocation Management** | ❌ | ❌ | ✅ |
| **Company Payroll & Overtime Report (CSV/Excel)** | ❌ | ❌ | ✅ |
| **Compliance, Department Utilization Reports** | ❌ | ❌ | ✅ |
| **Security Audit Logs Trail Viewer** | ❌ | ❌ | ✅ |

---

## 💻 Tech Stack

### Backend
* **Runtime & Framework:** Java 17, Spring Boot 3.3.5
* **Security & Auth:** Spring Security 6, JWT (io.jsonwebtoken 0.11.5), BCrypt
* **Persistence & ORM:** Spring Data JPA, Hibernate, PostgreSQL 17
* **Database Migrations:** Liquibase Core
* **Reporting:** Apache POI (OOXML for Excel), OpenCSV
* **Documentation:** SpringDoc OpenAPI 2.6 (Swagger UI)
* **Testing:** JUnit 5, Mockito, Testcontainers (PostgreSQL container integration tests)

### Frontend
* **Framework:** Angular 21 (Standalone Components, Zoneless-compatible architecture)
* **Styling:** SCSS, Apple Human Interface inspired design principles (calm, precise, zero-clutter)
* **Testing:** Vitest, jsdom
* **Tooling:** Angular CLI, Prettier, TypeScript 5.9

### Infrastructure & DevOps
* **Containerization:** Multi-stage Dockerfiles for backend and frontend
* **Orchestration:** Docker Compose (PostgreSQL 17, Spring Boot API, Angular NGINX, Mailpit)
* **CI/CD:** GitHub Actions (Automated Maven verify, Testcontainers, npm build, Vitest)

---

## ⚡ Quick Start (Docker Compose)

The fastest way to spin up the entire multi-tenant stack locally is with Docker Compose.

### 1. Configure Local Hosts for Subdomains
Multi-tenancy relies on subdomains. Map the demo tenant domains to your local loopback address:

* **Windows:** Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator)
* **macOS / Linux:** Edit `/etc/hosts` (with `sudo`)

Add the following line:
```hosts
127.0.0.1  acme.localhost globex.localhost
```

### 2. Launch the Application
```bash
# Clone the repository
git clone https://github.com/abd-mjahdi/hr-system.git
cd hr-system

# Create your environment configuration from template
cp .env.example .env

# Start all containers (Postgres, Mailpit, Backend, Frontend)
docker compose up --build
```

### 3. Access the System
Once healthy, navigate to:
* **Acme Corporation Portal:** [http://acme.localhost:4200](http://acme.localhost:4200)
* **Globex Corporation Portal:** [http://globex.localhost:4200](http://globex.localhost:4200)
* **Mailpit (Local Email Inbox):** [http://localhost:8025](http://localhost:8025)
* **Backend API Swagger / OpenAPI:** [http://acme.localhost:8080/swagger-ui.html](http://acme.localhost:8080/swagger-ui.html)

---

## 🔑 Demo Credentials

All seed accounts share the same development password: **`password`**

### Company 1: Acme Corp (`acme.localhost:4200`)
| Role | Email | Password | Scope / Department |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `alice.morgan@company.com` | `password` | Organization-wide control |
| **Manager** | `carol.knight@company.com` | `password` | Engineering Manager |
| **Employee** | `ivan.petrov@company.com` | `password` | Senior Software Engineer |

### Company 2: Globex Corp (`globex.localhost:4200`)
| Role | Email | Password | Scope / Department |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `emma.frost@globex.com` | `password` | Organization-wide control |

---

## 🛠️ Manual Development Setup

If you prefer running services natively outside Docker:

### Prerequisites
* **Java 17+** (JDK)
* **Node.js 20+** and **npm**
* **PostgreSQL 15+** running locally on port `5432`

### 1. Database
```sql
CREATE DATABASE employee_hr;
CREATE USER hr WITH PASSWORD 'hr_secret_password';
GRANT ALL PRIVILEGES ON DATABASE employee_hr TO hr;
```

### 2. Backend (Spring Boot)
```bash
cd backend

# Run migrations and start the Spring Boot application (dev profile seeds demo data)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
The API starts on `http://localhost:8080`.

### 3. Frontend (Angular)
```bash
cd frontend

# Install dependencies
npm install

# Start development server bound to loopback
npm start
```
The frontend is available at `http://localhost:4200` or `http://acme.localhost:4200`.

---

## 🧪 Testing & Quality Assurance

Both frontend and backend are thoroughly verified in continuous integration:

```bash
# Backend: Run unit and Testcontainers-powered integration tests
cd backend
./mvnw clean verify

# Frontend: Run unit tests with Vitest
cd frontend
npm test -- --watch=false
```

* **Testcontainers Integration:** Integration tests run against an ephemeral PostgreSQL Docker container (`AbstractPostgresIT`) testing real SQL constraints, triggers, and transactions without mocks.
* **Surefire Reports:** Generates full test reports during Maven verification.

---

## 📂 Submodule Documentation

For in-depth architectural walkthroughs of each tier, consult the respective sub-project guides:
* [Backend Deep Dive & API Documentation (backend/README.md)](./backend/README.md)
* [Frontend Architecture & Design Principles (frontend/README.md)](./frontend/README.md)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
