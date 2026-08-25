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
    _run_sql_migrations()


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
    with _raw_conn() as conn:
        conn.executescript(script)
        conn.commit()


def _raw_conn() -> sqlite3.Connection:
    return sqlite3.connect(settings.database_path)


def _now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


def get_session() -> Session:
    with Session(engine) as session:
        yield session
