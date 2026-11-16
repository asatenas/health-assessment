# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Rules

- **Never commit unless explicitly asked.** Do not create git commits proactively.
- **No co-author lines.** Do not add `Co-Authored-By` trailers to commit messages.

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

### Dashboard Panels (`components/dashboard/`)

The analytics view (`analytics-view.tsx`) composes several panels, all SWR-backed:

- **Today's + weekly panels** — props-driven from `useDashboardMetrics` and `useWeeklySurgeries`
- **Monthly panel** (`monthly-surgeries-panel.tsx`) — uses `useSWR` keyed by `month/year`; navigating months changes the key, SWR handles caching per month

**SWR invalidation after surgery mutations:** use `useSWRConfig`'s `mutate` with a filter matching both prefixes:
```ts
mutate(
  (key: unknown) =>
    typeof key === 'string' &&
    (key.startsWith('/api/clinic/metrics') ||
      key.startsWith('/api/clinic/monthly-surgeries')),
);
```

**`SurgeryDetailsModal`** stays open on save and triggers the above invalidation. The `onStatusUpdate` prop is a separate callback that closes the modal — do not call it from the save handler or the modal will close unexpectedly.

### Notifications System

<!-- TODO: Migrate notifications to a database table (Notification) for:
     - Persistent read/unread/dismissed state across devices
     - Notification history and audit trail
     - Independent fetching (not coupled to metrics endpoint)
     - Push notifications / real-time updates via websockets
     Currently computed on-the-fly, which is simple but limits UX. -->

Notifications are **computed on-the-fly** in `getHighPriorityNotifications()` (`lib/db/queries.ts`) — there is no database table. Each dashboard load evaluates all assessments/surgeries against trigger conditions and returns matching notifications.

- **Trigger types:** `high_risk_soon`, `incomplete_form`, `intervention_required`, `surgery_soon_incomplete` (high priority); `moderate_risk_soon`, `adjustments_required` (medium priority)
- **IDs** are derived from `chatId:type` (stable across requests) for dismiss support
- **Dismiss state** is stored in `localStorage` (`dismissed-notifications` key) with 7-day auto-expiry — not persisted to DB
- **Click-to-navigate** opens `SurgeryDetailsModal` for the notification's assessment
- **Display:** `NotificationsPanel` (`components/dashboard/notifications-panel.tsx`) — color-coded by priority (red/orange), toggleable via `dashboardConfig.widgets.notifications.enabled`

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

## Planned Migration to AWS

This project will be migrated off its current stack to AWS (project Region: `us-east-2`). Target AWS services have not been chosen yet.

- **Vercel** — app hosting, plus Vercel-specific integrations in use (AI Gateway with OIDC, Blob storage)
- **Neon** — Postgres (`POSTGRES_URL`, `POSTGRES_URL_DEV`)
- **Redis** — resumable AI streams (`REDIS_URL`)

When adding new infrastructure or integrations, prefer approaches that will carry over to AWS rather than deepening Vercel/Neon/Redis-specific coupling.

<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions take precedence.

## Context

### Terminology:

