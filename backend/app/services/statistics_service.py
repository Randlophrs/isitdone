from __future__ import annotations

from datetime import date

from sqlmodel import Session, select

from ..models.completion import Completion
from ..models.routine import Routine
from ..services.period_service import all_period_keys_between, today_date
from ..utils.dates import now_in_timezone


def _completed_keys(session: Session, routine_id: str) -> set[str]:
    rows = session.exec(
        select(Completion.period_key).where(
            Completion.routine_id == routine_id
        )
    ).all()
    return set(rows)


def routine_statistics(session: Session, routine: Routine) -> dict:
    completed_keys = _completed_keys(session, routine.id)
    created = _parse_date(routine.created_at)
    today = today_date()
    # Periods elapsed since creation (inclusive of creation day) up to today.
    periods = all_period_keys_between(routine.frequency, created, today)
    elapsed = len(periods)
    done = len(completed_keys & set(periods))
    rate = round((done / elapsed) * 100, 1) if elapsed else 0.0

    current = _current_streak(periods, completed_keys)
    longest = _longest_streak(periods, completed_keys)

    return {
        "routineId": routine.id,
        "frequency": routine.frequency,
        "createdAt": routine.created_at,
        "currentStreak": current,
        "longestStreak": longest,
        "completionRate": rate,
        "periodsElapsed": elapsed,
        "periodsCompleted": done,
    }


def overall_statistics(session: Session) -> dict:
    routines = session.exec(
        select(Routine).where(Routine.archived_at.is_(None))
    ).all()
    per_routine = [routine_statistics(session, r) for r in routines]
    total_done = sum(p["periodsCompleted"] for p in per_routine)
    total_elapsed = sum(p["periodsElapsed"] for p in per_routine)
    overall_rate = (
        round((total_done / total_elapsed) * 100, 1) if total_elapsed else 0.0
    )
    return {
        "overallCompletionRate": overall_rate,
        "routines": per_routine,
    }


def _current_streak(periods: list[str], completed_keys: set[str]) -> int:
    """Consecutive completed periods ending at the present period.

    If the current period is not yet completed, streak is 0 (today is still
    open, so the trailing run of finished periods has not "reached" now).
    """
    if not periods:
        return 0
    if periods[-1] not in completed_keys:
        return 0
    streak = 0
    for key in reversed(periods):
        if key in completed_keys:
            streak += 1
        else:
            break
    return streak


def _longest_streak(periods: list[str], completed_keys: set[str]) -> int:
    best = 0
    run = 0
    for key in periods:
        if key in completed_keys:
            run += 1
            best = max(best, run)
        else:
            run = 0
    return best


def _parse_date(iso: str) -> date:
    from datetime import datetime

    return datetime.fromisoformat(iso).date()
