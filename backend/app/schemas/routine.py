from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class RoutineBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    frequency: str = "daily"
    is_pinned: bool = False
    sort_order: int = 0

    @field_validator("frequency")
    @classmethod
    def _valid_frequency(cls, v: str) -> str:
        v = (v or "").lower()
        if v not in ("daily", "weekly", "monthly"):
            raise ValueError("frequency must be daily, weekly, or monthly")
        return v


class RoutineCreate(RoutineBase):
    pass


class RoutineUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    sort_order: Optional[int] = None

    @field_validator("frequency")
    @classmethod
    def _valid_frequency(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.lower()
        if v not in ("daily", "weekly", "monthly"):
            raise ValueError("frequency must be daily, weekly, or monthly")
        return v


class RoutineRead(RoutineBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    created_at: str
    updated_at: str
    archived_at: Optional[str] = None
