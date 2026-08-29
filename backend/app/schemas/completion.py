from __future__ import annotations

from .common import BaseSchema


class CompletionRead(BaseSchema):
    id: str
    routine_id: str
    period_key: str
    completed_at: str
    skipped: bool = False
    frozen: bool = False
