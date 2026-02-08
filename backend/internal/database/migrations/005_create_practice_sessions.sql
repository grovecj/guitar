-- +goose Up
CREATE TABLE practice_sessions (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id      BIGINT REFERENCES practice_plans(id) ON DELETE SET NULL,
    started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    rating       INT CHECK (rating >= 1 AND rating <= 3),  -- 1=too easy, 2=just right, 3=too hard
    notes        TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_practice_sessions_user ON practice_sessions (user_id);
CREATE INDEX idx_practice_sessions_user_date ON practice_sessions (user_id, started_at DESC);

-- +goose Down
DROP TABLE IF EXISTS practice_sessions;
