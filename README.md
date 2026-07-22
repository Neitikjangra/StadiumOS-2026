# StadiumOS 2026

> AI-powered stadium operations platform for the FIFA World Cup 2026 — covering real-time command-center monitoring, incident management, routing, and fan experience across 16 venues.

---

## Why This Fits the Smart Stadiums & Tournament Operations Challenge

The 2026 World Cup spans 16 venues across 3 countries with 48 teams and 104 matches. Operators face thousands of simultaneous signals — crowd density, gate throughput, transit, weather, incidents. StadiumOS solves this with a unified AI-native platform:

- **Command Center** — Real-time operational dashboard with live incident feeds, AI risk radar, crowd heatmaps, queue monitoring, and escalation management.
- **Stadium Operations** — Gate management, SOP execution, device health, shift handoffs, and offline-capable queueing.
- **Routing** — Dijkstra-based route planner with bidirectional graph, alternate gate suggestions, staged exit plans, and live zone pressure monitoring.
- **Fan Experience** — Mobile-first companion with venue maps, accessibility services, and an AI assistant for real-time multilingual help.
- **Communications** — Targeted notification campaigns with approval workflows and multilingual translation.
- **Analytics** — Performance metrics computed from real Prisma data (incidents, queues, devices, transit, accessibility).

---

## How the AI Works

### Inputs

- Crowd density sensor readings (per zone)
- Gate throughput and wait-time metrics
- Transit disruption feeds
- Weather alerts
- Manual operator incident reports
- Fan natural-language queries

### Grounding Sources

- Stadium SOPs, FAQs, accessibility guides, and evacuation procedures stored as chunked documents in SQLite FTS5.
- TF-IDF vector index with 128-dimension embeddings for similarity search.
- Context assembled from top-3 most relevant chunks per query.
- **Real DB data** — All AI tools, fan knowledge, and alerts query live Prisma data. Zero hardcoded mock arrays.

### Decision Logic

| Stage | Mechanism |
|-------|-----------|
| Signal ingestion | Events validated with Zod, normalized, queued via BullMQ |
| Anomaly detection | Threshold rules (density >90%, wait >15min, weather alerts) |
| Risk scoring | Pattern matching + context → confidence-scored risk signals |
| Recommendation | SOP-aware action suggestions with severity classification |
| Escalation routing | Severity/type → appropriate team with timeline |

### Safety Constraints

- **Prompt injection protection** — 9 patterns detected in `lib/ai/guardrails.ts` (system-role overrides, delimiter escapes, PII extraction attempts).
- **Content filtering** — Responses scanned for injection markers before delivery.
- **Rate limiting** — 20 req/min per user on AI endpoints.
- **RBAC** — 9 roles with stadium-scoped permissions; AI only surfaces data the user is authorized to see.
- **Audit logging** — All AI interactions logged for review.

### Fallback Behavior

- Without an OpenAI API key, the AI engine returns template-based responses grounded in the knowledge base — the demo works fully offline with no external API costs.
- Without Redis, queue and socket features degrade gracefully (mock queue, null socket server).
- Without a database connection, the app returns structured error responses.

---

## Data Layer

All data is served from a live SQLite database via Prisma ORM. **Zero mock data, zero `Math.random()`, zero hardcoded arrays.**

| Source | What it provides |
|--------|-----------------|
| `Zone` / `Gate` | Stadium layout, capacity, status, congestion |
| `QueueSnapshot` | Real-time queue lengths and wait times per gate/zone |
| `Incident` / `IncidentUpdate` | Full incident lifecycle with notes, assignments, escalation |
| `StaffUser` | Personnel with roles, shifts, zone assignments |
| `DeviceStatusRecord` | IoT device health across the venue |
| `KnowledgeDocument` / `KnowledgeChunk` | SOPs, FAQs, guides for RAG retrieval |
| `Alert` | Fan-facing alerts (weather, security, transit) |
| `Notification` / `NotificationTemplate` | Communication campaigns with approval workflow |
| `AuditLog` | Full audit trail for all critical actions |
| `TransitUpdate` / `WeatherSnapshot` | External feed data |

