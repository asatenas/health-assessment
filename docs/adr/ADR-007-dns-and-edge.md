# ADR-007: DNS and edge — Route 53, no CloudFront

- **Status:** Accepted
- **Date:** 2026-11-20
- **Related:** Depends on ADR-002 (ALB) and ADR-003 (network).

## Context

The domain is registered at GoDaddy, and GoDaddy hosts its DNS today. Vercel provided a CDN, automatic HTTPS certificates, and DDoS protection without configuration. Users would be in Brazil; the AWS region is us-east-2 (Ohio). There are no real users yet.

## Options

**DNS**
- **Keep DNS at GoDaddy** — $0. A CNAME cannot be used at the root domain, so the root must forward to `www`. Certificate validation records are added by hand. DNS stays outside the infrastructure code.
- **Delegate DNS to Route 53** (domain stays registered at GoDaddy) — about $0.50/month. Root domain works with alias records, certificates validate automatically, DNS is in CDK.

**Edge**
- **CloudFront in front of the ALB** — caches static files close to users (edge in São Paulo), hides the ALB, allows a WAF. Adds a second certificate (must be in us-east-1), cache rules, and an origin timeout to manage.
- **No CloudFront** — users reach the ALB directly. Simpler.

## Decision

- Route 53 hosted zone; nameservers at GoDaddy point to Route 53. Alias record to the ALB.
- ACM public certificate in us-east-2 (free), validated through Route 53.
- No CloudFront and no WAF for now.
- ALB listener on 80 redirects to 443.

## Consequences

- One certificate, one region, DNS fully in code.
- **Accepted costs:**
  - The ALB is open to the internet (AWS Shield Standard still applies).
  - Every request crosses Brazil ↔ Ohio. Not important without real users.
  - The single Fargate task serves static files too.
  - Changing nameservers replaces all DNS at once. Before switching: copy every GoDaddy record into Route 53, check with `dig`, and turn off DNSSEC at GoDaddy if it is on.
- **Revisit when:** there are real users in Brazil, or a WAF is needed. Then add CloudFront and cache only `/_next/static/*` and public assets (never HTML, `/api/*`, or the chat stream).
