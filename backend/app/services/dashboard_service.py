from __future__ import annotations

from collections import defaultdict
from typing import Optional

from sqlmodel import Session, select

from ..models.category import Category
from ..models.completion import Completion
from ..models.routine import Routine
from ..services.completion_service import is_completed
from ..services.period_service import period_key_for_routine, period_keys
from ..services.routine_service import list_routines


def current_dashboard(session: Session) -> dict:
    keys = period_keys()
    routines = list_routines(session, active_only=True)
    categories = {
        c.id: c for c in session.exec(select(Category)).all()
    }

    groups: dict[str, dict] = defaultdict(
        lambda: {"category": None, "routines": []}
    )
    completed = 0

    for routine in routines:
        period_key = period_key_for_routine(
            routine.frequency,
            routine.timezone,
            routine.reset_time,
            weekday=routine.weekday,
            monthweek=routine.monthweek,
        )
        done = is_completed(session, routine, period_key) is not None
        if done:
            completed += 1
        cat = categories.get(routine.category_id) if routine.category_id else None
        cat_name = cat.name if cat else "Uncategorized"
        entry = {
            "id": routine.id,
            "name": routine.name,
            "description": routine.description,
            "frequency": routine.frequency,
            "categoryId": routine.category_id,
            "categoryName": cat_name,
            "color": cat.color if cat else None,
            "icon": cat.icon if cat else None,
            "isPinned": routine.is_pinned,
            "timezone": routine.timezone,
            "weekday": routine.weekday,
            "monthweek": routine.monthweek,
            "periodKey": period_key,
            "isCompleted": done,
            "completedAt": _completed_at(session, routine.id, period_key),
        }
        groups[cat_name]["category"] = cat_name
        groups[cat_name]["routines"].append(entry)

    total = len(routines)
    percentage = round((completed / total) * 100) if total else 0

    return {
        "date": keys["daily"],
        "week": keys["weekly"],
        "month": keys["monthly"],
        "progress": {
            "completed": completed,
            "total": total,
            "percentage": percentage,
        },
        "groups": [
            {
                "category": g["category"],
                "routines": _sort_group(g["routines"]),
            }
            for g in groups.values()
        ],
    }


def _sort_group(routines: list[dict]) -> list[dict]:
    return sorted(
        routines,
        key=lambda r: (not r["isPinned"], r["isCompleted"], r["name"].lower()),
    )


def _completed_at(
    session: Session, routine_id: str, period_key: str
) -> Optional[str]:
    comp = session.exec(
        select(Completion).where(
            Completion.routine_id == routine_id,
            Completion.period_key == period_key,
        )
    ).first()
    return comp.completed_at if comp else None
