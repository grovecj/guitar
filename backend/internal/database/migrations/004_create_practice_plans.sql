-- +goose Up
CREATE TABLE practice_plans (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL DEFAULT '',
    proficiency      TEXT NOT NULL CHECK (proficiency IN ('beginner', 'intermediate', 'expert')),
    duration_minutes INT NOT NULL,
    custom_notes     TEXT NOT NULL DEFAULT '',
    plan_json        JSONB NOT NULL,          -- full AI-generated plan structure
    is_template      BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_practice_plans_user ON practice_plans (user_id);

-- +goose Down
DROP TABLE IF EXISTS practice_plans;
