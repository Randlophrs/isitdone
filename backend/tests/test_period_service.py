from __future__ import annotations

from datetime import datetime, timezone

import pytest

from app.services.period_service import (
    daily_key,
    monthly_key,
    period_key_for,
    period_keys,
    weekly_key,
)


def _dt(y, m, d, tz="Asia/Jakarta"):
    from zoneinfo import ZoneInfo

    return datetime(y, m, d, 12, 0, 0, tzinfo=ZoneInfo(tz))


def test_daily_key_format():
    assert daily_key(_dt(2026, 8, 24)) == "2026-08-24"


def test_monthly_key_format():
    assert monthly_key(_dt(2026, 8, 24)) == "2026-08"


def test_weekly_key_monday_start():
    # 2026-08-24 is a Monday -> ISO week W35
    assert weekly_key(_dt(2026, 8, 24)) == "2026-W35"


def test_weekly_key_sunday_start():
    from app.config import settings

    settings.isitdone_week_starts_on = "sunday"
    try:
        # Sunday 2026-08-23 belongs to week starting that Sunday (W34)
        key = weekly_key(_dt(2026, 8, 23))
        assert key.startswith("2026-W")
    finally:
        settings.isitdone_week_starts_on = "monday"


def test_period_keys_contains_all_frequencies():
    keys = period_keys(_dt(2026, 8, 24))
    assert keys == {
        "daily": "2026-08-24",
        "weekly": "2026-W35",
        "monthly": "2026-08",
    }


def test_period_key_for_dispatches():
    assert period_key_for("weekly", _dt(2026, 8, 24)) == "2026-W35"
    assert period_key_for("monthly", _dt(2026, 8, 24)) == "2026-08"
    assert period_key_for("daily", _dt(2026, 8, 24)) == "2026-08-24"


def test_period_key_for_defaults_to_daily():
    assert period_key_for("unknown", _dt(2026, 8, 24)) == "2026-08-24"
