package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/grovecj/guitar/backend/internal/auth"
	"github.com/grovecj/guitar/backend/internal/config"
	"github.com/grovecj/guitar/backend/internal/database"
	"github.com/grovecj/guitar/backend/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	// Database (optional in dev — skip if DATABASE_URL is not set)
	var db *sql.DB
	if cfg.DatabaseURL != "" {
		var err error
		db, err = database.Connect(cfg.DatabaseURL)
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

		// Auth routes (require database)
		if db != nil {
			userRepo := database.NewUserRepo(db)
			authHandler := handler.NewAuthHandler(cfg, userRepo)

			r.Route("/auth", func(r chi.Router) {
				r.Get("/google", authHandler.GoogleLogin)
				r.Get("/google/callback", authHandler.GoogleCallback)
				r.Post("/refresh", authHandler.Refresh)
				r.Post("/logout", authHandler.Logout)
			})

			// Protected routes
			r.Group(func(r chi.Router) {
				r.Use(auth.Middleware(cfg.JWTSecret))
				r.Get("/auth/me", authHandler.Me)
			})
		}
	})

	log.Printf("backend listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}
}
