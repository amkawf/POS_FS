# CLAUDE.md

## 1. Project Overview

Restaurant/cafe POS platform, restaurant-grade, cloud-only.

Scope:
- One company, multiple stores
- POS cashier
- Waiter ordering
- Customer QR ordering
- QR payment / payment gateway
- Kitchen / KDS
- Inventory and stock
- Employee management
- User and role management
- Device management
- Store management
- Table management
- Executive and store dashboards
- Order lifecycle: draft, complete, cancelled, void, refunded

Development uses incremental vertical slices.

## 2. Source of Truth

Priority:
1. Explicit locked decisions in current project documentation
2. Current repository implementation
3. FSD and System Architecture
4. Technical Design documents
5. This file
6. General best practices

Do not silently reconcile conflicting decisions. Surface the conflict and ask for approval when a locked decision is affected.

Important: the historical on-premise decision is superseded. Current deployment is **cloud-only**.

## 3. LOCKED Backend Architecture

- Go
- Gin
- Modular Monolith
- Pragmatic DDD
- PostgreSQL
- pgx
- sqlc
- Redis
- REST API
- WebSocket
- Transactional Outbox
- Background Worker
- Manual DI
- Constructor Injection
- Centralized Bootstrap
- Layered Error Handling
- Layered Validation
- Typed Configuration
- Cloud Secret Management
- Native Go Concurrency
- PostgreSQL as consistency boundary
- Context Propagation
- Graceful Shutdown
- Structured Logging
- Request ID
- Correlation ID
- Metrics
- Trace-ready design
- Separate Audit Logging
- Module Database Isolation
- Shared PostgreSQL multi-tenant strategy
- No default Redis distributed lock

Backend layering:

```text
Interface
    ↓
Application
    ↓
Domain

Infrastructure implements required interfaces.
```

Repository direction:

```text
Application / Domain
        ↓
Repository Interface
        ↑
Postgres Repository
        ↓
sqlc + pgx
```

Transactions are controlled at the application/use-case boundary.

Business changes and corresponding outbox events must be committed in the same transaction.

## 4. Backend Modules

```text
backend/internal/
├── identity/
├── company/
├── store/
├── employee/
├── device/
├── table/
├── menu/
├── order/
├── kitchen/
├── payment/
├── inventory/
├── qr_ordering/
├── reporting/
└── audit/
```

Do not bypass module boundaries by directly using another module's repositories or tables.

## 5. Database Rules

PostgreSQL is authoritative for transactional consistency.

Redis is non-authoritative / ephemeral.

Rules:
- Shared PostgreSQL, multi-company, multi-store
- Enforce company/store scope
- PostgreSQL owns relational integrity
- Go/domain/application owns business rules
- Migrations are incremental
- Do not create one giant migration
- Do not silently overwrite financial history
- Refunds are separate from original payments
- Inventory uses balance plus movement/ledger concepts
- Order items keep snapshot values such as name, SKU and price
- Table QR, customer session and order are separate concepts
- Do not introduce premature triggers/stored procedures/complex DB business logic

## 6. LOCKED Frontend Architecture

- TypeScript
- React
- PWA
- pnpm
- Turborepo
- TanStack Query
- Zustand
- IndexedDB
- REST
- OpenAPI-generated TypeScript client/types
- WebSocket

Four independent PWAs:

```text
frontend/
├── apps/
│   ├── pos/
│   ├── ordering/
│   ├── kitchen/
│   └── management/
└── packages/
    ├── ui/
    ├── api/
    ├── types/
    ├── auth/
    ├── config/
    └── utils/
```

Apps must not import one another. Shared stable abstractions belong in packages.

Do not create/reorganize packages merely to match a planned tree. Inspect existing code first.

## 7. Frontend State

```text
Server state       → TanStack Query
Client/UI state    → Zustand
Persistent state   → IndexedDB
Realtime updates   → WebSocket → TanStack Query
```

Backend is source of truth.

Do not use optimistic updates for:
- payment
- refund
- void
- inventory mutations
- critical order mutations

