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
- **Auth**: Clerk (whitelabel)

## Artifacts

### The Front Porch Bulletin (`artifacts/front-porch-bulletin`)
- Small-town community newsletter web app styled like an 80s/90s newspaper
- **Public pages**: Home (front page), Articles index, Article detail, Categories, Submit a Story, About
- **Auth pages**: /sign-in, /sign-up (Clerk-powered, newspaper-styled)
- **Admin pages** (requires login + role): /admin, /admin/articles, /admin/articles/new, /admin/articles/:id/edit, /admin/categories, /admin/users

### API Server (`artifacts/api-server`)
- Public routes: `GET /api/articles`, `GET /api/articles/featured`, `GET /api/articles/summary`, `GET /api/categories`
- Protected routes (require approved/admin role): `POST /api/articles`, `PUT /api/articles/:id`, `DELETE /api/articles/:id`
- Admin routes: `GET /api/admin/me`, `GET /api/admin/users`, `PUT /api/admin/users/:id/role`, `DELETE /api/admin/users/:id/role`

## Database Schema

- `articles`: id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at
- `categories`: id, name, slug, description
- `user_roles`: id, clerk_user_id (unique), role (admin|approved_user), granted_at

## Auth & User Management

- Authentication is handled by Clerk
- User management (viewing users, banning) is done via the **Auth pane** in the Replit workspace toolbar
- Role management (granting admin/approved_user) is done via the /admin/users page (admin only)
- First admin: sign up, then manually insert a row into user_roles with role='admin' via the database

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
