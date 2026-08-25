from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from ..models.completion import Completion
from ..models.routine import Routine
from ..services.period_service import period_key_for_routine
from ..utils.ids import generate_id


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_completed(
    session: Session, routine: Routine, period_key: str
) -> Optional[Completion]:
    return session.exec(
        select(Completion).where(
            Completion.routine_id == routine.id,
            Completion.period_key == period_key,
        )
    ).first()


def complete_routine(
    session: Session, routine: Routine, now: datetime | None = None
) -> Completion:
    period_key = period_key_for_routine(
        routine.frequency,
        routine.timezone,
        routine.reset_time,
        now,
        weekday=routine.weekday,
        monthweek=routine.monthweek,
    )
    existing = is_completed(session, routine, period_key)
    if existing:
        return existing
    completion = Completion(
        id=generate_id(),
        routine_id=routine.id,
        period_key=period_key,
        completed_at=_utcnow(),
    )
    session.add(completion)
    session.commit()
    session.refresh(completion)
    return completion


def uncomplete_routine(
    session: Session, routine: Routine, now: datetime | None = None
) -> None:
    period_key = period_key_for_routine(
        routine.frequency,
        routine.timezone,
        routine.reset_time,
        now,
        weekday=routine.weekday,
        monthweek=routine.monthweek,
    )
    existing = is_completed(session, routine, period_key)
    if existing:
        session.delete(existing)
        session.commit()


def list_completions(
    session: Session, routine_id: str
) -> list[Completion]:
    stmt = (
        select(Completion)
        .where(Completion.routine_id == routine_id)
        .order_by(Completion.completed_at.desc())
    )
    return list(session.exec(stmt).all())


def completion_count_for_period(
    session: Session, routine_id: str, period_key: str
) -> int:
    return len(
        session.exec(
            select(Completion.id).where(
                Completion.routine_id == routine_id,
                Completion.period_key == period_key,
            )
        ).all()
    )
