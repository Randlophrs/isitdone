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