Frontend strategy is hybrid resilient PWA, not fully offline.

Connection states:
- ONLINE
- DEGRADED
- OFFLINE
- SYNCING

## 8. Frontend Surfaces

### POS
Cashier and operational workflows.

### Ordering
Customer Mode and Waiter Mode.

### Kitchen
Kitchen / KDS workflow.

### Management
Store management and executive dashboard.

Customer and waiter do not use conventional login in the current baseline.

## 9. Authentication Baseline

- POS: authenticated
- Management: authenticated
- Kitchen: device-based authentication
- Waiter: no conventional user login
- Customer: anonymous QR session

Authenticated PWA session baseline:

**Server-managed session + Secure/HttpOnly Cookie**

Authorization:

```text
User
 ↓
Role
 ↓
Permission
 ↓
Company Scope
 ↓
Store Scope
 ↓
Resource Scope
```

Backend enforces authorization.

Do not store authentication secrets in localStorage.

Do not invent unresolved authentication decisions.

## 10. API Rules

Baseline:

```text
REST
OpenAPI
Generated TypeScript client/types
Centralized API client
TanStack Query
```

Version:

```text
/api/v1
```

Error contract:

```text
error.code
error.message
error.fields (optional)
```

Frontend behavior depends on `error.code`, not message text.

Use selective retry and timeout/cancellation appropriately.

Critical mutations use idempotency keys.

## 11. Realtime

REST/backend state is authoritative. WebSocket is transport.

Use realtime for:
- order updates
- kitchen updates
- payment notifications
- device status

Reconnect:

```text
Disconnect
   ↓
Backoff
   ↓
Reconnect
   ↓
REST Resync
   ↓
Resume WebSocket
```

Frontend must tolerate duplicate/missed events.

Conceptual event envelope:

```text
event_id
event_type
occurred_at
company_id
store_id
resource_type
resource_id
version
data
```

## 12. Device Integration

```text
PWA
 ↓
Device Abstraction
 ↓
Browser API or Device Agent
 ↓
Hardware
```

Examples:
- receipt printer
- kitchen printer
- cash drawer
- POS/payment device

Device Agent handles hardware communication, health and commands. It is not business truth.

Hardware failure must remain distinguishable from business transaction failure.

## 13. QR Ordering

```text
Table QR
 ↓
Backend validation
 ↓
Anonymous customer session
 ↓
Table context
 ↓
Order session
 ↓
Order
 ↓
Payment
```

QR tokens are opaque and/or signed according to the final security design.

Multiple customer sessions per table are supported.

Backend validates context and remains authoritative.

## 14. Concurrency and Consistency

Use native Go concurrency for concurrent/background work.

Do not use global in-memory mutexes as the primary business-consistency mechanism.

Use PostgreSQL:
- transactions
- atomic operations
- row locking where appropriate
- unique constraints
- foreign keys
- domain/application invariants

Redis is not the default distributed lock.

Payment timeout/ambiguity is not automatically payment failure. Use webhook/reconciliation mechanisms.

## 15. Error and Validation Rules

Errors are layered:

```text
Domain
Application
Infrastructure
Interface / HTTP
```

Map internal errors to API errors at the interface boundary. Never expose raw DB errors.

Validation is layered:

```text
HTTP/request validation
        ↓
Application/use-case validation
        ↓
Domain invariants
```

## 16. Context and Shutdown

All request-scoped DB/network I/O propagates `context.Context`.

Blocking operations need appropriate timeouts.

Never store request contexts in long-lived structs.

Shutdown:

```text
Stop accepting new work
        ↓
Drain active work
        ↓
Stop workers
        ↓
Close realtime connections
        ↓
Close Redis/PostgreSQL
        ↓
Exit
```

Use a bounded shutdown timeout.

## 17. Observability

Backend:
- structured logs
- request ID
- correlation ID
- metrics
- health endpoints
- trace-ready architecture
- separate audit logging

Frontend telemetry:
- JavaScript errors
- API errors
- WebSocket errors
- PWA/service-worker errors
- device errors
- network/connection state
- Web Vitals where applicable

