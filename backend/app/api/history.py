from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..dependencies import SessionDep
from ..services import history_service, routine_service

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
def history(session: SessionDep) -> dict:
    return history_service.history_summary(session)


@router.get("/{year}/{month}")
def history_month(session: SessionDep, year: int, month: int) -> dict:
    if not (1 <= month <= 12):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="month must be 1-12",
        )
    return history_service.history_by_month(session, year, month)


@router.get("/routine/{routine_id}")
def history_routine(session: SessionDep, routine_id: str) -> dict:
    if not routine_service.get_routine(session, routine_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="routine not found"
        )
    return history_service.history_by_routine(session, routine_id)
