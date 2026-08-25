from __future__ import annotations

import io
import json

import pytest


def _export(client):
    return client.get("/api/backup/export").json()


def test_export_format(client):
    exp = _export(client)
    assert exp["app"] == "isitdone"
    assert exp["version"] == 1
    for key in ("settings", "categories", "routines", "completions"):
        assert key in exp and isinstance(exp[key], list)


def test_export_import_roundtrip_merge(client):
    client.post("/api/routines", json={"name": "A", "frequency": "daily"})
    client.post("/api/routines", json={"name": "B", "frequency": "weekly"})
    exp = _export(client)
    assert len(exp["routines"]) == 2

    # Wipe and re-import.
    for r in client.get("/api/routines").json():
        client.delete(f"/api/routines/{r['id']}")
    assert client.get("/api/routines").json() == []

    payload = json.dumps(exp).encode()
    res = client.post(
        "/api/backup/import",
        files={"file": ("b.json", io.BytesIO(payload), "application/json")},
        data={"mode": "merge"},
    )
    assert res.status_code == 200
    assert len(client.get("/api/routines").json()) == 2


def test_import_replace_clears_existing(client):
    client.post("/api/routines", json={"name": "Old", "frequency": "daily"})
    exp = _export(client)
    client.post("/api/routines", json={"name": "Extra", "frequency": "daily"})
    assert len(client.get("/api/routines").json()) == 2

    payload = json.dumps(exp).encode()
    res = client.post(
        "/api/backup/import",
        files={"file": ("b.json", io.BytesIO(payload), "application/json")},
        data={"mode": "replace"},
    )
    assert res.status_code == 200
    assert len(client.get("/api/routines").json()) == 1


def test_import_rejects_non_isitdone_json(client):
    payload = json.dumps({"app": "other", "version": 1}).encode()
    res = client.post(
        "/api/backup/import",
        files={"file": ("x.json", io.BytesIO(payload), "application/json")},
        data={"mode": "merge"},
    )
    assert res.status_code == 400


def test_import_rejects_malformed_json(client):
    res = client.post(
        "/api/backup/import",
        files={"file": ("x.json", io.BytesIO(b"{not json"), "application/json")},
        data={"mode": "merge"},
    )
    assert res.status_code == 400


def test_import_rejects_bad_mode(client):
    exp = _export(client)
    payload = json.dumps(exp).encode()
    res = client.post(
        "/api/backup/import",
        files={"file": ("b.json", io.BytesIO(payload), "application/json")},
        data={"mode": "explode"},
    )
    assert res.status_code == 400


def test_health_check(client):
    assert client.get("/api/health").json()["status"] == "ok"
