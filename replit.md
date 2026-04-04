# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Artifacts

### The Front Porch Bulletin (`artifacts/front-porch-bulletin`)
- Small-town community newsletter web app styled like an 80s/90s newspaper
- Pages: Home (front page), Articles index, Article detail, Categories, Submit a Story, About
- Theme: Aged newsprint aesthetic — cream backgrounds, bold serif headlines, multi-column layout

### API Server (`artifacts/api-server`)
- Handles articles and categories CRUD
- Routes: `/api/articles`, `/api/articles/featured`, `/api/articles/summary`, `/api/categories`

## Database Schema

- `articles`: id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at
- `categories`: id, name, slug, description

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
