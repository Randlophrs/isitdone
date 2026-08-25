from __future__ import annotations

from datetime import tzinfo
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from ..config import settings

_DEFAULT_TZ = "UTC"


def get_tz() -> tzinfo:
    try:
        return ZoneInfo(settings.isitdone_timezone)
    except (ZoneInfoNotFoundError, ValueError):
        return ZoneInfo(_DEFAULT_TZ)
