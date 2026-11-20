# ADR-006: Interview-finished notification — SQS + Lambda + SES

- **Status:** Accepted
- **Date:** 2026-11-20
- **Related:** Depends on ADR-002 (compute).

## Context

When an interview finishes, `finalize-interview` calls `FINALIZE_INTERVIEW_WEBHOOK_URL` inline. If the receiver is down, finalizing fails. Today the only consumer is a notification to me (the developer). Later, clinics should be notified in the app (see backlog).

## Options

- **Keep the inline webhook** — no new services, but the patient's finalize step depends on an external system being up.
- **SQS + Lambda** — the app drops a message in a queue and moves on. A Lambda processes it later, with retries.
- **SNS + SQS** — fan-out to many consumers. Not needed with one consumer.

## Decision

- The app sends a message to SQS with the `chatId` only — no patient data.
- A Lambda (outside the VPC; it needs no database access) reads the message and sends me an email through SES.
- SES stays in sandbox mode (enough for one verified address). The email contains no patient data.
- No dead-letter queue.

## Consequences

- Finalizing no longer depends on the notification succeeding.
- Cost is effectively $0 (SQS, Lambda, and SES free tiers or fractions of a cent).
- **Accepted costs:**
  - No dead-letter queue: a message that keeps failing is retried until it expires, then deleted silently. The impact is one missed dev email.
  - Dual write: if the database commit succeeds but sending to SQS fails, the event is lost. The fix later is the outbox pattern.
  - SQS delivers at least once, so I may get a duplicate email.
- **Revisit when:** notifications go to clinics. Then add a dead-letter queue and make the consumer idempotent.
