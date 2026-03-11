# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Code quality
pnpm lint         # Run ESLint + Biome (with auto-fix)
pnpm lint:fix     # Same as lint, with ESLint --fix
pnpm format       # Format code with Biome

# Database
pnpm db:generate  # Generate migration from schema changes
pnpm db:migrate   # Run migrations (uses POSTGRES_URL_DEV in dev)
```

## Architecture

This is a **multi-tenant SaaS platform** for AI-driven pre-operative health assessments. Clinics use the dashboard to manage patients; patients access assessments via one-time tokens (no account required).

### Route Groups

Three Next.js App Router route groups with separate layouts:

- **`(auth)/`** — Login, register, onboarding, password change for clinic staff
- **`(chat)/`** — Patient-facing AI interview interface (token-based access, no auth session)
- **`(dashboard)/`** — Clinic staff dashboard, patient/assessment management

Middleware (`middleware.ts`) handles all routing guards: redirects unauthenticated users, enforces onboarding completion, and handles invited-user flows. API routes bypass middleware auth — they use guard functions instead.

### API Security Layer

API routes use guard functions in `lib/api/` rather than middleware:
- `clinic-guard.ts` — Validates clinic staff session and membership
- `chat-guard.ts` — Validates patient token access
- `admin-guard.ts` — Validates platform admin access

### AI Integration (`lib/ai/`)

- **`providers.ts`** — AI Gateway configuration (Vercel AI Gateway → various LLM providers)
- **`models.ts`** — Available chat models
- **`prompts.ts`** — System prompts for the patient interview (in Brazilian Portuguese)
- **`tools/`** — Vercel AI SDK tool definitions for structured data collection during the interview (medications, cardiac conditions, lab values, surgery type, etc.)

The AI interview uses Vercel AI SDK's streaming with tool calls. Each tool in `lib/ai/tools/` defines one structured data collection step (e.g., `save-medications.ts`, `cardiac-structure.ts`, `creatinine.ts`). The interview culminates in `finalize-interview.ts` which triggers risk score calculation.

### Database Layer (`lib/db/`)

- **`schema.ts`** — All Drizzle ORM table definitions; types are inferred with `InferSelectModel`
- **`queries.ts`** — All database query functions
- **`rls-helper.ts`** — Row-Level Security helpers for multi-tenant isolation
- **`migrations/`** — Generated migration files (do not edit manually)

Key tables: `Clinic`, `User`, `ClinicInvitation`, `Patient`, `Assessment`, `Chat`, `ChatMessage`

User roles within a clinic: `secretary`, `clinician`, `admin`, `owner`

### Assessment Flow

1. Clinic creates assessment → system generates a time-limited token (7 days)
2. Patient accesses `/chat/[id]?token=...` — no login needed
3. Patient completes the initial health form (`components/chat/pre-chat-form/`)
4. AI conducts a conversational interview in Brazilian Portuguese
5. AI uses structured tools to collect RCRI/HAS2 risk factor data
6. `finalize-interview` tool triggers score calculation; webhook fires at `FINALIZE_INTERVIEW_WEBHOOK_URL`
7. Results appear in clinic dashboard immediately

### Configuration System

Clinics can customize their experience via JSON stored in the `Clinic` table:
- `formConfig` — Which health questions appear in the initial patient form (`lib/config/default-form-config.ts`)
- `dashboardConfig` — Which metrics/layouts appear in the dashboard (`lib/config/default-dashboard-config.ts`)
- Types defined in `lib/types/clinic-config.ts`

## Code Style

Formatter: **Biome** (primary) + ESLint for Next.js rules.

- 2-space indent, single quotes, trailing commas, semicolons, 80-char line width
- `noExplicitAny` is **off** — use `any` only when necessary
- `useExhaustiveDependencies` is **off** — hooks deps are not enforced by Biome
- Unused imports are warned (not errored)

## Environment Variables

```bash
POSTGRES_URL          # Production DB
POSTGRES_URL_DEV      # Dev DB (used by db:migrate, db:studio, db:push)
AUTH_SECRET           # next-auth session encryption
AI_GATEWAY_API_KEY    # Vercel AI Gateway key (local dev only; Vercel uses OIDC)
REDIS_URL             # Optional: enables resumable streams for long AI responses
BLOB_READ_WRITE_TOKEN # Vercel Blob (file uploads)
FINALIZE_INTERVIEW_WEBHOOK_URL  # Webhook called when interview completes
APP_URL               # Application base URL
```
