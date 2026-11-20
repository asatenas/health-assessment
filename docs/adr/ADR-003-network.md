# ADR-003: Network — VPC with public-IP Fargate task, no NAT gateway

- **Status:** Accepted
- **Date:** 2026-11-20
- **Related:** Depends on ADR-002 (compute). Used by ADR-004 (database) and ADR-005 (file storage).

## Context

The Fargate task (ADR-002) needs inbound traffic from the ALB and outbound internet access: Vercel AI Gateway, ECR (image pull), Parameter Store, SQS, and S3. RDS must not be reachable from the internet. AWS requires the ALB and the RDS subnet group to span two Availability Zones. Budget is a one-time $100 credit.

## Options

- **Task in a public subnet with a public IP** — outbound internet through the internet gateway. Costs about $3.65/month for the public IPv4 address. Security depends on the security group allowing no inbound traffic except from the ALB.
- **Task in a private subnet + NAT gateway** — the task has no public IP. Costs about $32/month per NAT gateway, plus a per-GB processing charge.
- **Task in a private subnet + VPC interface endpoints** — private access to AWS services without NAT. Each interface endpoint costs about $7/month per AZ, and it still does not reach the Vercel AI Gateway, so NAT would still be needed.

## Decision

- VPC `10.0.0.0/16` in us-east-2, two Availability Zones (us-east-2a, us-east-2b).
- Public subnets: `10.0.0.0/24`, `10.0.1.0/24` — ALB (spans both) and the Fargate task (us-east-2a, public IP).
- Private subnets: `10.0.10.0/24` (RDS), `10.0.11.0/24` (empty; required by RDS, room for a standby later).
- No NAT gateway.
- Security groups (each layer accepts traffic only from the one before it):
  - ALB: 443 (HTTPS) and 80 (HTTP, redirect to 443) from anywhere.
  - Fargate task: 3000 only from the ALB security group.
  - RDS: 5432 only from the Fargate task security group. No public IP.
- S3 gateway endpoint (free) for both buckets — needed by the profile-photos bucket policy (ADR-005).

## Consequences

- Saves about $32/month or more compared with a NAT gateway.
- **Accepted costs:**
  - The task has a public IP. Its protection is the security group, so a mistake in that rule would expose the task directly.
  - Public IPv4 addresses cost money: about $3.65/month each (2 for the ALB, 1 for the task).
  - Resources in private subnets have no internet access. RDS does not need it today.
- **Revisit when:** a compliance or security review requires no public IPs on compute, or more services need private outbound access. Then compare NAT gateway against interface endpoints.
