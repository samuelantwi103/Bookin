# bookin — 4+1 Architectural View Model

> **Course**: CPEN 421 — Mobile & Web Software Design, University of Ghana  
> **Project**: Campus Facility Booking System  
> **Team**: Lab 7  
> **Date**: 2026-03-02

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Logical View](#2-logical-view)
3. [Development View](#3-development-view)
4. [Process View](#4-process-view)
5. [Physical View](#5-physical-view)
6. [Scenarios (Use Case View)](#6-scenarios-use-case-view)

---

## 1. Introduction

### 1.1 Purpose

This document describes the architecture of **bookin**, a campus facility booking system for the University of Ghana, using Philippe Kruchten's **4+1 Architectural View Model**. Each view addresses a different set of concerns for different stakeholders.

### 1.2 Scope

bookin allows students and staff to browse campus buildings and facilities, check real-time availability in 30-minute time slots, and create bookings. Administrators manage the campus infrastructure (buildings, facilities, users) and approve or reject pending bookings through a comprehensive dashboard with usage analytics.

### 1.3 Architectural Style

The system follows a **3-tier client-server architecture** with a clear separation between:
- **Presentation Tier** — Next.js single-page application (React 19)
- **Application Tier** — Spring Boot REST API (Java 17)
- **Data Tier** — PostgreSQL relational database (Aiven Cloud)

The backend internally follows the **Model–View–Controller (MVC)** pattern with an intermediate Service layer.

### 1.4 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js, React, TypeScript | 16.1.6, 19, 5 |
| Backend | Spring Boot, Java, Maven | 4.0.2, 17, — |
| Database | PostgreSQL (Aiven Cloud) | Latest |
| ORM | Hibernate / JPA | Auto |
| API Docs | SpringDoc OpenAPI (Swagger) | 2.6.0 |
| Auth | BCrypt (spring-security-crypto) | — |
| Frontend Hosting | Vercel | — |
| Backend Hosting | Render | — |

---

## 2. Logical View

The logical view describes the system's key abstractions as objects or object classes. It captures the functional requirements—what the system provides to end users.

### 2.1 Class Diagram

```
┌─────────────────────┐       1   ┌──────────────────────┐
│      Building       │◄──────────│      Facility        │
├─────────────────────┤       *   ├──────────────────────┤
│ - id: Long          │           │ - id: Long           │
│ - name: String      │           │ - name: String       │
│ - code: String      │           │ - type: FacilityType │
│ - campus: String    │           │ - location: String   │
│ - description: Text │           │ - floor: String      │
└─────────────────────┘           │ - roomNumber: String │
                                  │ - capacity: int      │
                                  │ - description: Text  │
                                  │ - amenities: String  │
                                  │ - imageUrl: String   │
                                  │ - building: Building │
                                  └──────────┬───────────┘
                                             │ 1
                                             │
                                             │ *
┌─────────────────────┐       1   ┌──────────┴───────────┐
│       User          │◄──────────│      Booking         │
├─────────────────────┤       *   ├──────────────────────┤
│ - id: Long          │           │ - id: Long           │
│ - name: String      │           │ - facility: Facility │
│ - email: String     │           │ - user: User         │
│ - role: String      │           │ - date: LocalDate    │
│ - password: String  │           │ - startTime: Time    │
│   [@JsonIgnore]     │           │ - endTime: Time      │
└─────────────────────┘           │ - status: Status     │
                                  │ - purpose: String    │
                                  └──────────────────────┘

  «enum» BookingStatus             «enum» FacilityType
  ┌───────────────┐                ┌───────────────────┐
  │ PENDING       │                │ LECTURE_HALL       │
  │ CONFIRMED     │                │ SEMINAR_ROOM      │
  │ CANCELLED     │                │ COMPUTER_LAB      │
  └───────────────┘                │ STUDY_ROOM        │
                                   │ AUDITORIUM        │
                                   │ CONFERENCE_ROOM   │
                                   │ LABORATORY        │
                                   │ BOARDROOM         │
                                   │ STUDIO            │
                                   └───────────────────┘
```

### 2.2 Entity Relationships

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| Building → Facility | 1 : N | A building contains many facilities |
| Facility → Booking | 1 : N | A facility can have many bookings |
| User → Booking | 1 : N | A user can create many bookings |

### 2.3 Key Abstractions

- **Building**: Top-level organizational unit representing a physical campus building (e.g., Balme Library, UGBS Building).
- **Facility**: A bookable room within a building, characterized by type and capacity.
- **User**: An authenticated person with role-based access (USER or ADMIN).
- **Booking**: A time-bound reservation of a facility by a user, with a lifecycle (PENDING → CONFIRMED or CANCELLED).
- **AvailabilitySlot**: A computed 30-minute window (08:00–20:00) showing whether a facility is free on a given date.

### 2.4 Service Layer Logic

```
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
├──────────────────┬──────────────────┬───────────────────┤
│  BookingService  │ FacilityService  │   UserService     │
├──────────────────┼──────────────────┼───────────────────┤
│ createBooking()  │ getAllFacilities()│ createUser()      │
│ approveBooking() │ getFacilityById()│ getUserById()     │
│ updateBooking()  │ createFacility() │ getAllUsers()      │
│ cancelBooking()  │ updateFacility() │ updateUser()      │
│ getAvailSlots()  │ deleteFacility() │ deleteUser()      │
│ checkConflicts() │                  │ [BCrypt hashing]  │
└──────────────────┴──────────────────┴───────────────────┘
```

---

## 3. Development View

The development view describes the system's static organization in its development environment — the actual module and package structure.

### 3.1 Backend Package Structure

```
com.book.in/
├── InApplication.java              ← Spring Boot entry point
├── config/
│   ├── WebConfig.java              ← CORS configuration
│   └── DataSeeder.java             ← Demo data seeding (CommandLineRunner)
├── controller/
│   ├── AuthController.java         ← POST /auth/login, /auth/signup
│   ├── AvailabilityController.java ← GET /availability
│   ├── BookingController.java      ← CRUD /bookings + PUT /bookings/{id}/approve
│   ├── FacilityController.java     ← CRUD /facilities
│   ├── BuildingController.java     ← CRUD /buildings
│   └── UserController.java         ← CRUD /users
├── exception/
│   ├── GlobalExceptionHandler.java ← @RestControllerAdvice
│   ├── ResourceNotFoundException.java
│   └── BookingConflictException.java
├── model/
│   ├── Building.java               ← @Entity
│   ├── Facility.java               ← @Entity
│   ├── User.java                   ← @Entity
│   ├── Booking.java                ← @Entity
│   ├── BookingStatus.java          ← Enum
│   ├── FacilityType.java           ← Enum
│   └── AvailabilitySlot.java       ← DTO (non-entity)
├── repository/
│   ├── BookingRepository.java      ← JpaRepository + @Query
│   ├── FacilityRepository.java     ← JpaRepository
│   ├── UserRepository.java         ← JpaRepository
│   └── BuildingRepository.java     ← JpaRepository
└── service/
    ├── BookingService.java         ← Business logic + conflict detection
    ├── FacilityService.java        ← CRUD operations
    └── UserService.java            ← User management + password hashing
```

### 3.2 Frontend Project Structure

```
frontend/
├── next.config.ts                  ← Next.js configuration
├── package.json                    ← Dependencies (React 19, lucide-react)
├── tsconfig.json                   ← TypeScript configuration
└── src/
    ├── app/                        ← Next.js App Router (pages)
    │   ├── layout.tsx              ← Root layout (fonts, AuthProvider, ThemeProvider)
    │   ├── globals.css             ← Design system (CSS variables, light/dark)
    │   ├── page.tsx                ← Home — browse buildings & facilities
    │   ├── login/page.tsx          ← Authentication
    │   ├── signup/page.tsx         ← Registration
    │   ├── book/page.tsx           ← Multi-step booking wizard
    │   ├── bookings/page.tsx       ← Booking list + filters + approve/cancel
    │   └── admin/
    │       ├── page.tsx            ← Admin dashboard (Campus, Users, Analytics)
    │       ├── facilities/page.tsx ← Facility management
    │       └── users/page.tsx      ← User management
    ├── components/
    │   ├── Navbar.tsx              ← Navigation + dark mode toggle
    │   ├── FacilityCard.tsx        ← Facility display card
    │   ├── AvailabilityGrid.tsx    ← 30-min slot picker
    │   └── ConfirmModal.tsx        ← Reusable confirmation dialog
    ├── context/
    │   ├── AuthContext.tsx          ← Authentication state (localStorage)
    │   └── ThemeContext.tsx         ← Dark/light mode state (localStorage)
    └── lib/
        ├── api.ts                  ← Centralized API client (fetch wrapper)
        └── types.ts                ← TypeScript interfaces
```

### 3.3 Layer Dependencies

```
┌──────────────┐
│  Controller  │ ← Depends on Service (injected via @Autowired)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │ ← Depends on Repository (injected via constructor)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Repository  │ ← Depends on Model (JPA entity)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Model     │ ← No dependencies (POJO + JPA annotations)
└──────────────┘
```

### 3.4 Build & Dependency Management

- **Backend**: Maven (`pom.xml`) — Spring Boot 4.0.2, spring-boot-starter-data-jpa, spring-boot-starter-webmvc, spring-boot-starter-validation, postgresql, lombok, spring-security-crypto, springdoc-openapi
- **Frontend**: pnpm (`package.json`) — next 16.1.6, react 19, typescript 5, lucide-react 0.469.0

---

## 4. Process View

The process view describes the system's concurrency and synchronization aspects — runtime behavior, threads, and interaction flows.

### 4.1 Booking Creation Flow (Sequence)

```
Student          Frontend           Backend API         BookingService      BookingRepo        Database
  │                 │                    │                    │                  │                │
  │  Select slot    │                    │                    │                  │                │
  │────────────────>│                    │                    │                  │                │
  │                 │ POST /bookings     │                    │                  │                │
  │                 │───────────────────>│                    │                  │                │
  │                 │                    │ createBooking()    │                  │                │
  │                 │                    │───────────────────>│                  │                │
  │                 │                    │                    │ findFacility()   │                │
  │                 │                    │                    │─────────────────>│                │
  │                 │                    │                    │                  │  SELECT        │
  │                 │                    │                    │                  │───────────────>│
  │                 │                    │                    │ findConflicts()  │                │
  │                 │                    │                    │─────────────────>│                │
  │                 │                    │                    │                  │  JPQL query    │
  │                 │                    │                    │                  │───────────────>│
  │                 │                    │                    │ [no conflict]    │                │
  │                 │                    │                    │ status=PENDING   │                │
  │                 │                    │                    │ save(booking)    │                │
  │                 │                    │                    │─────────────────>│                │
  │                 │                    │                    │                  │  INSERT        │
  │                 │                    │                    │                  │───────────────>│
  │                 │                    │  201 Created       │                  │                │
  │                 │<───────────────────│                    │                  │                │
  │  "Pending"      │                    │                    │                  │                │
  │<────────────────│                    │                    │                  │                │
```

### 4.2 Booking Approval Flow

```
Admin            Frontend           Backend API         BookingService      BookingRepo
  │                 │                    │                    │                  │
  │  Click Approve  │                    │                    │                  │
  │────────────────>│                    │                    │                  │
  │                 │ PUT /bookings/     │                    │                  │
  │                 │   {id}/approve     │                    │                  │
  │                 │───────────────────>│                    │                  │
  │                 │                    │ approveBooking(id) │                  │
  │                 │                    │───────────────────>│                  │
  │                 │                    │                    │ findById(id)     │
  │                 │                    │                    │─────────────────>│
  │                 │                    │                    │ check PENDING    │
  │                 │                    │                    │ status=CONFIRMED │
  │                 │                    │                    │ save(booking)    │
  │                 │                    │                    │─────────────────>│
  │                 │                    │  200 OK (booking)  │                  │
  │                 │<───────────────────│                    │                  │
  │  "Confirmed"    │                    │                    │                  │
  │<────────────────│                    │                    │                  │
```

### 4.3 Concurrent Request Handling

- **Spring Boot Embedded Tomcat**: Handles concurrent HTTP requests via a thread pool (default: 200 threads). Each request is processed by a separate thread.
- **Database Connection Pooling**: HikariCP manages a pool of database connections, preventing connection exhaustion under load.
- **Booking Conflict Detection**: The `findConflictingBookings` JPQL query runs within a database transaction, ensuring that concurrent booking attempts for the same time slot are correctly detected and one is rejected with a `BookingConflictException`.
- **Stateless API**: No server-side session state. Authentication is per-request (email + password verification). This allows horizontal scaling without session affinity.

### 4.4 Frontend State Management

```
┌──────────────────────────────────────────────┐
│              React Component Tree            │
│                                              │
│  ThemeProvider (dark/light via localStorage) │
│    └── AuthProvider (user state)             │
│          └── Layout                          │
│                ├── Navbar (theme toggle)     │
│                └── Page Components           │
│                      ├── useState (local)    │
│                      └── useEffect (API)     │
└──────────────────────────────────────────────┘
```

- **AuthContext**: Persists user session to `localStorage`, provides `login()`, `logout()`, `user` state across all pages.
- **ThemeContext**: Persists theme preference to `localStorage`, toggles `data-theme` attribute on `<html>`.
- **API Caching**: Pages cache responses in `localStorage` with a 3-minute TTL to reduce redundant network requests.

---

## 5. Physical View

The physical view describes the mapping of software onto hardware — the system's deployment topology.

### 5.1 Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
│                                                                      │
│   ┌──────────────┐        HTTPS          ┌──────────────────────┐   │
│   │   Browser    │◄─────────────────────►│     Vercel CDN       │   │
│   │   (Client)   │                       │  (Frontend Hosting)  │   │
│   │              │                       │                      │   │
│   │  - React 19  │                       │  - Next.js SSR/SSG   │   │
│   │  - JS bundle │                       │  - Static assets     │   │
│   │  - CSS       │                       │  - Edge functions    │   │
│   └──────┬───────┘                       └──────────────────────┘   │
│          │                                                           │
│          │  REST API calls (HTTPS + JSON)                            │
│          │                                                           │
│          ▼                                                           │
│   ┌──────────────────────────────────┐                               │
│   │         Render Instance          │                               │
│   │     (Backend Hosting - PaaS)     │                               │
│   │                                  │                               │
│   │  ┌───────────────────────────┐   │                               │
│   │  │  Spring Boot Application  │   │                               │
│   │  │  (Embedded Tomcat)        │   │                               │
│   │  │                           │   │                               │
│   │  │  - REST Controllers       │   │                               │
│   │  │  - Service Layer          │   │                               │
│   │  │  - JPA / Hibernate        │   │                               │
│   │  │  - Swagger UI             │   │                               │
│   │  │  - HikariCP Pool         │   │                               │
│   │  └──────────┬────────────────┘   │                               │
│   │             │                    │                               │
│   └─────────────┼────────────────────┘                               │
│                 │                                                     │
│                 │  JDBC (SSL/TLS)                                     │
│                 ▼                                                     │
│   ┌──────────────────────────────────┐                               │
│   │       Aiven Cloud (DBaaS)        │                               │
│   │                                  │                               │
│   │  ┌───────────────────────────┐   │                               │
│   │  │    PostgreSQL Instance    │   │                               │
│   │  │                           │   │                               │
│   │  │  Tables:                  │   │                               │
│   │  │  - buildings              │   │                               │
│   │  │  - facilities             │   │                               │
│   │  │  - users                  │   │                               │
│   │  │  - bookings               │   │                               │
│   │  │                           │   │                               │
│   │  │  SSL: Required            │   │                               │
│   │  │  Mode: require            │   │                               │
│   │  └───────────────────────────┘   │                               │
│   │                                  │                               │
│   └──────────────────────────────────┘                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Deployment URLs

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://bookin-web.vercel.app/ |
| Backend API | Render | https://bookin-36aa.onrender.com |
| API Docs | Render | https://bookin-36aa.onrender.com/swagger-ui/index.html |
| Database | Aiven Cloud | *(private — SSL connection only)* |

### 5.3 Environment Configuration

| Variable | Component | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel) | Backend API base URL |
| `DB_HOST` | Backend (Render) | PostgreSQL hostname |
| `DB_PORT` | Backend (Render) | PostgreSQL port |
| `DB_NAME` | Backend (Render) | Database name |
| `DB_USERNAME` | Backend (Render) | Database credentials |
| `DB_PASSWORD` | Backend (Render) | Database credentials |
| `CORS_ORIGIN` | Backend (Render) | Allowed frontend origin |

### 5.4 Network Protocols

| Connection | Protocol | Port | Security |
|-----------|----------|------|----------|
| Browser ↔ Vercel | HTTPS | 443 | TLS 1.3 |
| Browser ↔ Render API | HTTPS | 443 | TLS 1.3 |
| Render ↔ Aiven DB | JDBC | 5432* | SSL (required) |

---

## 6. Scenarios (Use Case View)

The scenarios view ("+1") illustrates the architecture through key use cases. Each scenario exercises elements from multiple views and validates the architectural decisions.

### 6.1 Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │         bookin System                    │
                    │                                         │
  ┌──────┐         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC1: Browse Facilities          │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC2: Check Availability         │     │
  │ User │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC3: Create Booking             │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC4: View My Bookings           │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC5: Cancel Booking             │     │
  └──────┘         │  └────────────────────────────────┘     │
                    │                                         │
  ┌──────┐         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC6: Approve / Reject Booking   │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │Admin │─────────┼─>│ UC7: Manage Buildings           │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC8: Manage Facilities          │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC9: Manage Users               │     │
  │      │         │  └────────────────────────────────┘     │
  │      │         │  ┌────────────────────────────────┐     │
  │      │─────────┼─>│ UC10: View Analytics            │     │
  └──────┘         │  └────────────────────────────────┘     │
                    │                                         │
                    └─────────────────────────────────────────┘
```

### 6.2 Scenario Descriptions

#### UC1: Browse Facilities
| Attribute | Description |
|-----------|-------------|
| **Actor** | User (Student / Admin) |
| **Precondition** | User is logged in |
| **Flow** | 1. User navigates to Home page (`/`) → 2. Frontend calls `GET /buildings` and `GET /facilities` → 3. Server queries database → 4. Results displayed as cards grouped by building |
| **Views Exercised** | Logical (Building, Facility), Process (API call), Physical (Vercel → Render → Aiven) |

#### UC2: Check Availability
| Attribute | Description |
|-----------|-------------|
| **Actor** | User |
| **Precondition** | User has selected a facility and date |
| **Flow** | 1. User selects facility + date on Book page → 2. Frontend calls `GET /availability?facilityId=X&date=Y` → 3. `BookingService.getAvailableSlots()` generates 24 half-hour slots (08:00–20:00) → 4. Cross-references with existing bookings → 5. Returns slot array with `available: true/false` → 6. Rendered as AvailabilityGrid component |
| **Views Exercised** | Logical (AvailabilitySlot, Booking), Development (AvailabilityController → BookingService → BookingRepository), Process (slot computation) |

#### UC3: Create Booking
| Attribute | Description |
|-----------|-------------|
| **Actor** | User |
| **Precondition** | User is logged in, available slot selected |
| **Flow** | 1. User fills booking form → 2. `POST /bookings` with facilityId, userId, date, startTime, endTime, purpose → 3. `BookingService.createBooking()` validates facility/user exist → 4. Runs conflict detection via JPQL → 5. If no conflict, creates booking with status `PENDING` → 6. Returns 201 Created → 7. User sees "Booking submitted — awaiting admin approval" |
| **Postcondition** | Booking exists in database with status PENDING |
| **Error Path** | If time conflict exists → `BookingConflictException` → 409 Conflict response |

#### UC4: View My Bookings
| Attribute | Description |
|-----------|-------------|
| **Actor** | User |
| **Flow** | 1. User navigates to Bookings page (`/bookings`) → 2. Frontend calls `GET /bookings?userId=X` → 3. Results displayed in filtered table with status badges → 4. Personal Insights section shows usage analytics |

#### UC5: Cancel Booking
| Attribute | Description |
|-----------|-------------|
| **Actor** | User (owner) or Admin |
| **Precondition** | Booking exists and is not already cancelled |
| **Flow** | 1. User clicks Cancel on a booking → 2. ConfirmModal shown → 3. On confirm, `DELETE /bookings/{id}` → 4. `BookingService.cancelBooking()` sets status to CANCELLED → 5. UI refreshes |

#### UC6: Approve Booking
| Attribute | Description |
|-----------|-------------|
| **Actor** | Admin |
| **Precondition** | Booking is in PENDING status |
| **Flow** | 1. Admin views bookings list → 2. Sees "Approve" button for PENDING bookings → 3. Clicks Approve → ConfirmModal shown → 4. On confirm, `PUT /bookings/{id}/approve` → 5. `BookingService.approveBooking()` changes status PENDING → CONFIRMED → 6. UI refreshes with new status |
| **Error Path** | If booking is not PENDING → `BookingConflictException` → 409 response |

#### UC7: Manage Buildings
| Attribute | Description |
|-----------|-------------|
| **Actor** | Admin |
| **Flow** | Admin Dashboard → Campus Tab → Create/Edit/Delete buildings via modal forms → `POST/PUT/DELETE /buildings` |

#### UC8: Manage Facilities
| Attribute | Description |
|-----------|-------------|
| **Actor** | Admin |
| **Flow** | Admin Dashboard → Campus Tab → Expand building accordion → Create/Edit/Delete facilities → `POST/PUT/DELETE /facilities` with `buildingId` association |

#### UC9: Manage Users
| Attribute | Description |
|-----------|-------------|
| **Actor** | Admin |
| **Flow** | Admin Dashboard → Users Tab → View user table → Edit role or delete users → `PUT/DELETE /users/{id}` |

#### UC10: View Analytics
| Attribute | Description |
|-----------|-------------|
| **Actor** | Admin |
| **Flow** | Admin Dashboard → Analytics Tab → View charts: 7-day booking trend (bar), peak hours heatmap, facility type distribution, building utilization, top bookers, recent activity |

### 6.3 Architectural Decisions Validated by Scenarios

| Decision | Rationale | Validated By |
|----------|-----------|--------------|
| 3-tier architecture | Clear separation of UI, logic, and data | All use cases cross all 3 tiers |
| REST API (stateless) | Frontend and backend can evolve independently; enables horizontal scaling | UC1–UC10 all use HTTP/JSON |
| JPQL conflict detection | Database-level consistency for concurrent booking attempts | UC3 (conflict path) |
| CSS variables for theming | Single source of truth for colors; trivial dark mode toggle | UC1, UC4 (visual consistency) |
| BCrypt password hashing | Secure credential storage; no plaintext passwords | UC3 (authentication precondition) |
| localStorage caching | Reduces API calls, improves perceived performance | UC1, UC4 (repeat visits) |
| PENDING booking status | Admin oversight before confirming resource allocation | UC3, UC6 (approval workflow) |

---

## Appendix A: API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Authenticate user |
| POST | /auth/signup | Register new user |
| GET | /buildings | List all buildings |
| GET | /buildings/{id} | Get building details |
| POST | /buildings | Create building |
| PUT | /buildings/{id} | Update building |
| DELETE | /buildings/{id} | Delete building |
| GET | /facilities | List facilities (?buildingId= optional) |
| GET | /facilities/{id} | Get facility details |
| POST | /facilities | Create facility |
| PUT | /facilities/{id} | Update facility |
| DELETE | /facilities/{id} | Delete facility |
| GET | /bookings | List bookings (?userId= optional) |
| GET | /bookings/{id} | Get booking details |
| POST | /bookings | Create booking (status: PENDING) |
| PUT | /bookings/{id} | Update booking |
| PUT | /bookings/{id}/approve | Approve pending booking |
| DELETE | /bookings/{id} | Cancel booking |
| GET | /availability | Check slots (?facilityId=&date=) |
| GET | /users | List all users |
| GET | /users/{id} | Get user details |
| PUT | /users/{id} | Update user |
| DELETE | /users/{id} | Delete user |

---

## Appendix B: Database Schema (3NF)

All tables are in **Third Normal Form** — every non-key attribute depends on the whole key and nothing but the key.

| Table | Primary Key | Foreign Keys | Key Constraints |
|-------|------------|--------------|-----------------|
| buildings | id (BIGSERIAL) | — | name NOT NULL |
| facilities | id (BIGSERIAL) | building_id → buildings(id) | name, type, capacity NOT NULL |
| users | id (BIGSERIAL) | — | email UNIQUE, NOT NULL |
| bookings | id (BIGSERIAL) | facility_id → facilities(id), user_id → users(id) | date, start_time, end_time, status NOT NULL |
