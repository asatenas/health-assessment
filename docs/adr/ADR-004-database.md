# ADR-004: Database — RDS for PostgreSQL, db.t4g.micro, single-AZ

- **Status:** Accepted
- **Date:** 2026-11-20
- **Related:** Depends on ADR-002 (always-on compute) and ADR-003 (private subnets).

## Context

The app uses Postgres (currently Neon) with Drizzle ORM: 53 migrations, multi-tenant row-level security helpers, chat and app data in one database. The Fargate task (ADR-002) runs 24/7 while deployed and keeps a `postgres.js` connection pool open. No real users yet. Budget is a one-time $100 credit.

## Options

- **RDS for PostgreSQL, db.t4g.micro** — a managed Postgres VM. About $0.016/hour (~$11.68/month) plus 20 GB gp3 storage (~$2.30/month). No cold start.
- **Aurora Serverless v2** — can scale to 0 ACUs and pause when idle (~15 s to resume). But it only pauses when there are no user connections. The always-on task's connection pool keeps connections open, so it would rarely or never pause. The always-on minimum (0.5 ACU) is about $43.80/month.
- **Aurora provisioned** — smallest instance about $53/month. Replicated storage across AZs and fast failover, which I don't need yet.
- **Keep Neon** — no migration work, but the goal of this project is learning AWS, and the database would sit outside the VPC.

## Decision

RDS for PostgreSQL, db.t4g.micro, single-AZ, 20 GB gp3, in a private subnet (ADR-003). Encryption at rest enabled. Automated backups enabled.

## Consequences

- Predictable cost: about $14/month while running. No cold start.
- Closest to the Postgres I already know.
- **Accepted costs:**
  - Single-AZ: no automatic failover. If the AZ fails, the database is down until restored.
  - 1 GB of RAM. Enough for development traffic; watch memory and CPU credits.
  - Creating or restoring the instance takes about 10–20 minutes, which slows down the destroy/recreate workflow.
  - The build step can no longer run migrations, because the build cannot reach the private database. Migrations run as a one-off ECS task before each deploy.
  - Data moves from Neon with `pg_dump` / `pg_restore` (synthetic data only).
- **Upgrade path:** Multi-AZ, or Aurora, when there are real users and uptime matters.