Minimize sensitive telemetry.

## 18. Vertical Slice Workflow

Do not wait for every Technical Design detail to be completed before connecting frontend.

Preferred flow:

```text
Database
   ↓
SQLC
   ↓
Repository
   ↓
Application Use Case
   ↓
HTTP Handler
   ↓
REST API
   ↓
Frontend API Client
   ↓
Frontend UI
```

Each slice should reach an end-to-end usable state before moving to the next major slice.

## 19. Current Milestone: Create Order

Current target:

```text
POS product click
   ↓
Cart
   ↓
Save Order
   ↓
POST /api/v1/orders
   ↓
CreateOrderUseCase
   ↓
PostgreSQL transaction
   ↓
orders + order_items
   ↓
API response
   ↓
POS UI reflects saved order
```

The repository already contains order-domain, repository/sqlc/database foundations and migrations. Inspect the actual repository before assuming which exact files are present.

Complete the smallest missing step in this vertical slice, then connect it to the existing POS frontend.

Do not jump prematurely to payment, inventory, kitchen, QR ordering or unrelated modules.

## 20. Existing Code Safety

Before modifying:
1. Inspect repository structure
2. Inspect `git status`
3. Read relevant docs
4. Inspect existing implementation
5. Run relevant tests
6. Identify what already exists
7. Make the smallest required change
8. Test
9. Review diff

Never blindly recreate files.

Never overwrite working user code.

Never delete/reset user changes without explicit approval.

## 21. Git Rules

Prefer one logical feature per commit.

Examples:

```text
feat(order): add create order api
feat(pos): connect order creation api
feat(order): add order retrieval
```

Do not reset, force-rewrite, delete user changes, or mix unrelated refactors into a focused feature without approval.

## 22. LOCKED / OPEN / DEFERRED

### LOCKED
Must not change without explicit approval.

### OPEN
May be investigated/proposed, but must not be silently locked.

### DEFERRED
Do not implement prematurely.

Known open/deferred areas include:
- detailed authentication
- CSRF details
- password policy
- MFA
- session lifetime/idle timeout
- detailed WebSocket protocol
- final event schema
- outbox schema
- retry policy
- DLQ
- payment provider
- device gateway implementation
- Redis data structures
- cloud provider
- orchestration
- CI/CD details
- backup strategy
- RPO/RTO
- infrastructure topology
- detailed transaction isolation/locking

If implementation requires one of these decisions, surface it instead of inventing it.

## 23. Things Claude Must NOT Change Without Approval

Do not change:
- Go backend
- Gin
- Modular Monolith
- Pragmatic DDD
- PostgreSQL
- pgx
- sqlc
- Redis role
- REST
- WebSocket
- Transactional Outbox
- Background Worker
- Manual DI
- Constructor Injection
- PostgreSQL consistency boundary
- shared PostgreSQL multi-tenant strategy
- React + TypeScript + PWA
- four PWA model
- TanStack Query / Zustand / IndexedDB roles
- backend as source of truth
- hybrid resilient PWA strategy
- server-managed session + Secure/HttpOnly Cookie baseline
- cloud-only deployment
- module boundaries

If a change appears necessary, explain why and ask for approval.

## 24. Definition of Done

A vertical slice is complete when:
- required domain/application behavior exists
- persistence exists
- transaction boundary is correct
- API contract exists
- API behavior is tested
- frontend is connected when the slice reaches the UI boundary
- loading/error/success states are handled
- idempotency is handled where required
- relevant tests pass
- locked architecture is unchanged
- unrelated refactors are absent
- git diff is understandable

Passing tests alone is not sufficient.

## 25. Claude Operating Procedure

For every task:
1. Inspect first.
2. Identify current state.
3. Identify the smallest next step.
4. State the intended change.
5. Implement only that step.
6. Test it.
7. Review the diff.
8. Report:
   - files changed
   - behavior added
   - tests run
   - remaining next step
   - architectural decisions needing approval

Do not automatically continue into unrelated slices.

The human owner controls architectural decisions.

Claude is an implementation agent working inside those decisions.
