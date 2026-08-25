from __future__ import annotations

import sqlite3
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

from .config import settings


def get_engine():
    db_path = settings.database_path
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    connect_args = {"check_same_thread": False}
    return create_engine(
        f"sqlite:///{db_path}",
        connect_args=connect_args,
        echo=False,
    )


engine = get_engine()


def init_db() -> None:
    """Create tables from SQLModel metadata, then run SQL migrations."""
    SQLModel.metadata.create_all(engine)
    _repair_legacy_schema()
    _run_sql_migrations()


def _repair_legacy_schema() -> None:
    """Fix dev DBs created before migrations used correct (singular) tables.

    Early migrations targeted plural table names (routines/completions/...),
    which SQLModel never reads — creating orphan tables and leaving the real
    `routine` table without added columns. Drop the orphans and make sure the
    real table has every column the model expects. Idempotent.
    """
    with _raw_conn() as conn:
        tables = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        orphans = {"routines", "completions", "categories", "settings"} & tables
        for o in orphans:
            conn.execute(f"DROP TABLE IF EXISTS {o}")
        cols = {
            r[1]
            for r in conn.execute("PRAGMA table_info(routine)").fetchall()
        }
        for col, ddl in (
            ("timezone", "TEXT"),
            ("reset_time", "TEXT DEFAULT '00:00'"),
            ("weekday", "INTEGER"),
            ("monthweek", "INTEGER"),
        ):
            if col not in cols:
                conn.execute(f"ALTER TABLE routine ADD COLUMN {col} {ddl}")
        conn.commit()


def _run_sql_migrations() -> None:
    migrations_dir = Path(__file__).resolve().parents[0] / "migrations"
    applied = _applied_migrations()
    for path in sorted(migrations_dir.glob("*.sql")):
        name = path.name
        if name in applied:
            continue
        _exec_script(path.read_text(encoding="utf-8"))
        _mark_migration(name)


def _applied_migrations() -> set[str]:
    try:
        with _raw_conn() as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS schema_migrations "
                "(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)"
            )
            rows = conn.execute(
                "SELECT name FROM schema_migrations"
            ).fetchall()
        return {r[0] for r in rows}
    except sqlite3.Error:
        return set()


def _mark_migration(name: str) -> None:
    with _raw_conn() as conn:
        conn.execute(
            "INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)",
            (name, _now()),
        )
        conn.commit()


def _exec_script(script: str) -> None:
    """Run a migration script statement-by-statement.

    `ALTER TABLE ... ADD COLUMN` is treated as idempotent: if the column
    already exists (e.g. created by SQLModel's create_all), the duplicate
    error is ignored rather than failing the run.
    """
    with _raw_conn() as conn:
        for stmt in _split_statements(script):
            try:
                conn.execute(stmt)
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    continue
                raise
        conn.commit()


def _split_statements(script: str) -> list[str]:
    parts = [p.strip() for p in script.split(";") if p.strip()]
    return [f"{p};" if not p.endswith(";") else p for p in parts]


def _raw_conn() -> sqlite3.Connection:
    return sqlite3.connect(settings.database_path)


def _now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


def get_session() -> Session:
    with Session(engine) as session:
        yield session
