from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class CompletionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    routine_id: str
    period_key: str
    completed_at: str
