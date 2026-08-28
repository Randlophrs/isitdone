from __future__ import annotations

from datetime import datetime, timezone

import pytest

from app.services.period_service import (
    all_period_keys_between,
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


def test_weekly_fixed_weekday_keys_to_that_day():
    # Routine "every Monday": on a Wednesday it should key to the Monday
    # on/before now, not the ISO week bucket.
    assert period_key_for("weekly", _dt(2026, 8, 26), weekday=0) == "2026-08-24"
    # On Monday itself -> that Monday.
    assert period_key_for("weekly", _dt(2026, 8, 24), weekday=0) == "2026-08-24"


def test_monthly_fixed_weekday_keys_to_week_occurrence():
    # "3rd Friday of the month" in Aug 2026 (Fri=4) -> 2026-08-W3-Fri
    assert period_key_for("monthly", _dt(2026, 8, 26), weekday=4, monthweek=3) == "2026-08-W3-Fri"


def test_monthly_week_only_keys_to_week():
    assert period_key_for("monthly", _dt(2026, 8, 26), monthweek=2) == "2026-08-W2"


def test_all_period_keys_weekly_fixed_weekday_count():
    # 4 Mondays between 2026-08-03 and 2026-08-31.
    keys = all_period_keys_between(
        "weekly", _dt(2026, 8, 3).date(), _dt(2026, 8, 31).date(), weekday=0
    )
    assert keys == ["2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24", "2026-08-31"]


def test_all_period_keys_monthly_count():
    # Jan..Jun 2026 = 6 monthly periods.
    keys = all_period_keys_between("monthly", _dt(2026, 1, 15).date(), _dt(2026, 6, 15).date())
    assert keys == ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]


def test_all_period_keys_monthly_fixed_week_count():
    # 3rd Friday of each month, Mar..May 2026.
    keys = all_period_keys_between(
        "monthly", _dt(2026, 3, 1).date(), _dt(2026, 5, 31).date(), weekday=4, monthweek=3
    )
    assert keys == ["2026-03-W3-Fri", "2026-04-W3-Fri", "2026-05-W3-Fri"]
