from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .api import (
    backup,
    categories,
    completions,
    dashboard,
    health,
    history,
    routines,
    statistics,
)
from .config import settings
from .database import init_db


def create_app() -> FastAPI:
    app = FastAPI(title=f"{settings.app_name} API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(categories.router)
    app.include_router(routines.router)
    app.include_router(completions.router)
    app.include_router(dashboard.router)
    app.include_router(history.router)
    app.include_router(statistics.router)
    app.include_router(backup.router)

    init_db()

    frontend_path = (
        Path(__file__).resolve().parents[2] / "frontend" / "dist"
    )
    if frontend_path.exists():
        # SPA fallback: serve index.html for client-side routes that are not
        # real files (no extension) and not under /api.
        from fastapi import APIRouter

        from fastapi.staticfiles import StaticFiles

        spa = APIRouter()

        @spa.get("/{full_path:path}")
        def spa_index(full_path: str) -> FileResponse:
            candidate = frontend_path / full_path
            if "." in full_path and candidate.exists():
                return FileResponse(str(candidate))
            return FileResponse(str(frontend_path / "index.html"))

        app.include_router(spa)
        app.mount(
            "/",
            StaticFiles(directory=str(frontend_path), html=True),
            name="frontend",
        )

    return app


app = create_app()
