from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from ..models.routine import Routine
from ..schemas.routine import RoutineCreate, RoutineUpdate
from ..utils.ids import generate_id


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_routine(session: Session, data: RoutineCreate) -> Routine:
    routine = Routine(id=generate_id(), **data.model_dump())
    session.add(routine)
    session.commit()
    session.refresh(routine)
    return routine


def get_routine(session: Session, routine_id: str) -> Optional[Routine]:
    return session.get(Routine, routine_id)


def list_routines(
    session: Session,
    *,
    include_archived: bool = False,
    active_only: bool = False,
) -> list[Routine]:
    stmt = select(Routine)
    if not include_archived:
        stmt = stmt.where(Routine.archived_at.is_(None))
    if active_only:
        stmt = stmt.where(Routine.is_active == True)  # noqa: E712
    stmt = stmt.order_by(
        Routine.is_pinned.desc(),
        Routine.sort_order.asc(),
        Routine.created_at.asc(),
    )
    return list(session.exec(stmt).all())


def update_routine(
    session: Session, routine: Routine, data: RoutineUpdate
) -> Routine:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(routine, key, value)
    routine.updated_at = _utcnow()
    session.add(routine)
    session.commit()
    session.refresh(routine)
    return routine


def delete_routine(session: Session, routine: Routine) -> None:
    session.delete(routine)
    session.commit()


def archive_routine(session: Session, routine: Routine) -> Routine:
    routine.archived_at = _utcnow()
    routine.updated_at = _utcnow()
    session.add(routine)
    session.commit()
    session.refresh(routine)
    return routine


def restore_routine(session: Session, routine: Routine) -> Routine:
    routine.archived_at = None
    routine.updated_at = _utcnow()
    session.add(routine)
    session.commit()
    session.refresh(routine)
    return routine
