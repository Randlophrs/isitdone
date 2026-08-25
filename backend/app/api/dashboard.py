from __future__ import annotations

from fastapi import APIRouter

from ..dependencies import SessionDep
from ..services.dashboard_service import current_dashboard

router = APIRouter(tags=["dashboard"])


@router.get("/api/dashboard/current")
def dashboard_current(session: SessionDep) -> dict:
    return current_dashboard(session)
