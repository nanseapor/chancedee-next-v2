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
├── actions/          # Server actions for data mutations
├── app/              # Next.js App Router pages
│   ├── (body)/       # Main layout group (header/footer)
│   ├── api/          # API routes
│   └── auth/         # Auth pages
├── components/
│   ├── ui/           # shadcn/ui base components
│   ├── fab-chat/     # AI chat floating button
│   └── [feature]/    # Feature-specific components
├── hooks/            # React hooks (auth, chat, bookmarks)
├── lib/
│   ├── database/     # Firebase repository layer
│   ├── adk/          # AI agent development kit
│   └── [service].ts  # Service modules (directus, posts, auth)
└── types/            # TypeScript type definitions
```

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)

### External Services

- Firebase (Auth, Firestore, Storage)
- Directus CMS
- SendGrid (email)
- Google Analytics
