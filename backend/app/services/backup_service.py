from __future__ import annotations

import json
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlmodel import Session, select

from ..config import settings
from ..models.category import Category
from ..models.completion import Completion
from ..models.routine import Routine
from ..models.setting import Setting

BACKUP_VERSION = 1


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def export_json(session: Session) -> dict:
    routines = [r.model_dump(mode="json") for r in session.exec(select(Routine)).all()]
    completions = [
        c.model_dump(mode="json") for c in session.exec(select(Completion)).all()
    ]
    categories = [
        c.model_dump(mode="json") for c in session.exec(select(Category)).all()
    ]
    settings_rows = [
        s.model_dump(mode="json") for s in session.exec(select(Setting)).all()
    ]
    return {
        "version": BACKUP_VERSION,
        "app": "isitdone",
        "exportedAt": _utcnow(),
        "settings": settings_rows,
        "categories": categories,
        "routines": routines,
        "completions": completions,
    }


def validate_import(data: dict) -> None:
    if not isinstance(data, dict):
        raise ValueError("root must be an object")
    if data.get("app") != "isitdone":
        raise ValueError("not an isitdone backup (app field missing/wrong)")
    version = data.get("version")
    if not isinstance(version, int):
        raise ValueError("version must be an integer")
    for key in ("routines", "completions", "categories", "settings"):
        if key not in data:
            raise ValueError(f"missing field: {key}")
        if not isinstance(data[key], list):
            raise ValueError(f"{key} must be a list")
    # basic shape checks
    for r in data["routines"]:
        if not isinstance(r.get("id"), str) or not isinstance(r.get("name"), str):
            raise ValueError("routine entry missing id/name")
    for c in data["completions"]:
        if not c.get("routine_id") or not c.get("period_key"):
            raise ValueError("completion entry missing routine_id/period_key")


def import_json(session: Session, data: dict, mode: str = "merge") -> dict:
    validate_import(data)
    if mode == "replace":
        _clear_all(session)
    # upsert categories
    for c in data["categories"]:
        _upsert(session, Category, c)
    for r in data["routines"]:
        _upsert(session, Routine, r)
    for s in data["settings"]:
        _upsert(session, Setting, s)
    # completions: dedupe by (routine_id, period_key)
    existing = {
        (c.routine_id, c.period_key)
        for c in session.exec(select(Completion)).all()
    }
    for comp in data["completions"]:
        key = (comp["routine_id"], comp["period_key"])
        if key in existing:
            continue
        session.add(
            Completion(
                id=comp.get("id") or uuid.uuid4().hex,
                routine_id=comp["routine_id"],
                period_key=comp["period_key"],
                completed_at=comp.get("completed_at") or _utcnow(),
            )
        )
    session.commit()
    return {
        "mode": mode,
        "imported": {
            "categories": len(data["categories"]),
            "routines": len(data["routines"]),
            "completions": len(data["completions"]),
            "settings": len(data["settings"]),
        },
    }


def _upsert(session: Session, model, row: dict) -> None:
    obj = session.get(model, row["id"])
    if obj is None:
        session.add(model(**row))
    else:
        for k, v in row.items():
            setattr(obj, k, v)
        session.add(obj)


def _clear_all(session: Session) -> None:
    for m in (Completion, Routine, Category, Setting):
        for obj in session.exec(select(m)).all():
            session.delete(obj)
    session.commit()


def backup_sqlite() -> str:
    src = Path(settings.database_path)
    dst = (
        Path(settings.data_directory)
        / f"isitdone-sqlite-backup-{_utcnow()[:19].replace(':','-')}.sqlite"
    )
    shutil.copyfile(src, dst)
    return str(dst)


def restore_sqlite(upload_path: str) -> None:
    src = Path(upload_path)
    if not src.exists():
        raise ValueError("upload file not found")
    import sqlite3

    conn = sqlite3.connect(str(src))
    tables = {
        r[0]
        for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).all()
    }
    conn.close()
    for required in ("routines", "completions"):
        if required not in tables:
            raise ValueError("not a valid isitdone database")
    dst = Path(settings.database_path)
    shutil.copyfile(src, dst)
    # Drop pooled connections so the next request opens the restored file.
    from ..database import engine

    engine.dispose()
