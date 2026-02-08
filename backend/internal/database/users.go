package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/grovecj/guitar/backend/internal/model"
)

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

// UpsertByGoogleID creates a new user or updates the existing one, returning the user.
func (r *UserRepo) UpsertByGoogleID(ctx context.Context, googleID, email, displayName, avatarURL string) (*model.User, error) {
	u := &model.User{}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO users (google_id, email, display_name, avatar_url, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (google_id) DO UPDATE SET
			email = EXCLUDED.email,
			display_name = EXCLUDED.display_name,
			avatar_url = EXCLUDED.avatar_url,
			updated_at = EXCLUDED.updated_at
		RETURNING id, google_id, email, display_name, avatar_url, created_at, updated_at
	`, googleID, email, displayName, avatarURL, time.Now()).Scan(
		&u.ID, &u.GoogleID, &u.Email, &u.DisplayName, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("upsert user: %w", err)
	}
	return u, nil
}

// GetByID returns a user by their internal ID.
func (r *UserRepo) GetByID(ctx context.Context, id int64) (*model.User, error) {
	u := &model.User{}
	err := r.db.QueryRowContext(ctx, `
		SELECT id, google_id, email, display_name, avatar_url, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(&u.ID, &u.GoogleID, &u.Email, &u.DisplayName, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return u, nil
}
