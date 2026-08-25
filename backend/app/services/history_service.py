from __future__ import annotations

from typing import Optional

from sqlmodel import Session, select

from ..models.completion import Completion
from ..models.routine import Routine


def history_summary(session: Session) -> dict:
    """All completions grouped by period key with routine names."""
    completions = session.exec(select(Completion)).all()
    routines = {
        r.id: r.name for r in session.exec(select(Routine)).all()
    }
    by_period: dict[str, list[dict]] = {}
    for c in completions:
        by_period.setdefault(c.period_key, []).append(
            {
                "routineId": c.routine_id,
                "routineName": routines.get(c.routine_id, "Unknown"),
                "completedAt": c.completed_at,
            }
        )
    return {
        "periods": [
            {"periodKey": k, "completions": v}
            for k, v in sorted(by_period.items())
        ]
    }


def history_by_month(session: Session, year: int, month: int) -> dict:
    prefix = f"{year:04d}-{month:02d}"
    completions = session.exec(
        select(Completion).where(Completion.period_key.like(f"{prefix}%"))
    ).all()
    routines = {
        r.id: r.name for r in session.exec(select(Routine)).all()
    }
    return {
        "year": year,
        "month": month,
        "completions": [
            {
                "routineId": c.routine_id,
                "routineName": routines.get(c.routine_id, "Unknown"),
                "periodKey": c.period_key,
                "completedAt": c.completed_at,
            }
            for c in completions
        ],
    }


def history_by_routine(session: Session, routine_id: str) -> dict:
    completions = session.exec(
        select(Completion)
        .where(Completion.routine_id == routine_id)
        .order_by(Completion.completed_at.desc())
    ).all()
    return {
        "routineId": routine_id,
        "completions": [
            {"periodKey": c.period_key, "completedAt": c.completed_at}
            for c in completions
        ],
    }


def get_routine_or_none(session: Session, routine_id: str) -> Optional[Routine]:
    return session.get(Routine, routine_id)
