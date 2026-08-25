from __future__ import annotations

import json
import os
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from ..dependencies import SessionDep
from ..schemas.backup import BackupImportResponse
from ..services import backup_service

router = APIRouter(prefix="/api/backup", tags=["backup"])


@router.get("/export")
def export_backup(session: SessionDep) -> JSONResponse:
    data = backup_service.export_json(session)
    return JSONResponse(content=data)


@router.post("/import", response_model=BackupImportResponse)
async def import_backup(
    session: SessionDep,
    file: UploadFile = File(...),
    mode: str = Form("merge"),
) -> BackupImportResponse:
    if mode not in ("merge", "replace"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="mode must be merge or replace",
        )
    raw = await file.read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="invalid JSON file",
        )
    try:
        result = backup_service.import_json(session, data, mode=mode)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
    return BackupImportResponse(**result)


@router.post("/sqlite")
def backup_sqlite(session: SessionDep) -> dict:
    path = backup_service.backup_sqlite()
    return {"path": path, "filename": os.path.basename(path)}


@router.post("/restore")
async def restore_sqlite(
    session: SessionDep, file: UploadFile = File(...)
) -> dict:
    suffix = os.path.splitext(file.filename or "")[1] or ".sqlite"
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=suffix
    ) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        backup_service.restore_sqlite(tmp_path)
    except ValueError as exc:
        os.unlink(tmp_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
    return {"status": "restored"}
