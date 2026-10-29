# 🖥️ Workline HR — Frontend Client

[![Angular](https://img.shields.io/badge/Angular-21.2-red.svg?logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.x-brightgreen.svg?logo=vitest)](https://vitest.dev/)
[![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-ff69b4.svg)](https://prettier.io/)

> **Modern, enterprise-grade Single Page Application** built with Angular 21 Standalone Components, featuring dynamic subdomain multi-tenancy, strict role-based access control, and an Apple-inspired interface design system.

---

## 🎨 Design Philosophy & UX Standards

Workline HR is designed to keep human resource management quiet, clear, and distraction-free.

* **Apple Human Interface Principles:** Instant tactile feedback on pointer down (`scale(0.97)`), critically damped spring transitions without artificial bounce, spatial consistency, and translucent materials (`backdrop-filter: blur(20px)`).
* **System Typography:** Uses native platform font stacks (`system-ui`, San Francisco on macOS/iOS) with strict hierarchy (large titles, section headers, body, captions) preventing layout shifts.
* **Wayfinding & Navigation:** Every surface answers three questions: *Where am I? What can I do here? How do I leave?* Nested screens always feature a leading Back control linking to their parent root.
* **Zero Decorative Clutter:** No decorative illustrations, no emoji badges, and no noisy gradient washes. Meaning is conveyed through typography, spacing, and subtle contrast.

---

## 🏛️ Frontend Architecture

```
frontend/src/app/
├── core/                        # Singleton core infrastructure
│   ├── guards/                  # Route protection guards
│   │   ├── auth.guard.ts        # authGuard & guestGuard
│   │   ├── role.guard.ts        # Role-based route authorization
│   │   └── tenant.guard.ts      # Subdomain tenant validator & apex guard
│   ├── http/                    # API error models and mapping
│   ├── interceptors/            # HTTP interceptors
│   │   └── auth.interceptor.ts  # Injects Bearer JWT; handles 401 logout
│   ├── models/                  # Strictly-typed TypeScript interfaces
│   ├── services/                # Feature API communication services
│   └── tenant/                  # Subdomain extraction & URL resolution
│       ├── tenant.service.ts
│       └── tenant.util.ts
├── features/                    # Feature domain modules (Smart Components)
│   ├── auth/                    # Login, Company Lookup, Invite Acceptance
│   ├── dashboard/               # Role-aware executive summary & metrics
│   ├── departments/             # Department directory & editing
│   ├── layout/                  # Main App Shell (Sidebar, Header, Profile Popover)
│   ├── leave/                   # Leave requests, balance tracking & approval queues
│   ├── profile/                 # Current user account & preferences
│   ├── projects/                # Project allocations for timesheets
│   ├── reports/                 # Payroll, utilization, compliance reporting
│   ├── time/                    # Daily timesheets, clock-in/out, breaks, correction flows
│   └── users/                   # Employee directory, onboarding invitations, detail views
├── app.config.ts                # Application configuration & providers
└── app.routes.ts                # Top-level route hierarchy & permissions
```

---

## 🌐 Dynamic Multi-Tenancy & Routing

The client dynamically configures its API connection and views based on the browser's hostname:

1. **Subdomain Detection (`TenantService`):**
   * Inspects `window.location.hostname`.
   * Maps `acme.localhost` or `acme.workline.casa` $\rightarrow$ Tenant slug: `acme`.
2. **Dynamic API Routing:**
   * In development, requests automatically target `http://{slug}.localhost:8080`.
   * In production, requests target the origin domain or configured reverse proxy without hardcoded port overrides.
3. **Route Guard Hierarchy:**
   * **`tenantGuard`**: Validates whether the browser is currently accessing a valid tenant subdomain. If hit on the bare apex domain, it redirects to the company lookup flow.
   * **`marketingHomeGuard`**: Renders the public landing page only on the root domain (`localhost:4200` or `workline.casa`).
   * **`guestGuard`**: Prevents authenticated users from seeing login forms, redirecting them to `/dashboard`.
   * **`authGuard`**: Gates application features behind active JWT sessions in `localStorage`.
   * **`roleGuard`**: Restricts sensitive screens by verifying roles against `EMPLOYEE`, `MANAGER`, and `HR_ADMIN`.

---

## 📋 Feature Overview

### 1. Authentication & Onboarding
* **Company Domain Discovery:** Apex page allows users to look up their company workspace.
* **Subdomain Sign-in:** Tenant-branded login authenticated against the backend JWT API.
* **Invitation Acceptance (`/invite?token=...`):** Secure token verification allowing invited employees to set their credentials and join their organization directly.

### 2. Time Tracking (`/time`)
* **Interactive Time Sheet:** Log clock-in and clock-out hours, record break intervals, and allocate time to company projects.
* **Correction Requests:** Allows employees to request retrospective modifications on submitted or locked entries with audit-trailed manager approvals.
* **Manager Review Inbox:** Unified pending approvals queue with approve/reject actions.

### 3. Leave Management (`/leave`)
* **Category Balance Overview:** Live visualization of remaining vacation, sick, and personal days.
* **Smart Request Submission:** Date range selection with automatic non-working day and holiday subtraction.
* **Two-Tier Approval Flow:** Manager approval with optional HR sign-off for extended or company-wide absences.

### 4. People Operations & Team Directory (`/people`, `/team`)
* **Employee Directory:** Searchable and filterable employee table by department, status, and role.
* **Direct Provisioning:** Form for HR Administrators to directly create employee profiles.
* **Invitation Pipeline:** HR Administrators can send onboarding invitation links with pre-assigned roles, departments, and reporting managers.

### 5. Reports & Payroll Auditing (`/reports`)
* **Payroll & Overtime Summary:** Calculates standard hours, daily overtime (>8h), and weekly overtime (>40h) with direct CSV download.
* **Department Utilization & Project Distribution:** Tracks resource allocation across active projects and business units.
* **Compliance Checks:** Highlights missing timesheets, excessive daily intervals, and unapproved requests.

---

## ⚡ Development Setup

### 1. Prerequisites
* **Node.js** v20.x or v22.x
* **npm** v10+

### 2. Configure Local Hosts
Because the application detects tenants from hostnames, map your local loopback address:

Add to `C:\Windows\System32\drivers\etc\hosts` (Windows) or `/etc/hosts` (macOS/Linux):
```hosts
127.0.0.1  acme.localhost globex.localhost
```

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start local dev server (listens on 127.0.0.1:4200)
npm start
```

### 4. Access Local Portals
* **Acme Corp:** [http://acme.localhost:4200/login](http://acme.localhost:4200/login)
* **Globex Corp:** [http://globex.localhost:4200/login](http://globex.localhost:4200/login)
* **Find Company Flow:** [http://localhost:4200](http://localhost:4200)

*Seed credentials for all accounts: `password`*

---

## 🧪 Testing & Code Quality

### Unit Tests with Vitest
Unit tests are executed using **Vitest** for sub-second feedback and jsdom environment simulation:

```bash
# Run unit tests in watch mode
npm test

# Run single-pass test run (used in CI)
npm test -- --watch=false
```

### Formatting
Code style is enforced via **Prettier**:
```bash
npx prettier --check "src/**/*.{ts,html,scss}"
```

### Production Build
```bash
npm run build
```
Build output is optimized and emitted to `dist/frontend`.
