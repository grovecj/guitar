-- +goose Up
CREATE TABLE tuning_presets (
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    notes      JSONB NOT NULL,  -- array of {string, note, octave, frequency}
    is_system  BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tuning_presets_system ON tuning_presets (is_system);

-- +goose Down
DROP TABLE IF EXISTS tuning_presets;
