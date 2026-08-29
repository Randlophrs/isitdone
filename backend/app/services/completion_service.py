from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from ..models.completion import Completion
from ..models.routine import Routine
from ..services.period_service import (
  period_key_for_routine,
  weekly_key,
  now_for_routine,
)
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


def is_skipped(
    session: Session, routine: Routine, period_key: str
) -> bool:
    row = session.exec(
        select(Completion).where(
            Completion.routine_id == routine.id,
            Completion.period_key == period_key,
            Completion.skipped == True,  # noqa: E712
        )
    ).first()
    return row is not None


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


def skip_routine(
    session: Session, routine: Routine, now: datetime | None = None
) -> Completion:
    """Mark the active period as skipped (satisfied, not completed).

    A skipped period does not count toward the completion rate. The *first*
    skip each week is a "freeze" that also keeps the streak alive; further
    skips that week break the streak (streak grace, capped at one per week).
    If the period was completed, it is replaced by a skip.
    """
    period_key = period_key_for_routine(
        routine.frequency,
        routine.timezone,
        routine.reset_time,
        now,
        weekday=routine.weekday,
        monthweek=routine.monthweek,
    )
    frozen = not _freeze_used_this_week(session, routine, now)
    existing = is_completed(session, routine, period_key)
    if existing:
        existing.skipped = True
        existing.frozen = frozen
        existing.completed_at = _utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    completion = Completion(
        id=generate_id(),
        routine_id=routine.id,
        period_key=period_key,
        completed_at=_utcnow(),
        skipped=True,
        frozen=frozen,
    )
    session.add(completion)
    session.commit()
    session.refresh(completion)
    return completion


def unskip_routine(
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
    if existing and existing.skipped:
        session.delete(existing)
        session.commit()


def freeze_used_this_week(
    session: Session, routine: Routine, now: datetime | None = None
) -> bool:
    """True if a freeze (streak-protecting skip) was already used this week."""
    return _freeze_used_this_week(session, routine, now)


def _freeze_used_this_week(
    session: Session, routine: Routine, now: datetime | None = None
) -> bool:
    ref = now_for_routine(routine.timezone, routine.reset_time) if now is None else now
    week = weekly_key(ref)
    rows = session.exec(
        select(Completion.completed_at).where(
            Completion.routine_id == routine.id,
            Completion.skipped == True,  # noqa: E712
            Completion.frozen == True,  # noqa: E712
        )
    ).all()
    # ponytail: compare week bucket of completed_at — avoids a second tz parse.
    for ts in rows:
        try:
            d = datetime.fromisoformat(ts)
        except (ValueError, TypeError):
            continue
        if weekly_key(d) == week:
            return True
    return False


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
