from __future__ import annotations

import datetime

from sqlmodel import Session

import app.database as db
from app.models.completion import Completion
from app.models.routine import Routine
from app.utils.ids import generate_id


def _seed_daily(client, days_completed):
    """Create a daily routine created 10 days ago, complete N trailing days."""
    created = datetime.datetime(2026, 8, 15, 9, 0, 0).isoformat()
    rid = generate_id()
    with Session(db.engine) as s:
        s.add(
            Routine(
                id=rid,
                name="Push-up",
                frequency="daily",
                created_at=created,
                updated_at=created,
            )
        )
        s.commit()
    today = datetime.date(2026, 8, 25)
    # complete the last `days_completed` days *before* today (today stays open)
    for i in range(days_completed):
        d = today - datetime.timedelta(days=i + 1)
        with Session(db.engine) as s:
            s.add(
                Completion(
                    id=generate_id(),
                    routine_id=rid,
                    period_key=d.strftime("%Y-%m-%d"),
                    completed_at=d.isoformat(),
                )
            )
            s.commit()
    return rid


def test_current_streak_zero_when_today_open(client):
    rid = _seed_daily(client, days_completed=5)
    stats = client.get(f"/api/statistics/routine/{rid}").json()
    # 5 prior days done, today open -> current 0, longest 5
    assert stats["currentStreak"] == 0
    assert stats["longestStreak"] == 5


def test_current_streak_counts_when_today_done(client):
    rid = _seed_daily(client, days_completed=5)
    client.post(f"/api/routines/{rid}/complete")
    stats = client.get(f"/api/statistics/routine/{rid}").json()
    assert stats["currentStreak"] == 6


def test_completion_rate(client):
    rid = _seed_daily(client, days_completed=5)
    # elapsed = 11 (Aug 15..25), done = 5 -> 45.5
    stats = client.get(f"/api/statistics/routine/{rid}").json()
    assert stats["periodsElapsed"] == 11
    assert stats["completionRate"] == 45.5


def test_statistics_missing_routine(client):
    assert client.get("/api/statistics/routine/nope").status_code == 404
