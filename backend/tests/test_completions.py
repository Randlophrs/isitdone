from __future__ import annotations

import datetime


def _make_daily(client):
    return client.post(
        "/api/routines", json={"name": "Genshin", "frequency": "daily"}
    ).json()["id"]


def test_complete_then_pending_status(client):
    rid = _make_daily(client)
    dash = client.get("/api/dashboard/current").json()
    assert dash["groups"][0]["routines"][0]["isCompleted"] is False

    assert client.post(f"/api/routines/{rid}/complete").status_code == 200
    dash = client.get("/api/dashboard/current").json()
    assert dash["groups"][0]["routines"][0]["isCompleted"] is True
    assert dash["progress"]["completed"] == 1


def test_uncomplete_returns_to_pending(client):
    rid = _make_daily(client)
    client.post(f"/api/routines/{rid}/complete")
    assert client.delete(f"/api/routines/{rid}/complete").status_code == 204
    dash = client.get("/api/dashboard/current").json()
    assert dash["groups"][0]["routines"][0]["isCompleted"] is False


def test_duplicate_completion_is_idempotent(client):
    rid = _make_daily(client)
    first = client.post(f"/api/routines/{rid}/complete").json()
    second = client.post(f"/api/routines/{rid}/complete").json()
    assert first["id"] == second["id"]


def test_completion_unique_per_period(client):
    # Build a second routine and verify completions list is independent.
    rid = _make_daily(client)
    client.post(f"/api/routines/{rid}/complete")
    comps = client.get(f"/api/routines/{rid}/completions").json()
    assert len(comps) == 1


def test_complete_missing_routine_404(client):
    assert client.post("/api/routines/nope/complete").status_code == 404


def test_skip_does_not_count_as_completed(client):
    rid = _make_daily(client)
    assert client.post(f"/api/routines/{rid}/skip").status_code == 200
    dash = client.get("/api/dashboard/current").json()
    r = dash["groups"][0]["routines"][0]
    assert r["isCompleted"] is False
    assert r["isSkipped"] is True
    # skipped period keeps progress at 0
    assert dash["progress"]["completed"] == 0


def test_skip_then_unskip_restores_pending(client):
    rid = _make_daily(client)
    client.post(f"/api/routines/{rid}/skip")
    assert client.delete(f"/api/routines/{rid}/skip").status_code == 204
    dash = client.get("/api/dashboard/current").json()
    r = dash["groups"][0]["routines"][0]
    assert r["isSkipped"] is False
    assert r["isCompleted"] is False


def test_complete_then_skip_replaces_completion(client):
    rid = _make_daily(client)
    client.post(f"/api/routines/{rid}/complete")
    client.post(f"/api/routines/{rid}/skip")
    comps = client.get(f"/api/routines/{rid}/completions").json()
    assert len(comps) == 1
    assert comps[0]["skipped"] is True


def test_first_skip_freezes_streak_second_breaks_it(client):
    rid = _make_daily(client)
    # Seed a 3-day streak ending yesterday (relative to the server's real
    # "today") via direct rows, so the freeze skip on today stays contiguous.
    from sqlmodel import Session
    from app.models.completion import Completion
    from app.models.routine import Routine
    import app.database as db
    from app.utils.ids import generate_id

    today = datetime.date.today()
    with Session(db.engine) as s:
        r = s.get(Routine, rid)
        r.created_at = (today - datetime.timedelta(days=10)).isoformat()
        s.add(r)
        s.commit()
    for i in range(1, 4):
        d = (today - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        with Session(db.engine) as s:
            s.add(Completion(id=generate_id(), routine_id=rid, period_key=d))
            s.commit()

    # First skip (today) is the weekly freeze -> streak survives.
    client.post(f"/api/routines/{rid}/skip")
    stats = client.get(f"/api/statistics/routine/{rid}").json()
    assert stats["currentStreak"] >= 3  # freeze kept the run alive

    # A second skip this week (on a different period) must NOT be a freeze:
    # only one grace per week. Drive the service directly on yesterday's key.
    from app.services import completion_service
    from app.services.period_service import period_key_for_routine
    import app.database as db
    from sqlmodel import Session

    with Session(db.engine) as s:
        r = s.get(Routine, rid)
        ykey = period_key_for_routine(
            r.frequency, r.timezone, r.reset_time, now=datetime.datetime(
                today.year, today.month, today.day
            ) - datetime.timedelta(days=1)
        )
        completion_service.skip_routine(s, r, now=datetime.datetime(
            today.year, today.month, today.day
        ) - datetime.timedelta(days=1))
        comps = client.get(f"/api/routines/{rid}/completions").json()
    assert any(c["skipped"] and not c["frozen"] for c in comps)
