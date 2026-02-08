-- +goose Up
INSERT INTO tuning_presets (name, notes, is_system) VALUES
(
    'Standard',
    '[
        {"string": 6, "note": "E", "octave": 2, "frequency": 82.41},
        {"string": 5, "note": "A", "octave": 2, "frequency": 110.00},
        {"string": 4, "note": "D", "octave": 3, "frequency": 146.83},
        {"string": 3, "note": "G", "octave": 3, "frequency": 196.00},
        {"string": 2, "note": "B", "octave": 3, "frequency": 246.94},
        {"string": 1, "note": "E", "octave": 4, "frequency": 329.63}
    ]'::jsonb,
    true
),
(
    'Drop D',
    '[
        {"string": 6, "note": "D", "octave": 2, "frequency": 73.42},
        {"string": 5, "note": "A", "octave": 2, "frequency": 110.00},
        {"string": 4, "note": "D", "octave": 3, "frequency": 146.83},
        {"string": 3, "note": "G", "octave": 3, "frequency": 196.00},
        {"string": 2, "note": "B", "octave": 3, "frequency": 246.94},
        {"string": 1, "note": "E", "octave": 4, "frequency": 329.63}
    ]'::jsonb,
    true
),
(
    'Half-Step Down',
    '[
        {"string": 6, "note": "Eb", "octave": 2, "frequency": 77.78},
        {"string": 5, "note": "Ab", "octave": 2, "frequency": 103.83},
        {"string": 4, "note": "Db", "octave": 3, "frequency": 138.59},
        {"string": 3, "note": "Gb", "octave": 3, "frequency": 185.00},
        {"string": 2, "note": "Bb", "octave": 3, "frequency": 233.08},
        {"string": 1, "note": "Eb", "octave": 4, "frequency": 311.13}
    ]'::jsonb,
    true
),
(
    'Open G',
    '[
        {"string": 6, "note": "D", "octave": 2, "frequency": 73.42},
        {"string": 5, "note": "G", "octave": 2, "frequency": 98.00},
        {"string": 4, "note": "D", "octave": 3, "frequency": 146.83},
        {"string": 3, "note": "G", "octave": 3, "frequency": 196.00},
        {"string": 2, "note": "B", "octave": 3, "frequency": 246.94},
        {"string": 1, "note": "D", "octave": 4, "frequency": 293.66}
    ]'::jsonb,
    true
),
(
    'Open D',
    '[
        {"string": 6, "note": "D", "octave": 2, "frequency": 73.42},
        {"string": 5, "note": "A", "octave": 2, "frequency": 110.00},
        {"string": 4, "note": "D", "octave": 3, "frequency": 146.83},
        {"string": 3, "note": "F#", "octave": 3, "frequency": 185.00},
        {"string": 2, "note": "A", "octave": 3, "frequency": 220.00},
        {"string": 1, "note": "D", "octave": 4, "frequency": 293.66}
    ]'::jsonb,
    true
),
(
    'DADGAD',
    '[
        {"string": 6, "note": "D", "octave": 2, "frequency": 73.42},
        {"string": 5, "note": "A", "octave": 2, "frequency": 110.00},
        {"string": 4, "note": "D", "octave": 3, "frequency": 146.83},
        {"string": 3, "note": "G", "octave": 3, "frequency": 196.00},
        {"string": 2, "note": "A", "octave": 3, "frequency": 220.00},
        {"string": 1, "note": "D", "octave": 4, "frequency": 293.66}
    ]'::jsonb,
    true
);

-- +goose Down
DELETE FROM tuning_presets WHERE is_system = true;
