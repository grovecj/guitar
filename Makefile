.PHONY: dev dev-frontend dev-backend build build-frontend build-backend clean migrate migrate-down migrate-status

# Development — run both frontend and backend concurrently
dev:
	$(MAKE) dev-backend & $(MAKE) dev-frontend & wait

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && go run ./cmd/server

# Production builds
build: build-frontend build-backend

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && go build -o ../dist/server ./cmd/server

clean:
	rm -rf dist frontend/build frontend/.svelte-kit/output

# Database migrations (requires DATABASE_URL env var)
MIGRATIONS_DIR = backend/internal/database/migrations

migrate:
	goose -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" up

migrate-down:
	goose -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" down

migrate-status:
	goose -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" status
