# ⚙️ Workline HR — Backend Service

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?logo=openjdk)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Liquibase](https://img.shields.io/badge/Liquibase-3.3.x-blueviolet.svg?logo=liquibase)](https://www.liquibase.com/)
[![Testcontainers](https://img.shields.io/badge/Testcontainers-PostgreSQL-black.svg?logo=testcontainers)](https://testcontainers.com/)

> **High-throughput, multi-tenant Spring Boot REST API** powering the Workline HR time tracking, leave management, and payroll compliance platform.

---

## 🏛️ System Architecture

The backend is built following **Clean Architecture** and domain-driven design principles, separating concerns across security, tenant isolation, business services, and database persistence.

```
                      Incoming HTTP Request (Host: acme.localhost:8080)
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   TenantResolutionFilter  │
                        └─────────────┬─────────────┘
                                      │ 1. Extracts subdomain ('acme')
                                      │ 2. Sets TenantContext (ThreadLocal)
                                      ▼
                        ┌───────────────────────────┐
                        │  JwtAuthenticationFilter  │
                        └─────────────┬─────────────┘
                                      │ 1. Validates Bearer JWT
                                      │ 2. Verifies token company matches TenantContext
                                      ▼
                        ┌───────────────────────────┐
                        │   Spring Security (RBAC)  │
                        └─────────────┬─────────────┘
                                      │ Enforces @PreAuthorize("hasRole(...)")
                                      ▼
                        ┌───────────────────────────┐
                        │      REST Controllers     │
                        └─────────────┬─────────────┘
                                      │ DTO Validation (@Valid)
                                      ▼
                        ┌───────────────────────────┐
                        │     Service Layer &       │
                        │   Transactional Outbox    │
                        └─────────────┬─────────────┘
                                      │ Business Logic, Overtime, Approval Flows
                                      ▼
                        ┌───────────────────────────┐
                        │  JPA Specs & Repositories │
                        └─────────────┬─────────────┘
                                      │ Mandatory tenant scoping (company_id)
                                      ▼
                        ┌───────────────────────────┐
                        │       PostgreSQL 17       │
                        └───────────────────────────┘
```

---

## 🔑 Key Architectural Highlights

### 1. Subdomain Multi-Tenancy & Tenant Resolution
* Every request is inspected by `TenantResolutionFilter`. The organization slug is parsed directly from the HTTP `Host` header (or `X-Forwarded-Host` if trusted).
* The resolved tenant ID is placed into `TenantContext` (a thread-bound context).
* All subsequent JPA Specifications, queries, and write operations automatically scope their criteria to `company_id`.
* The server strictly validates slugs against reserved identifiers (`www`, `api`, `app`, `admin`, `mail`) and denies unrecognized tenant requests before they reach controllers.

### 2. Enterprise Security & Authentication
* **Stateless JWT:** Authenticates users via HMAC-SHA256 tokens issued on `/auth/login`. Tokens contain user identity, role, and company membership.
* **Brute-Force Attack Mitigation:** `LoginAttemptService` monitors IP addresses and account attempts using an in-memory sliding window cache. Accounts or IPs exceeding thresholds are locked out for 15 minutes.
* **Method-Level Security:** Endpoints enforce strict authority checks (`@PreAuthorize("hasRole('HR_ADMIN')")`, `@PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")`).
* **Explicit Registration Policy:** Public `/auth/register` endpoints are locked with `denyAll()`. New employees enter solely via HR-generated invitations (`/invitations`) or administrative provisioning (`POST /users`).

### 3. Transactional Email Outbox Pattern
* Sending emails directly inside database transactions risks slow third-party API calls, distributed state failures, or rollback inconsistencies.
* Workline HR uses an **asynchronous outbox pattern**:
  1. The business transaction writes an email payload into the `email_outbox` table in the same atomic commit as the entity state change.
  2. A scheduled background worker (`EmailOutboxService`) polls pending records in batches, sends them via JavaMail/SMTP, and records success or handles exponential backoff retries (up to 8 attempts).

### 4. Overtime & Payroll Computation Engine
* `ReportService` implements complex payroll aggregation adhering to standard labor regulations:
  * **Daily Overtime:** Hours exceeding 8.0 hours in a single calendar date.
  * **Weekly Overtime:** Total weekly hours exceeding 40.0 hours.
* Exports can be downloaded as JSON or as formatted spreadsheets via **Apache POI** (`.xlsx`) and CSV streaming.

### 5. Automated Audit Trails
* Entity modifications trigger `AuditLogCompanyListener`, recording:
  * Actor ID & User details
  * Company scope
  * Action performed (`CREATE`, `UPDATE`, `APPROVE`, `DENY`, `CORRECTION`)
  * Target entity and metadata
* Audit logs are queryable only by HR Admins via `/audit-logs`.

---

## 📡 REST API Overview

Interactive Swagger / OpenAPI 3 documentation is available at `/swagger-ui.html` when running.

| Domain | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Public | Authenticates user; returns JWT token |
| | `POST` | `/auth/invitations/accept` | Public | Accepts an invitation and sets password |
| **Dashboard** | `GET` | `/users/me/dashboard` | All Roles | Aggregated summary stats, balances, pending tasks |
| **Time Entries**| `POST` | `/time-entries` | Employee+ | Clock-in, clock-out, break tracking, project allocation |
| | `GET` | `/time-entries/me` | Employee+ | Get personal time entries and statistics |
| | `GET` | `/time-entries/team` | Manager+ | View team members' time tracking entries |
| | `POST` | `/time-entries/{id}/approve` | Manager+ | Approve submitted employee timesheet |
| | `POST` | `/time-entries/{id}/reject` | Manager+ | Reject timesheet with feedback note |
| | `POST` | `/time-entries/{id}/correction-request` | Employee+ | Request modification to an already locked entry |
| **Leave** | `POST` | `/leave-requests` | Employee+ | Submit time-off request with duration & type |
| | `GET` | `/leave-requests/me` | Employee+ | View personal leave requests & status |
| | `GET` | `/leave-requests/pending` | Manager+ | View pending leave requests awaiting approval |
| | `POST` | `/leave-requests/{id}/approve` | Manager+ | Approve leave request |
| | `POST` | `/leave-requests/{id}/deny` | Manager+ | Deny leave request with required explanation |
| | `GET` | `/leave-balances/me` | Employee+ | View remaining leave day balances by category |
| **People** | `GET` | `/users` | HR Admin | Paginated list of company employees |
| | `POST` | `/users` | HR Admin | Provision new user directly |
| | `POST` | `/invitations` | HR Admin | Send an invitation email to a prospective employee |
| | `PATCH` | `/users/{id}/deactivate` | HR Admin | Deactivate an employee's access |
| **Reports** | `GET` | `/reports/payroll` | HR Admin | Payroll summary with regular & overtime hours |
| | `GET` | `/reports/department-utilization` | HR Admin | Utilization stats across departments |
| | `GET` | `/reports/compliance` | HR Admin | Labor law compliance and break verification |
| **Audit** | `GET` | `/audit-logs` | HR Admin | Search and inspect company security audit trail |
| **Internal** | `POST` | `/internal/bootstrap/company` | Secret Key | One-time initial seeding for empty environments |

---

## 🗄️ Database & Liquibase Migrations

All database evolution is handled through **Liquibase** migrations located in `src/main/resources/db/changelog`:

* `001-init-schema.sql`: Core tables (`companies`, `users`, `departments`, `company_memberships`, `leave_types`, `leave_requests`, `leave_balances`, `projects`, `time_entries`, `time_entry_breaks`, `audit_logs`).
* `002-seed-data.sql`: Seed data for development and testing contexts (Acme Corp & Globex Corp mock users, managers, and sample timesheets).
* `003-email-outbox.sql`: Schema for asynchronous, resilient mail delivery.

Migrations are triggered based on active contexts configured in `application.yaml`:
* `LIQUIBASE_CONTEXTS=prod`: Runs production schema migrations only.
* `LIQUIBASE_CONTEXTS=prod,seed`: Applies schema and populates development seed data.

---

## ⚙️ Configuration Properties

Key settings in `src/main/resources/application.yaml`:

| Property | Environment Variable | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `spring.datasource.url` | `DB_URL` | - | JDBC PostgreSQL connection URL |
| `spring.datasource.username` | `DB_USERNAME` | - | Database username |
| `spring.datasource.password` | `DB_PASSWORD` | - | Database password |
| `spring.jwt.secret` | `JWT_SECRET` | - | HMAC-SHA256 secret key (min 32 chars) |
| `spring.liquibase.contexts` | `LIQUIBASE_CONTEXTS` | `prod` | Active Liquibase execution contexts |
| `app.tenant.base-domain` | `TENANT_BASE_DOMAIN` | `workline.casa` | Base domain for multi-tenant extraction |
| `app.tenant.trust-forwarded-host` | `TENANT_TRUST_FORWARDED_HOST` | `false` | Enable when deployed behind reverse proxy / NGINX |
| `app.bootstrap.key` | `BOOTSTRAP_KEY` | - | Secret header required for initial database bootstrap |
| `reports.payroll.overtime.daily-hours`| - | `8.0` | Daily hours threshold before overtime triggers |
| `reports.payroll.overtime.weekly-hours`| - | `40.0` | Weekly hours threshold before overtime triggers |

---

## 🧪 Testing Strategy

Workline HR uses a comprehensive testing pyramid:

### 1. Unit Tests (`*Test.java`)
Fast, isolated tests using JUnit 5 and Mockito covering service business logic, overtime math, holiday calendars, and password validation.

### 2. Integration Tests with Testcontainers (`*IT.java`)
End-to-end tests that boot the Spring ApplicationContext and run against a real, ephemeral **PostgreSQL 17** container managed by Testcontainers (`AbstractPostgresIT`).
* Verifies real database constraints, foreign keys, and unique indexes.
* Tests authentication flows, security filters, and audit log generation against live SQL execution.

```bash
# Run unit and integration tests
./mvnw clean verify

# Run a specific integration test class
./mvnw test -Dtest=TimeEntryIT
```

---

## 🚀 Running Locally

```bash
# Compile and package
./mvnw clean package -DskipTests

# Run with 'dev' profile (runs on port 8080 with demo seed data)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
