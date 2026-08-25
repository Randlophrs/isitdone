from __future__ import annotations

import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "isitdone"
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000

    isitdone_data_dir: str | None = None
    isitdone_timezone: str = "Asia/Jakarta"
    isitdone_week_starts_on: str = "monday"

    cors_origins: str = "http://localhost:5173"

    @property
    def data_directory(self) -> str:
        return self._resolve_data_directory()

    @property
    def database_path(self) -> str:
        return os.path.join(self.data_directory, "isitdone.sqlite")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def _resolve_data_directory(self) -> str:
        if self.isitdone_data_dir:
            base = os.path.expanduser(self.isitdone_data_dir)
        elif os.name == "nt":
            app_data = os.getenv("APPDATA")
            if app_data:
                base = os.path.join(app_data, "isitdone", "data")
            else:
                base = os.path.join(
                    os.path.expanduser("~"),
                    "AppData",
                    "Roaming",
                    "isitdone",
                    "data",
                )
        else:
            base = os.path.join(
                os.path.expanduser("~"), ".local", "share", "isitdone"
            )
        os.makedirs(base, exist_ok=True)
        return base


settings = Settings()
