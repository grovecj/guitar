# Guitar Practice App

## Project Overview

An AI-powered guitar practice companion with three core features: Tuner, Backing Tracks, and Guided Practice. The mission is to help students create durable practice habits that fit into their daily lives.

## Tech Stack

- **Frontend**: SvelteKit, Svelte 5 (runes), TypeScript (strict), Tailwind CSS v4, Vite 7
- **Backend**: Go 1.25, Chi router, PostgreSQL, Goose migrations
- **Auth**: Google OAuth, JWT access/refresh tokens
- **Testing**: Vitest (frontend), golangci-lint v2 (backend)
- **CI**: GitHub Actions — lint, format, type-check, test, build

## Build & Dev Commands

```bash
# Frontend (from frontend/)
npm ci                  # Install dependencies
npm run dev             # Dev server on :5173
npm run build           # Production build
npm test                # Run Vitest
npm run lint            # ESLint
npm run format:check    # Prettier check
npm run check           # svelte-check

# Backend (from backend/)
go build ./cmd/server   # Build server
go vet ./...            # Vet
golangci-lint run ./... # Lint

# Both
make dev                # Start both dev servers
```

## Code Conventions

- Svelte stores use `writable()` from `svelte/store` with typed interfaces
- Export async functions for side effects, stores for reactive state
- Frontend tests go next to source files as `*.test.ts`
- Use `$lib` alias for imports from `frontend/src/lib/`
- Go code follows standard project layout: `cmd/`, `internal/`

## Issue Review Workflow

**Before implementing any GitHub issue, review it with all four agents in this order:**

1. **Guitar Teacher** (`guitar-teacher`) — Review the issue from a pedagogy perspective. Are the requirements student-friendly? Will they minimize frustration and encourage habit formation?

2. **Product Designer** (`product-designer`) — Evaluate product alignment, scope, user journey, and priority. Does this feature serve the mission of durable practice habits?

3. **UI Designer** (`ui-designer`) — Assess visual requirements, propose component designs, and specify responsive behavior. Use the /frontend-design plugin to generate mockups for UI-heavy issues.

4. **Software Architect** (`software-architect`) — Evaluate the technical approach, identify risks, recommend technologies, and define the testing strategy.

**After all four agents have reviewed**, synthesize their feedback into a unified implementation plan that incorporates the key recommendations. Present the plan to the user for approval before writing code.

## Agents

| Agent | Role | When to Use |
|-------|------|-------------|
| `guitar-teacher` | Pedagogy expert | Requirements review, UX assessment |
| `product-designer` | Product owner | Scope, priority, roadmap alignment |
| `ui-designer` | Visual design | Component design, responsive layout, mockups |
| `software-architect` | Technical lead | Architecture, technology choices, testing |