---

## Repository Compliance

| Rule | Status |
|------|--------|
| Public repository required | **PASS** — Public GitHub repo |
| Single branch (`main`) required | **PASS** — Only `main` branch exists |
| Under 10 MB required | **PASS** — ~7 MB total (411 files) |
| GenAI mandatory | **PASS** — Core AI layer with RAG pipeline, prompt injection protection, confidence scoring |

---

## Evaluation Criteria Mapping

| Criterion | What We Did | Evidence |
|-----------|-------------|----------|
| **Code Quality** | TypeScript 0 errors. Duplicated `relativeTime` copies consolidated into `lib/utils.ts`. Dead code removed (965-line `mock-data.ts` deleted). Clean monorepo structure. | `npx tsc --noEmit` passes. `lib/utils.ts` single source of truth. |
| **Security** | Auth + RBAC on all 80+ routes. Zod validation on every input. Rate limiting. CORS locked. CSP headers. XSS fixed. Audit logging. Prompt injection protection. | `lib/ai/guardrails.ts`, `middleware.ts`, `next.config.js` |
| **Efficiency** | Debounced search inputs. React.memo on heavy components. Lazy loading for route-heavy pages. Code-split dynamic imports. Deterministic data generation (no randomness). | `components/` debounce utilities; `lib/stadium-ops/db-actions.ts` |
| **Testing** | 422 unit tests across 16 files covering AI pipeline, incident logic, routing, RBAC, comms, translation. | `tests/` directory |
| **Accessibility** | Skip-to-content. ARIA labels on all icon buttons. Form labels. `aria-live` regions. `role="dialog"` on modals. Keyboard navigation on clickable cards. Focus-visible rings. Reduced-motion support. | `components/ui/`, layout files |
| **Real-world usability** | 20 pages load. Login/logout flow works. Profile page with role-based permissions. Operator and fan journeys complete. All data from real DB. Empty states. Loading states. Offline awareness. | HTTP verification of all routes |
| **Logical decision making from user context** | AI Risk Radar analyzes user context (role, venue, time) to prioritize alerts. Fan assistant grounds responses in venue-specific knowledge. Escalation routing based on severity + type. | `lib/ai/confidence.ts`, `lib/ai/prompts.ts` |
| **GenAI usage** | RAG pipeline (chunk → embed → retrieve → generate). Prompt injection protection. Confidence scoring. Multilingual translation. Incident summarization. | `lib/ai/`, `lib/knowledge/` |

---

## Quick Start

```bash
git clone https://github.com/Neitikjangra/StadiumOS-2026.git && cd StadiumOS2026/apps/web
npm install
npx prisma generate && npx prisma db push
npx tsx prisma/seed.ts
npm run dev
# http://localhost:3000
```

Login: `admin@stadiumos.com` / `password123`
Sign up: Visit `/sign-up` to create a new account.
Log out: Click user avatar in header → Log out, or sidebar logout button.

### Available Roles

| Role | Access |
|------|--------|
| `admin` | Full access to all features |
| `tournament_ops` | Command center, incidents, simulator |
| `gate_manager` | Gate operations, queue monitoring |
| `security_lead` | Incidents, escalation, security feeds |
| `operations` | Stadium ops, device health, shifts |
| `comms` | Notifications, communications |
| `fan_services` | Fan experience, accessibility |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 |
| UI | Radix UI, shadcn/ui pattern |
| Database | SQLite via Prisma 6 ORM |
| Queue | BullMQ + Redis (optional) |
| Auth | NextAuth v5 (Credentials provider, JWT strategy) |
| Validation | Zod |
| AI | Custom RAG pipeline, OpenAI (optional) |
| Testing | Vitest, Playwright |
| Routing | Dijkstra shortest-path on bidirectional graph |

---

## Further Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, data flow, and key decisions
- [TESTING.md](./TESTING.md) — Test structure, coverage, and how to run tests
- [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) — Compliance and verification checklist

---

## License

Internal project — FIFA World Cup 2026 Stadium Operations Platform.
