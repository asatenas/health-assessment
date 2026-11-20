# ADR-002: Compute — ECS on Fargate behind an ALB

- **Status:** Accepted
- **Date:** 2026-11-20
- **Related:** ADR-001 (CDK). ADR-003 (network) and ADR-004 (database) depend on this decision.

## Context

Asatenas is a Next.js app that runs on Vercel today. I need a place on AWS to run it. Requirements that shape the choice:

- Patient chats stream LLM responses for a long time over one connection.
- The chat route uses `after()` / `waitUntil` to do work after the response is sent.
- The app talks to Postgres through a connection pool (`postgres.js`).
- There are no real users yet. I am a solo developer with a one-time $100 AWS credit.
- The main goal is learning AWS services that are common in real jobs.

## Options

- **ECS on Fargate + ALB** — runs the app as a normal Node server (`next start`) in a Docker container. AWS manages the hosts. Needs an ALB in front because task IPs change on every deploy.
- **Lambda** — scales to zero, pay per request. Needs an adapter (e.g. OpenNext) to run Next.js, extra setup for response streaming, and has a maximum run time. The function can freeze after responding, which breaks `after()`. Many concurrent functions can exhaust Postgres connections, so it would likely need RDS Proxy (extra cost).
- **EC2** — a virtual machine. I would manage the OS, patching, Node, and a reverse proxy myself. Closest to my on-prem experience, so the least new learning.
- **App Runner** — not available: closed to new customers since April 30, 2026.
- **ECS Express Mode** — not evaluated. It is a simpler way to set up ECS on Fargate; worth comparing later.

## Decision

ECS on Fargate, Linux/ARM (Graviton, about 20% cheaper than x86), one task (0.5 vCPU / 1 GB to start), behind an Application Load Balancer.

## Consequences

- The app runs unchanged as a Node server; long LLM streams and `after()` work without special setup.
- One process with one connection pool; no RDS Proxy needed.
- I learn containers, ECS, ALB, and VPC networking.
- **Accepted costs:**
  - It runs 24/7 while deployed, with or without users: about $14/month for the task plus about $18/month for the ALB. Mitigation: destroy the runtime stack when I'm not working (see ADR-001 and the backlog).
  - It does not scale to zero.
  - One task means no redundancy: if the task or its Availability Zone fails, the app is down for about a minute while ECS starts a new task. Deploys still have no downtime, because ECS starts the new task before stopping the old one.
  - Every deploy needs a Docker image built and pushed to ECR.
