# Architecture Decision Records

Decisions for the Asatenas migration from Vercel/Neon to AWS. One ADR per decision that could change on its own. To change a decision, write a new ADR and mark the old one "Superseded by ADR-00X".

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](ADR-001-iac-tool.md) | Infrastructure as Code: CDK (TypeScript) | Accepted |
| [ADR-002](ADR-002-compute.md) | Compute: ECS on Fargate behind an ALB | Accepted |
| [ADR-003](ADR-003-network.md) | Network: public-IP Fargate task, no NAT gateway | Accepted |
| [ADR-004](ADR-004-database.md) | Database: RDS PostgreSQL db.t4g.micro, single-AZ | Accepted |
| [ADR-005](ADR-005-file-storage.md) | File storage: two private S3 buckets | Accepted |
| [ADR-006](ADR-006-async-notification.md) | Notification: SQS + Lambda + SES | Accepted |
| [ADR-007](ADR-007-dns-and-edge.md) | DNS and edge: Route 53, no CloudFront | Accepted |
