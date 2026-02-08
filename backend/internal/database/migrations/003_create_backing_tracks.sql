-- +goose Up
CREATE TABLE backing_tracks (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key             TEXT NOT NULL,           -- e.g. "A minor", "D major"
    tempo_bpm       INT NOT NULL,
    style           TEXT NOT NULL,           -- e.g. "bluesy", "jazzy"
    progression     TEXT NOT NULL DEFAULT '',-- e.g. "I-IV-V-I"
    structure_json  JSONB NOT NULL,          -- full AI-generated music structure
    scales_json     JSONB,                   -- suggested scales for soloing
    is_favorite     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_backing_tracks_user ON backing_tracks (user_id);
CREATE INDEX idx_backing_tracks_favorite ON backing_tracks (user_id, is_favorite) WHERE is_favorite = true;

-- +goose Down
DROP TABLE IF EXISTS backing_tracks;
