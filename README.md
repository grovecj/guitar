# Guitar

Guitar practice web app — tuner, AI-generated backing tracks, and guided practice sessions.

**Live at** [guitar.cartergrove.me](https://guitar.cartergrove.me)

## Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Frontend  | SvelteKit, TypeScript, Tailwind CSS v4  |
| Audio     | Web Audio API, Tone.js                  |
| Backend   | Go (Chi router)                         |
| AI        | Claude API                              |
| Database  | PostgreSQL                              |
| Infra     | Digital Ocean, Terraform, GitHub Actions|

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Go](https://go.dev/) >= 1.22
- [Make](https://www.gnu.org/software/make/)

### Setup

```bash
# Clone the repo
git clone https://github.com/grovecj/guitar.git
cd guitar

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run both frontend and backend in dev mode
make dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/healthz

### Individual commands

```bash
make dev-frontend   # SvelteKit dev server only
make dev-backend    # Go backend only
make build          # Production build (both)
make clean          # Remove build artifacts
```

## Project Structure

```
guitar/
├── frontend/          # SvelteKit app
│   ├── src/
│   │   ├── routes/    # Pages and layouts
│   │   ├── lib/       # Shared components and utilities
│   │   └── app.css    # Tailwind + design tokens
│   └── ...
├── backend/           # Go API server
│   ├── cmd/server/    # Entrypoint
│   └── internal/      # Application code
│       └── handler/   # HTTP handlers
├── infra/             # Terraform (Digital Ocean + GitHub)
├── Makefile
└── README.md
```
