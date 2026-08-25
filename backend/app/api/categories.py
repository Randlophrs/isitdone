from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..dependencies import SessionDep
from ..schemas.category import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
)
from ..services import category_service

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _get_or_404(session: SessionDep, category_id: str):
    category = category_service.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="category not found"
        )
    return category


@router.get("", response_model=list[CategoryRead])
def get_categories(session: SessionDep) -> list:
    return category_service.list_categories(session)


@router.post("", response_model=CategoryRead, status_code=201)
def create_category(session: SessionDep, data: CategoryCreate):
    return category_service.create_category(session, data)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(session: SessionDep, category_id: str):
    return _get_or_404(session, category_id)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(session: SessionDep, category_id: str, data: CategoryUpdate):
    category = _get_or_404(session, category_id)
    return category_service.update_category(session, category, data)


@router.delete("/{category_id}", status_code=204)
def delete_category(session: SessionDep, category_id: str):
    category = _get_or_404(session, category_id)
    category_service.delete_category(session, category)


@router.get("/{category_id}/usage")
def category_usage(session: SessionDep, category_id: str):
    _get_or_404(session, category_id)
    return {"count": category_service.count_routines_using(session, category_id)}
