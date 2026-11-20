# ADR-005: File storage — two private S3 buckets with different access patterns

- **Status:** Accepted
- **Date:** 2026-11-20
- **Related:** Depends on ADR-002 (compute) and ADR-003 (S3 gateway endpoint).

## Context

Today, files go to Vercel Blob with `access: 'public'`, so anyone with the URL can read them. The upload route uses the browser's filename as the storage key, and messages store the permanent public URL. Every chat request resends the full history, including image URLs, to the LLM.

There are two kinds of files:

- **Profile photos** — seen only by logged-in clinic staff.
- **Chat images** — uploaded by patients during the interview and shown again when the chat is reopened. Access is checked by the patient chat token.

## Options

- **One public bucket (like today)** — simplest, but any leaked URL exposes patient files.
- **One private bucket, all files served through the app** — strongest control, but every file passes through the single Fargate task.
- **One private bucket, all files through presigned URLs** — less load on the task, but any signed link works for anyone who has it until it expires.
- **Two private buckets, one access pattern each** — matches each pattern to its sensitivity and traffic.

## Decision

Two private buckets. Block Public Access on, encryption at rest (SSE-S3) on.

**Profile photos — served through the app**
- The app reads the photo through the S3 gateway endpoint and sends it to the browser after the clinic login check.
- Bucket policy: deny every request that does not come through the VPC endpoint, with exceptions for my admin role and the deploy role (otherwise the console and CDK are locked out).
- No URL to the file ever exists, so none can leak.

**Chat images — presigned URLs**
- Upload: the app checks the chat token, then returns a presigned POST with a server-generated key `chats/{chatId}/{uuid}.{ext}`, max 5 MB, JPEG/PNG only. (Presigned POST, not PUT, because only POST can enforce size and type.)
- The database stores the object key, not a URL.
- Display: each time the chat loads, the app checks the token and signs a fresh short-lived GET URL.
- AI: the server reads the image bytes from S3 and sends them inline to the model. The model provider never gets a link to the bucket.
- CORS rule on the bucket for the app's domain.
- No VPC-only bucket policy on this bucket (it would block patients' browsers).

## Consequences

- No public file URLs anymore. Patient files cannot be overwritten by another patient with the same filename.
- **Accepted costs:**
  - Code changes: upload route, how messages store attachments, and how history is sent to the model.
  - The single task carries the profile-photo traffic.
  - A presigned URL works for anyone who has it until it expires, so expiry must stay short.
  - Two buckets, two code paths to maintain.
