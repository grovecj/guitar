package config

import (
	"fmt"
	"os"
)

type Config struct {
	DatabaseURL       string
	Port              string
	GoogleClientID    string
	GoogleSecret      string
	JWTSecret         string
	FrontendURL       string
	GoogleRedirectURL string
}

func Load() (*Config, error) {
	c := &Config{
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		Port:           envOr("PORT", "8080"),
		GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleSecret:   os.Getenv("GOOGLE_CLIENT_SECRET"),
		JWTSecret:      os.Getenv("JWT_SECRET"),
		FrontendURL:    envOr("FRONTEND_URL", "http://localhost:5173"),
	}
	c.GoogleRedirectURL = envOr("GOOGLE_REDIRECT_URL", fmt.Sprintf("http://localhost:%s/api/auth/google/callback", c.Port))

	return c, nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
