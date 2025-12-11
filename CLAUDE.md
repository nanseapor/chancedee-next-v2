# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js 16)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

This is a Thai-language career/lifestyle content platform built with Next.js 16 (App Router) and React 19.

### Data Layer

**Two Backend Systems:**
1. **Directus CMS** (`src/lib/directus.ts`) - Blog/content management via REST API
   - Posts, categories, authors, metadata
   - Uses `@directus/sdk` with static token authentication

2. **Firebase Admin** (`src/lib/firebase-admin.ts`) - User/business data
   - Authentication, Firestore database, Storage
   - Repository pattern in `src/lib/database/`

**Repository Pattern for Firebase:**
- `src/lib/database/repositories/` - Type-safe data access with generic factory
- `src/lib/database/schemas/` - Zod schemas for validation
- `src/lib/database/actions/` - Server actions for each domain
- `src/lib/database/utils/firebase-utils.ts` - Low-level Firestore operations

### State Management

- **Jotai** for global client state (`src/store/atom-store.ts`)
- Atoms: user session, search, pagination, bookmarks, FAB chat state

### UI Components

- **shadcn/ui** components in `src/components/ui/` (Radix UI primitives)
- **Tailwind CSS v4** with CSS variables for theming
- Custom theme colors defined in `src/app/globals.css`
- Utility: `cn()` from `src/lib/utils.ts` for class merging

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (adk, ai-chat, newsletter, etc.)
│   ├── content/(body)/     # Main content layout group
│   └── jobsmarket/         # Job market pages
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── fab-chat/           # AI chat floating button
│   ├── auth/               # Authentication components
│   ├── blog/               # Blog components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   ├── navigation/         # Navigation components
│   └── [feature]/          # Feature-specific components
├── domains/                # Domain-driven modules
│   ├── admin/              # Admin domain (services, utils)
│   ├── ai/                 # AI domain services
│   ├── authentication/     # Auth domain (services, utils)
│   ├── candidates/         # Candidate domain services
│   ├── content/            # Content domain services
│   ├── fab-chat/           # FAB chat domain services
│   └── search/             # Search domain services
├── hooks/                  # React hooks
├── lib/
│   ├── adk/                # AI agent development kit
│   ├── database/           # Firebase repository layer
│   │   ├── actions/        # Server actions
│   │   ├── repositories/   # Data access layer
│   │   ├── schemas/        # Zod schemas
│   │   └── utils/          # DB utilities
│   ├── firebase/           # Firebase client/admin setup
│   ├── utils/              # Utilities (client, server, shared)
│   └── validations/        # Validation schemas (auth, candidates, jobs)
├── store/                  # Jotai atom store
└── types/                  # TypeScript type definitions

docs/
├── RIS/                    # Route Implementation Specs (per-route technical specs)
├── ฺBLS/                    # Business Logic Specs (actions, validation, workflows)
├── design-systems/         # UI specs (atoms, molecules, organisms, routes)
│   ├── atoms/              # Buttons, badges, form elements, indicators
│   ├── molecules/          # Feedback, form groups, list items
│   ├── organisms/          # Cards, modals, navigation, tables
│   └── routes/             # Per-route component compositions
└── DOCUMENTATION-GUIDE.md  # How to use these docs
```

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)

### External Services

- Firebase (Auth, Firestore, Storage)
- Directus CMS
- SendGrid (email)
- Google Analytics

## Project Documentation

Detailed specifications are in `docs/`. See [docs/DOCUMENTATION-GUIDE.md](docs/DOCUMENTATION-GUIDE.md) for full usage guide.

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| `docs/RIS/` | Route Implementation Specs | Implementing routes/pages |
| `docs/ฺBLS/` | Business Logic Specs | Server actions, validation, workflows |
| `docs/design-systems/` | UI Component Specs | Building/styling components |

### Quick Reference

- **New route:** Read `RIS/{DOMAIN}-R{NN}_*.md` + `design-systems/routes/`
- **Server action:** Read `BLS/BLS-{NN}_*.md` for action specs
- **Component:** Read `design-systems/atoms|molecules|organisms/`
- **Cross-cutting patterns:** Check `*-R00_cross-cutting` or `BLS-00`
