from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..dependencies import SessionDep
from ..schemas.completion import CompletionRead
from ..services import completion_service, routine_service

router = APIRouter(prefix="/api/routines", tags=["completions"])


def _get_or_404(session: SessionDep, routine_id: str):
    routine = routine_service.get_routine(session, routine_id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="routine not found"
        )
    return routine


@router.post("/{routine_id}/complete", response_model=CompletionRead)
def complete_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    return completion_service.complete_routine(session, routine)


@router.delete("/{routine_id}/complete", status_code=204)
def uncomplete_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    completion_service.uncomplete_routine(session, routine)


@router.post("/{routine_id}/skip", response_model=CompletionRead)
def skip_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    return completion_service.skip_routine(session, routine)


@router.delete("/{routine_id}/skip", status_code=204)
def unskip_routine(session: SessionDep, routine_id: str):
    routine = _get_or_404(session, routine_id)
    completion_service.unskip_routine(session, routine)


@router.get(
    "/{routine_id}/completions", response_model=list[CompletionRead]
)
def get_completions(session: SessionDep, routine_id: str):
    _get_or_404(session, routine_id)
    return completion_service.list_completions(session, routine_id)
