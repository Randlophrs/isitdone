from __future__ import annotations

import pytest


def test_create_routine(client):
    r = client.post(
        "/api/routines",
        json={"name": "Duolingo", "frequency": "daily"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Duolingo"
    assert body["frequency"] == "daily"
    assert body["is_active"] is True


def test_invalid_frequency_rejected(client):
    r = client.post(
        "/api/routines", json={"name": "X", "frequency": "hourly"}
    )
    assert r.status_code == 422


def test_get_and_update_routine(client):
    rid = client.post(
        "/api/routines", json={"name": "A", "frequency": "daily"}
    ).json()["id"]
    got = client.get(f"/api/routines/{rid}")
    assert got.status_code == 200

    upd = client.patch(f"/api/routines/{rid}", json={"name": "B"})
    assert upd.json()["name"] == "B"


def test_routine_not_found(client):
    assert client.get("/api/routines/nope").status_code == 404


def test_archive_hides_from_active_list(client):
    rid = client.post(
        "/api/routines", json={"name": "A", "frequency": "daily"}
    ).json()["id"]
    assert len(client.get("/api/routines").json()) == 1
    client.post(f"/api/routines/{rid}/archive")
    assert len(client.get("/api/routines").json()) == 0
    # visible with include_archived
    assert (
        len(client.get("/api/routines", params={"include_archived": "true"}).json())
        == 1
    )


def test_restore_routine(client):
    rid = client.post(
        "/api/routines", json={"name": "A", "frequency": "daily"}
    ).json()["id"]
    client.post(f"/api/routines/{rid}/archive")
    client.post(f"/api/routines/{rid}/restore")
    assert len(client.get("/api/routines").json()) == 1


def test_delete_routine(client):
    rid = client.post(
        "/api/routines", json={"name": "A", "frequency": "daily"}
    ).json()["id"]
    assert client.delete(f"/api/routines/{rid}").status_code == 204
    assert client.get(f"/api/routines/{rid}").status_code == 404
