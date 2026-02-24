# JobApp — Smart job opportunity tracker with profile-based scoring

JobApp is a full-stack web application that helps job seekers track opportunities from multiple sources (LinkedIn, Gupy) and automatically scores them against career profiles. It features a browser extension for ingesting job listings, a rule-based + semantic scoring engine, configurable alerts, and resume management.

## Features

- **Career profiles** with weighted skills, seniority level, work mode, and location preferences
- **Opportunity ingestion** via REST API and browser extension (Safari on iOS/macOS)
- **Automatic scoring** combining rule-based matching (skills, title, location) with semantic text similarity
- **Job board** with score badges, status tracking (new, saved, dismissed, applied), and detail views
- **Configurable alerts** with daily email digests (via Resend)
- **Resume upload** with parsed JSON storage and consent tracking
- **API tokens** for programmatic access and extension authentication
- **Google OAuth** authentication via NextAuth

## Tech Stack

- **Frontend/Backend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js with Google OAuth and Prisma adapter
- **Email:** Resend
- **Validation:** Zod (shared contracts package)
- **Monorepo:** npm workspaces + Turborepo
- **Browser Extension:** Safari Web Extension (iOS + macOS)
- **Testing:** Jest with Testing Library

## Project Structure

```
jobapp/
├── apps/
│   └── web/                  # Next.js application
│       ├── prisma/           # Database schema
│       └── src/
│           ├── app/          # App Router pages and API routes
│           ├── components/   # React components
│           └── lib/          # Scoring engine, auth, email, etc.
├── packages/
│   └── contracts/            # Shared types, schemas, and enums
├── iOS (App)/                # Safari extension - iOS host app
├── iOS (Extension)/          # Safari extension - iOS
├── macOS (App)/              # Safari extension - macOS host app
├── macOS (Extension)/        # Safari extension - macOS
├── Shared (App)/             # Shared extension resources (HTML/JS/CSS)
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Google OAuth credentials (for authentication)

### Install and run

```bash
# Clone the repository
git clone https://github.com/wolram/jobapp.git
cd jobapp

# Install dependencies
npm install

# Configure environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your database URL, OAuth credentials, etc.

# Set up the database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.
