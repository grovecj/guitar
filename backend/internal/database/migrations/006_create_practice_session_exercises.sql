-- +goose Up
CREATE TABLE practice_session_exercises (
    id               BIGSERIAL PRIMARY KEY,
    session_id       BIGINT NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    exercise_name    TEXT NOT NULL,
    category         TEXT NOT NULL DEFAULT '',  -- scales, chords, technique, repertoire, improvisation, ear_training
    duration_seconds INT NOT NULL,
    order_index      INT NOT NULL,
    skipped          BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_session_exercises_session ON practice_session_exercises (session_id);

-- +goose Down
DROP TABLE IF EXISTS practice_session_exercises;
