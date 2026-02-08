package main

import (
	"log"
	"net/http"

	"github.com/grovecj/guitar/backend/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
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
