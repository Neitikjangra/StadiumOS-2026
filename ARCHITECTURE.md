# Architecture

## System Overview

```
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js 15)                │
│  Command Center │ Stadium Ops │ Fan Experience    │
│  Routing        │ Analytics   │ Communications    │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────┴─────────────────────────────────┐
│           API Layer (Next.js Route Handlers)      │
│  80+ endpoints with RBAC, Zod validation, audit   │
└────────────────┬─────────────────────────────────┘
          ┌──────┴──────┐
     ┌────┴────┐  ┌─────┴──────┐  ┌─────────────┐
     │ Prisma  │  │  BullMQ    │  │  AI Engine  │
     │ (SQLite)│  │ (Redis*)   │  │  (RAG)      │
     └─────────┘  └────────────┘  └─────────────┘
                  * optional
```

## Data Flow

1. **Events** POST to `/api/ingest/*` → validated with Zod → enqueued via BullMQ
2. **Socket.IO** broadcasts real-time events to connected dashboards
3. **AI Engine** processes event streams → anomaly detection → risk scoring → recommendations
4. **Fan Assistant** retrieves knowledge → grounds response → generates answer
5. **All data flows from Prisma** → zero mock arrays, zero `Math.random()`, zero hardcoded constants

## AI Pipeline (Fan Assistant)

```
User Query
  → Input Sanitization (injection check)
  → Knowledge Retrieval (SQLite FTS5, top-3 chunks)
  → Context Assembly (system prompt + docs + query)
  → Prompt Injection Guard (9 patterns)
  → AI Generation (OpenAI or template fallback)
  → Response Formatting + Source Attribution
  → Return to Client
```

## AI Pipeline (Operator Risk Radar)

```
Event Stream
  → Anomaly Detection (threshold rules)
  → Risk Scoring (pattern matching + context)
  → Recommendation Generation (SOP-aware)
  → Confidence Calculation (multi-factor weighted)
  → Priority Ranking
  → Display in Risk Radar Panel
```

## Routing Engine

```
Stadium Graph (bidirectional)
  → Nodes: Gates, Exits, Concourses, Sections, Amenities
  → Edges: Bidirectional weighted connections
  → Dijkstra shortest-path with zone pressure weighting
  → Outputs: Recommended route, alternate gates, staged exit plans
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite over PostgreSQL | Zero-config for demo; no external DB required |
| Redis optional | App runs without Redis; queue/socket gracefully degraded |
| Lazy Redis/BullMQ init | Connections created on-demand, not at import time |
| Soft deletes | All major entities preserve history |
| 9-role RBAC | Granular permissions with stadium-scoping |
| Audit trails | Incident lifecycle, notifications, and settings changes logged |
| Template fallback AI | Demo works without OpenAI API key |
| Deterministic data gen | All operational data computed from DB via `deterministicHash()` — no randomness |
| Zero mock data | Every component, hook, API route, and AI tool queries live Prisma data |
| Bidirectional graph | Routing edges go both ways — can route FROM any node (section, gate, exit) |

## Directory Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, Sign-Up
│   ├── (dashboard)/        # Command Center, Incidents, Mobility, etc.
│   ├── (fan)/              # Fan experience pages
│   └── api/                # API route handlers (80+ endpoints)
├── components/             # React components
│   ├── ui/                 # Shared UI primitives (Button, Card, etc.)
│   ├── command-center/     # Dashboard widgets
│   ├── stadium-ops/        # Gate management, incident board, venue overview
│   ├── routing/            # Route map, admin, fan directions, simulation
│   ├── fan/                # Fan-facing components
│   └── ...                 # Feature-specific component directories
├── lib/                    # Core business logic
│   ├── ai/                 # RAG pipeline, prompts, guardrails, tools
│   ├── knowledge/          # Document chunking, embeddings, seed data
│   ├── command-center/     # Command center data actions
│   ├── comms/              # Communications, notifications, targeting
│   ├── incidents/          # Incident store and logic
│   ├── routing/            # Graph, optimizer, Dijkstra router
│   ├── stadium-ops/        # Stadium operations (db-actions, types)
│   ├── analytics/          # Analytics engine (real Prisma queries)
│   └── fan-assistant/      # Fan AI assistant (DB-backed knowledge)
├── hooks/                  # Custom React hooks
├── tests/                  # 422 unit tests (Vitest)
├── prisma/
│   ├── schema.prisma       # Database schema (30+ models)
│   ├── dev.db              # SQLite database
│   └── seed.ts             # 16 stadiums, 12 matches, 30+ incidents
├── middleware.ts            # Route protection, RBAC enforcement
├── lib/auth.ts             # NextAuth v5 configuration + getAuthFromRequest()
└── public/                 # Static assets (maps, icons)
```

## Pages (20 routes)

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Authentication |
| `/sign-up` | Public | Account creation |
| `/command-center` | Admin / Tournament Ops | Real-time operational dashboard |
| `/incidents` | Staff | Incident management and tracking |
| `/stadium-ops` | Staff | Gate, device, and shift management |
| `/mobility` | Staff | Crowd flow and transit monitoring |
| `/notifications` | Staff | Notification campaign management |
| `/comms` | Staff | Communications and message logs |
| `/knowledge` | Staff | Knowledge base and SOP documents |
| `/simulator` | Admin / Tournament Ops | Scenario simulation |
| `/routing` | Public | Venue map and route planner |
| `/analytics` | Public | Performance analytics dashboard |
| `/settings` | Super Admin | System configuration |
| `/profile` | Authenticated | User profile with role details and permissions |
| `/fan` | Public | Fan home experience |
| `/fan/map` | Public | Interactive venue map |
| `/fan/match-day` | Public | Match-day experience |
| `/fan/accessibility` | Public | Accessibility services |
| `/fan/assistant` | Public | AI-powered fan assistant |

## Security Layers

1. **Authentication** — NextAuth v5 with JWT tokens, Credentials provider
2. **Authorization** — `withGuard` middleware, 9-role permission matrix
3. **Input validation** — Zod schemas on all API routes
4. **Rate limiting** — 20 req/min on AI endpoints
5. **Prompt injection** — 9-pattern detection in `lib/ai/guardrails.ts`
6. **CORS** — Locked to localhost:3000 (dev) / production URL
7. **CSP** — Content Security Policy headers via Next.js config
8. **Audit** — All critical actions logged to AuditLog table

## DB Schema (Key Models)

| Model | Purpose |
|-------|---------|
| `Stadium` | 16 FIFA World Cup 2026 venues |
| `Zone` / `Section` / `Gate` / `Exit` | Stadium layout hierarchy |
| `Match` | Scheduled matches with teams, dates, attendance |
| `Incident` / `IncidentUpdate` | Full incident lifecycle |
| `StaffUser` | Personnel with roles and zone assignments |
| `VolunteerShift` | Volunteer scheduling |
| `DeviceStatusRecord` | IoT device health tracking |
| `QueueSnapshot` | Real-time queue measurements per gate/zone |
| `Notification` / `NotificationTemplate` | Communication campaigns |
| `KnowledgeDocument` / `KnowledgeChunk` | RAG knowledge base |
| `Alert` | Fan-facing alerts |
| `AuditLog` | Full audit trail |
| `TransitUpdate` | Transit disruption feeds |
| `WeatherSnapshot` | Weather data |
| `AccessibilityRequest` | Accessibility service requests |
| `RiskSignal` | AI-generated risk signals |
| `SOPRunbook` | Standard operating procedures |
