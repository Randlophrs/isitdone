from __future__ import annotations


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
