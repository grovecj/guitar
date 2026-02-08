package main

import (
	"log"
	"net/http"
	"os"

	"github.com/grovecj/guitar/backend/internal/database"
	"github.com/grovecj/guitar/backend/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Database (optional in dev — skip if DATABASE_URL is not set)
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		db, err := database.Connect(dbURL)
		if err != nil {
			log.Fatalf("database connect: %v", err)
		}
		defer db.Close()

		if err := database.Migrate(db); err != nil {
			log.Fatalf("database migrate: %v", err)
		}
		log.Println("database connected and migrations applied")
	} else {
		log.Println("DATABASE_URL not set, skipping database")
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/healthz"))

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", handler.Health)
	})

	log.Println("backend listening on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
