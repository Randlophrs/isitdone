from __future__ import annotations

import os

import pytest
from sqlmodel import create_engine


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """App TestClient bound to an isolated temp sqlite db."""
    data_dir = tmp_path / "data"
    data_dir.mkdir(exist_ok=True)
    db_path = str(data_dir / "isitdone.sqlite")

    # Redirect settings + engine to the temp db.
    from app.config import settings

    monkeypatch.setattr(settings, "isitdone_data_dir", str(data_dir))
    test_engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    monkeypatch.setattr("app.database.engine", test_engine)

    from app.database import init_db
    from app.main import app
    from fastapi.testclient import TestClient

    init_db()
    with TestClient(app) as c:
        yield c
