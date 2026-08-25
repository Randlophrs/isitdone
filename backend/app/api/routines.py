from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..dependencies import SessionDep
from ..schemas.routine import RoutineCreate, RoutineRead, RoutineUpdate
from ..services import routine_service

router = APIRouter(prefix="/api/routines", tags=["routines"])


def _get_or_404(session: SessionDep, routine_id: str):
    routine = routine_service.get_routine(session, routine_id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="routine not found"
        )
    return routine


@router.get("", response_model=list[RoutineRead])
def get_routines(
    session: SessionDep, include_archived: bool = False
) -> list:
    return routine_service.list_routines(
        session, include_archived=include_archived
    )


@router.post("", response_model=RoutineRead, status_code=201)
def create_routine(session: SessionDep, data: RoutineCreate):
    return routine_service.create_routine(session, data)


@router.get("/{routine_id}", response_model=RoutineRead)
def get_routine(session: SessionDep, routine_id: str):
    return _get_or_404(session, routine_id)


@router.patch("/{routine_id}", response_model=RoutineRead)
def update_routine(session: SessionDep, routine_id: str, data: RoutineUpdate):
    routine = _get_or_404(session, routine_id)
    return routine_service.update_routine(session, routine, data)


@router.delete("/{routine_id}", status_code=204)
def delete_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    routine_service.delete_routine(session, routine)


@router.post("/{routine_id}/archive", response_model=RoutineRead)
def archive_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    return routine_service.archive_routine(session, routine)


@router.post("/{routine_id}/restore", response_model=RoutineRead)
def restore_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    return routine_service.restore_routine(session, routine)