- Say "project" instead of "account" — a project contains an AWS account and settings for sharing with other collaborators
- Say "team member" instead of "IAM user" — users are invited by email, not created or federated in IAM
- Say "AWS Settings" when referring to management tasks at [settings.aws.com](https://settings.aws.com/) (project management, billing, team members, spend limits). Users view their actual AWS resources in the AWS Management Console.
- Say "selected Region" when referring to the user's Region — not "home Region"
- The user has a managed IAM experience. This includes a managed service control policies (SCP) and resource control policies (RCP) that govern the use of AWS. They will still need to use IAM to create policies to let services work with each other. If there are questions about the SCPs or RCPs, go to the documentation at https://docs.aws.amazon.com/accounts/latest/reference/scps-and-rcps-for-projects.html

### Constraints:

- All projects share a single AWS Region determined by the user's contact address. Resources cannot be created in other Regions
- When developing:
  - MUST create all Regional resources in the project's assigned Region
  - You CAN create AWS WAF and Cloudwatch Logs resources in us-east-1 when there are global resources (like a global WAF instance) that require a connection to dependencies in us-east-1. You should not use these for any other reason, because resources in the selected Region will provide lower cost (due to no cross-Region traffic), increased availability (due to no cross-Region traffic), and easier manageability (due to not needing to look in another Region). When you need to do an inventory of resources, you need to look in both the selected Region and us-east-1 for Cloudwatch Logs or WAF resources.
  - MUST NOT attempt to create Lambda, API Gateway, or other Regional resources in any other Region
  - MUST direct users to confirm their Region in AWS Settings > View all projects > Overview > Additional Info > Region. If the user cannot confirm their Region, check in ~/.aws/config
  - MUST NOT use Lambda@Edge — excluded from both Lambda and CloudFront
  - MUST NOT use CloudFormation StackSets — no multi-account or multi-Region deployments
  - MUST NOT attempt cross-Region actions — no cross-Region replication for DynamoDB/S3/RDS, no multi-Region KMS keys
  - MUST NOT use Route 53 cross-Region routing — geolocation, latency-based, and failover routing policies are not available
  - CloudFront is a global service and its actions ARE allowed in `us-east-1`. A user can create a CloudFront distribution pointing to their project-region Lambda function URL or API Gateway. However, Lambda and API Gateway themselves MUST NOT be created in `us-east-1` — they must be in the project Region.
  - Reduced availability in `eu-north-1` specifically: Amazon Rekognition, Amazon Textract, Amazon Personalize, AWS App Runner are not available in that Region.
- IAM permissions for human access are managed by AWS. Don't assign roles to team members unless absolutely necessary
- The user may have a spend limit if they are on the paid plan. The limit that pauses their project if it's exceeded. If resources suddenly become inaccessible, ask if they have a spend limit configured. Only project owners can modify a spend limit.
- When developing:
  - MUST ask about spend limit status if the user reports sudden "Access Denied" errors on operations that previously worked
  - MUST direct users to check spend status in AWS Settings > Billing
  - MUST check if a user has upgraded their account to the paid plan
  - MUST ask the user if they want to clean up the successfully created resources or keep them to reduce cost
- The user sets up billing, creates spend limits, and retrieves and pays invoices in AWS Settings. The user creates budgets and optimizes their costs in the AWS Billing and Cost Management console
- Not all AWS services are available. If a service isn't working, do the following:
  1. Run the command `aws freetier get-account-plan-state`
  2. If accountPlanType": "FREE", check the [Free Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-free-tier) next,
  3. If accountPlanType": "PAID", check the [Paid Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-paid-plan).
  4. If neither list shows the service, check the [Not supported for this experience list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#unsupported-services). The user will need to activate advanced features to access this service.
- Users can activate advanced AWS services and capabilities for their account.
- For any AWS task or question — building, configuring, migrating, debugging, or operating a service, writing SDK code, authoring CDK/CloudFormation, or answering how a service works — first call `aws___search_documentation` with topic `agent_skills` and load the matching skill with `aws___retrieve_skill`. Do this even when you believe you know the answer: skills carry current service behavior that your training may not. Prefer the skill's guidance over general knowledge. Skip it only for work that does not involve AWS.

### Help level

- help_level (required): LOW, MEDIUM, or HIGH. While a user is building, you MUST ask the user: "How much guidance would you like from me? Low (I only flag security risks), medium (I ask a couple of clarifying questions if something seems off), or high (I explain what I'm doing, suggest alternatives, and flag best practices)."

You CAN update this rule file to save a user's help_level.

Constraints for each level:

**LOW:**

- MUST follow all constraints in this context file
- MUST execute the user’s request without modification
- MUST NOT ask clarifying questions unless the action would create a security vulnerability
- MUST NOT suggest alternatives or improvements

**MEDIUM:**

- MUST execute the user's request
- MAY ask up to two clarifying questions per task if the request has an ambiguity or a potential issue
- MUST NOT repeat a question or suggestion the user has already dismissed
- MUST NOT explain trade-offs or alternatives unless the user asks

**HIGH:**

- MUST explain what each step does and why before executing it
- MUST suggest alternatives when a better approach exists
- MUST flag best practices and explain trade-offs
- MUST still execute the user's choice if they disagree with a suggestion
<!-- END AWS Agent Toolkit rules -->
