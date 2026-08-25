from __future__ import annotations

from datetime import datetime

from .timezone import get_tz


def now_in_timezone() -> datetime:
    """Current time as an aware datetime in the configured project timezone."""
    return datetime.now(get_tz())
