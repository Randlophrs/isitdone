CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT,
    frequency TEXT NOT NULL
        CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    is_active INTEGER NOT NULL DEFAULT 1,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT,
    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS completions (
    id TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL,
    period_key TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (routine_id)
        REFERENCES routines(id)
        ON DELETE CASCADE,
    UNIQUE (routine_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_completions_routine_id
    ON completions(routine_id);

CREATE INDEX IF NOT EXISTS idx_completions_period_key
    ON completions(period_key);
