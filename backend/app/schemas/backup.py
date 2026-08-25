from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class BackupImportRequest(BaseModel):
    mode: str = Field(default="merge")  # "merge" | "replace"


class BackupImportResponse(BaseModel):
    mode: str
    imported: dict[str, int]


class BackupExportMeta(BaseModel):
    version: int
    app: str
    exportedAt: str
    settings: list[Any]
    categories: list[Any]
    routines: list[Any]
    completions: list[Any]
