from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class Routine(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    category_id: Optional[str] = Field(default=None, foreign_key="category.id")
    frequency: str = Field(index=True)
    is_active: bool = Field(default=True, index=True)
    is_pinned: bool = Field(default=False)
    sort_order: int = Field(default=0)
    created_at: str = Field(default_factory=_utcnow)
    updated_at: str = Field(default_factory=_utcnow)
    archived_at: Optional[str] = None
