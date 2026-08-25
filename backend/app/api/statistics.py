from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..dependencies import SessionDep
from ..services import routine_service, statistics_service

router = APIRouter(prefix="/api/statistics", tags=["statistics"])


@router.get("")
def statistics(session: SessionDep) -> dict:
    return statistics_service.overall_statistics(session)


@router.get("/routine/{routine_id}")
def routine_statistics(session: SessionDep, routine_id: str) -> dict:
    routine = routine_service.get_routine(session, routine_id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="routine not found"
        )
    return statistics_service.routine_statistics(session, routine)
