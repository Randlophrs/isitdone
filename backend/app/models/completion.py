from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class Completion(SQLModel, table=True):
    id: str = Field(primary_key=True)
    routine_id: str = Field(foreign_key="routine.id", index=True)
    period_key: str = Field(index=True)
    completed_at: str = Field(default_factory=_utcnow)
    skipped: bool = Field(default=False)

    __table_args__ = (
        # Enforce one completion per routine per period.
        # Declared in migration SQL too, but kept here for clarity.
    )
