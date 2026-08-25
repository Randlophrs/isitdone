from __future__ import annotations

from typing import Optional

from .common import BaseSchema


class CategoryBase(BaseSchema):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseSchema):
    model_config = BaseSchema.model_config | {"extra": "ignore"}

    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryRead(CategoryBase):
    id: str
    created_at: str
