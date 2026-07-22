# Testing

## Summary

- **422 unit tests** across 16 test files
- **0 failures** — all tests pass
- **Framework**: Vitest with `@testing-library/react`

## Test Structure

```
tests/
├── lib/
│   ├── ai/                    # AI pipeline tests
│   │   ├── grounding.test.ts      # RAG retrieval + generation
│   │   ├── guardrails.test.ts     # Prompt injection detection
│   │   ├── confidence.test.ts     # Multi-factor scoring
│   │   └── vector-index.test.ts   # TF-IDF similarity search
│   ├── incidents/             # Incident management tests
│   │   ├── store.test.ts          # Incident store CRUD + lifecycle
│   │   ├── severity.test.ts       # Severity classification logic
│   │   ├── sla.test.ts            # SLA tracking + breach detection
│   │   └── dedup.test.ts          # Duplicate incident detection
│   ├── routing/               # Routing engine tests
│   │   ├── router.test.ts         # Route calculation
│   │   ├── optimizer.test.ts      # Queue recommendation logic
│   │   └── graph.test.ts          # Graph traversal
│   ├── comms/                 # Communications tests
│   │   ├── approval.test.ts       # Notification approval workflow
│   │   └── translation.test.ts    # Multilingual rewrite pipeline
│   ├── guards.test.ts         # Auth guard middleware
│   ├── rbac.test.ts           # Role-based access control
│   └── utils.test.ts          # Utility function tests
```

## Running Tests

```bash
# Unit tests (Vitest)
npm test

# Watch mode
npm run test:watch

# E2E tests (Playwright)
npm run test:e2e

# Full submission validation (typecheck + lint + tests + build)
npm run submission:final
```

## What's Tested

| Area | Tests | Coverage |
|------|-------|----------|
| AI grounding pipeline | 64 | Document retrieval, prompt assembly, generation, verification |
| Prompt injection protection | 32 | 9 injection patterns, content filtering, PII detection |
| Incident management | 123 | Store CRUD, severity classification, SLA tracking, deduplication |
| Routing engine | 78 | Route calculation, queue optimization, graph traversal |
| Communications | 53 | Approval workflow, multilingual translation, delivery |
| Auth + RBAC | 68 | Login flow, session management, 9-role permission matrix |
| Utilities | 4 | Date formatting, general helpers |

## API Endpoint Verification

All 80+ API endpoints are verified working with real Prisma data:

| Endpoint | Status | Data Source |
|----------|--------|-------------|
| `/api/command-center` | 200 | Prisma (incidents, zones, gates, queue snapshots) |
| `/api/routing/graph` | 200 | Prisma (gates, zones, exits, sections, amenities) |
| `/api/routing/recommend` | 200 | Dijkstra on bidirectional graph |
| `/api/routing/alternate-gates` | 200 | Nearest concourse when gate closed |
| `/api/routing/staged-exit` | 200 | Zone pressure-weighted exit plan |
| `/api/routing/zone-pressure` | 200 | QueueSnapshot aggregation |
| `/api/routing/simulate` | 200 | Scenario simulation with reroutes |
| `/api/routing/directions` | 200 | Route from gate to seat |
| `/api/analytics/metrics` | 200 | Computed from incidents, queues, devices |
| `/api/stadium-ops/device-health` | 200 | Prisma DeviceStatusRecord |
| `/api/fan/alerts` | 200 | Prisma Alert |
| `/api/incidents` | 200 | Prisma Incident |
| `/api/anomalies/acknowledge` | 200 | Prisma RiskSignal |

## Test Infrastructure

- **Framework**: Vitest with `@testing-library/react`
- **Mocking**: `vitest.fn()`, `vi.mock()` for store/API isolation
- **E2E**: Playwright against built app
- **CI**: GitHub Actions runs typecheck → lint → test → e2e → security → a11y
- **No mock data**: Tests run against deterministic functions, not random/seeded data
