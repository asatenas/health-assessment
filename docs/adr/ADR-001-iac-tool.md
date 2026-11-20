# ADR-001: Infrastructure as Code tool — CDK

- **Status:** Accepted
- **Date:** 2026-11-19

## Context

I need to choose between AWS CDK and Terraform to define and deploy the AWS infrastructure for Asatenas. The target architecture has been designed and reviewed, so this choice will be the baseline for deploying the infrastructure from now on.

The objective of this migration is for me to learn AWS services. I am a solo developer. My budget is a one-time $100 AWS credit. I am applying for software engineering roles, and I am using this project as practical, hands-on experience I can show to hiring managers.

## Options

- **CDK** — written in TypeScript. CloudFormation stores the deployment state, so I don't need to host or lock a state file. High-level constructs can create resources I did not explicitly ask for.
- **Terraform** — written in HCL, a language I don't know yet. I would need to host and lock the state file myself (for example, an S3 bucket with locking). More job postings use or require Terraform than CDK.

## Decision

CDK (TypeScript).

## Consequences

- I already know TypeScript, and the app uses it, so I don't need to learn HCL now.
- To catch unexpected resources, I read `cdk diff` before every deploy. A budget alarm warns me at 50% and 80% of the budget.
- Because the budget is a one-time credit, the stacks must be easy to destroy and recreate. Tearing down the infrastructure when I'm not working is part of the workflow.
- Terraform is the stronger signal in the job market. I am accepting that for now.
