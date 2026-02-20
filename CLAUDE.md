# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**jobapp** is a monorepo containing two main components:

1. **Safari Web Extension + companion apps** — cross-platform iOS and macOS apps built with Xcode and Swift (Manifest V3).
2. **Web application** — a Next.js 15 app (`apps/web`) providing a job-matching dashboard, REST API for the extension, authentication, and database persistence.

The repo is managed with **Turborepo** and **npm workspaces** (Node ≥ 18, npm 10).

---

## Repository Structure

```
jobapp/
├── apps/
│   └── web/                    # Next.js 15 web app (@jobapp/web)
├── packages/
│   └── contracts/              # Shared TypeScript types & Zod schemas (@jobapp/contracts)
├── Shared (App)/               # Cross-platform Swift app UI (WKWebView)
├── Shared (Extension)/         # Safari Web Extension (Manifest V3)
├── iOS (App)/                  # iOS app entry point, storyboards, Info.plist
├── iOS (Extension)/            # iOS extension packaging
├── macOS (App)/                # macOS app entry point, storyboards, Info.plist
├── macOS (Extension)/          # macOS extension packaging
├── jobapp.xcodeproj/           # Xcode project
├── turbo.json                  # Turborepo task config
└── package.json                # Root workspace config
```

---

## Build & Development Commands

### JavaScript / TypeScript (Turborepo)

```bash
# Install dependencies
npm install

# Run all packages in dev mode
npm run dev

# Build all packages
npm run build

# Lint all packages
npm run lint

# Run tests across all packages
npm run test

# Database (runs against apps/web Prisma setup)
npm run db:generate   # prisma generate
npm run db:push       # prisma db push
npm run db:migrate    # prisma migrate dev
```

Run commands for a single package with `--filter`:

```bash
npx turbo dev --filter=@jobapp/web
npx turbo test --filter=@jobapp/contracts
```

### Swift / Xcode

```bash
# Open in Xcode
open jobapp.xcodeproj

# Build iOS app
xcodebuild -project jobapp.xcodeproj -scheme "jobapp (iOS)" -configuration Debug build

# Build macOS app
xcodebuild -project jobapp.xcodeproj -scheme "jobapp (macOS)" -configuration Debug build
```

No Swift test targets exist yet.

---

## Architecture

### `apps/web` — Next.js Web App

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS
- **Auth**: `next-auth` v4 with Prisma adapter; magic-link / credentials flow
- **Database**: Prisma 6 + PostgreSQL
- **Email**: Resend
- **Validation**: Zod (shared with `@jobapp/contracts`)
- **Testing**: Jest 29 + React Testing Library

Key directories inside `apps/web/src/`:

| Path | Purpose |
|---|---|
| `app/(authenticated)/` | Protected dashboard pages (jobs, profiles, alerts, settings) |
| `app/api/v1/` | REST API consumed by the Safari extension |
| `lib/auth.ts` | NextAuth configuration |
| `lib/db.ts` | Prisma client singleton |
| `lib/scoring.ts` | Rule-based + semantic job-match scoring (70/30 split) |
| `lib/skill-extractor.ts` | Keyword-based skill extraction from job descriptions |
| `lib/dedupe.ts` | Opportunity deduplication helpers |
| `lib/email.ts` | Email sending via Resend |
| `lib/token-auth.ts` | API token generation and validation |
| `__tests__/` | Unit tests |

### `packages/contracts` — Shared Types

TypeScript types, Zod schemas, and enums shared between the web app and any future consumers. Built with `tsc`. Import as `@jobapp/contracts`.

### `Shared (App)/`

Cross-platform companion app code. `ViewController.swift` creates a `WKWebView` that loads `Main.html` and uses `#if os(iOS)` / `#elseif os(macOS)` for platform differences. On macOS, it checks extension state via `SFSafariExtensionManager` and can open Safari preferences. JavaScript communicates back to Swift via `webkit.messageHandlers.controller`.

### `Shared (Extension)/`

The Safari Web Extension. `SafariWebExtensionHandler.swift` handles native messaging from the extension's JavaScript via `browser.runtime.sendNativeMessage()`. `Resources/` contains the Manifest V3 `manifest.json`, popup UI, background script, and content script.

### `iOS (App)/`, `macOS (App)/`

Platform-specific entry points (`AppDelegate.swift`, `SceneDelegate.swift` on iOS), storyboards, and `Info.plist` files.

### `iOS (Extension)/`, `macOS (Extension)/`

Platform-specific extension packaging with `Info.plist` registering `com.apple.Safari.web-extension`.

---

## Coding Style

- **Swift**: 4-space indentation, braces on same line, `UpperCamelCase` for types, `lowerCamelCase` for properties/functions.
- **TypeScript/JavaScript**: match surrounding file style; consistent indentation, no mixed tabs/spaces.
- **No formatters configured** — keep changes focused and readable.

---

## Commit Style

Concise, imperative subjects (e.g., "Add popup toggle state", "Fix scoring edge case"). PRs should include a summary, testing notes, and screenshots for UI changes.
