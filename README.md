# Pre-Operative Health Assessment Platform

> AI-powered pre-anesthetic evaluation system for surgical risk assessment

<p align="center">
  <a href="#overview"><strong>Overview</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="./docs"><strong>Documentation</strong></a>
</p>

## Overview

This platform conducts AI-driven pre-operative health assessments for patients scheduled for elective surgery. It uses conversational AI to interview patients, collect medical history, and calculate cardiac risk scores (RCRI and HAS2) to help healthcare providers make informed decisions.

### Key Capabilities

- **Automated Risk Assessment**: Calculates RCRI (Revised Cardiac Risk Index) and HAS2 cardiovascular risk scores
- **Conversational Interface**: Natural language interview in Brazilian Portuguese
- **Multi-tenant Architecture**: Secure clinic management with data isolation
- **Token-based Patient Access**: Patients access assessments via secure tokens without registration
- **Real-time Processing**: Instant risk calculation and results generation

## Features

### For Clinics
- **Dashboard**: Overview of assessments, risk distribution, and completion rates
- **Patient Management**: Create and track patient assessments
- **Token Generation**: Generate secure access tokens for patients
- **Export Capabilities**: Export assessment data to CSV
- **Multi-clinic Support**: Complete data isolation between clinics via Row-Level Security (RLS)

### For Patients
- **Simple Access**: Access assessment via token - no account required
- **Guided Interview**: AI assistant asks questions in a conversational manner
- **Form + Chat Interface**: Initial form followed by interactive interview
- **Voice Input**: Support for voice messages

### Assessment Process
1. Clinic creates assessment and generates token
2. Patient accesses via unique URL with token
3. Patient completes initial health form
4. AI conducts conversational interview about:
   - Surgery type and details
   - Medical history
   - Cardiac conditions
   - Medications and lab results
5. System calculates RCRI and HAS2 scores
6. Results available to clinic immediately

## Tech Stack

### Core
- **[Next.js 15](https://nextjs.org)** - App Router, React Server Components, Server Actions
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[AI SDK](https://sdk.vercel.ai/docs)** - Vercel AI SDK for LLM integration
- **[Google Gemini 3 Pro Preview](https://x.ai)** - Default AI model for patient interviews

### Database & Auth
- **[Neon Postgres](https://neon.tech)** - Serverless PostgreSQL database
- **[Drizzle ORM](https://orm.drizzle.team)** - TypeScript ORM
- **[Auth.js](https://authjs.dev)** - Authentication for clinic staff
- **Row-Level Security (RLS)** - Database-level multi-tenant security

### UI & Styling
- **[shadcn/ui](https://ui.shadcn.com)** - Component library
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[Radix UI](https://radix-ui.com)** - Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animations

### Infrastructure
- **[Vercel](https://vercel.com)** - Hosting and deployment
- **[Redis](https://redis.io)** - Resumable streams

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Neon Postgres database
- Vercel account (for AI Gateway and deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:asatenas/health-assessment.git
   cd health-assessment
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file with the following variables:

   ```bash
   # Database
   POSTGRES_URL=<your-neon-postgres-url>
   POSTGRES_URL_DEV=<your-dev-database-url>

   # Auth
   AUTH_SECRET=<generate-with-openssl-rand-base64-32>

   # AI (Vercel deployments use OIDC, local needs API key)
   AI_GATEWAY_API_KEY=<your-vercel-ai-gateway-key>

   # Optional
   REDIS_URL=<redis-url-for-resumable-streams>
   BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
   ```

   See `.env.example` for all available variables.

4. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   The application will be running at [localhost:3000](http://localhost:3000).

### Database Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Check schema consistency
pnpm db:check

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Push schema directly (dev only)
pnpm db:push
```

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication routes and pages
│   ├── (chat)/          # Patient-facing chat interface
│   └── (dashboard)/     # Clinic dashboard and management
├── components/          # Shared React components
├── lib/
│   ├── ai/             # AI prompts, tools, and model configuration
│   ├── db/             # Database schema, queries, and migrations
│   └── utils/          # Utility functions
├── docs/               # Project documentation
└── public/             # Static assets
```

## Key Concepts

### Assessment Flow

1. **Creation**: Clinic creates assessment, system generates secure token
2. **Access**: Patient receives URL with token (expires in 7 days)
3. **Form**: Patient fills initial health information form
4. **Interview**: AI conducts conversational interview following clinical protocols
5. **Calculation**: System calculates RCRI and HAS2 risk scores
6. **Results**: Scores and recommendations available to clinic

### Security Model

- **Clinics**: Authenticated via Auth.js, isolated by Row-Level Security (RLS)
- **Patients**: Token-based access, no authentication required
- **Data Isolation**: PostgreSQL RLS ensures clinics only see their own data
- **Tokens**: Time-limited (7 days), single-use assessment access

### Risk Indices

- **RCRI (Revised Cardiac Risk Index)**: Estimates risk of cardiac complications after non-cardiac surgery
- **HAS2**: American University of Beirut cardiovascular risk index

## Documentation

Comprehensive technical documentation is available in the `/docs` directory:

For a complete list, see [docs/README.md](./docs/README.md).

## Development

### Code Quality

```bash
# Lint
pnpm lint

# Lint and fix
pnpm lint:fix

# Format code
pnpm format
```

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

This application is designed to be deployed on [Vercel](https://vercel.com):

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Once configured, future deploys should be automatic.

Migrations run automatically during build via the `build` script.

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `POSTGRES_URL` / `POSTGRES_URL_DEV` - Database connection strings
- `AUTH_SECRET` - Auth.js secret for session encryption
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key (local only)
- `REDIS_URL` - Redis for resumable streams (optional)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

Vercel automatically handles via `vercel env pull`

## Contributing

1. Read the [documentation](./docs/README.md) first
3. Follow the existing code style
4. Test your changes thoroughly
5. Update documentation if needed

## License

[Add your license here]

## Support

For issues and questions:
- Check the [documentation](./docs/README.md)

---

Built with ❤️ for safer surgical outcomes
