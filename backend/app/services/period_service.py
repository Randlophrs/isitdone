from __future__ import annotations

from datetime import date, datetime, timedelta

from ..config import settings
from ..utils.dates import now_in_timezone


def week_starts_on() -> int:
    """Return weekday index (0=Monday) for week start per config."""
    return 0 if settings.isitdone_week_starts_on.lower() == "monday" else 6


def period_keys(now: datetime | None = None) -> dict[str, str]:
    """Return the active period keys for daily, weekly, monthly for a moment."""
    now = now or now_in_timezone()
    return {
        "daily": daily_key(now),
        "weekly": weekly_key(now),
        "monthly": monthly_key(now),
    }


def daily_key(now: datetime | None = None) -> str:
    now = now or now_in_timezone()
    return now.strftime("%Y-%m-%d")


def monthly_key(now: datetime | None = None) -> str:
    now = now or now_in_timezone()
    return now.strftime("%Y-%m")


def weekly_key(now: datetime | None = None) -> str:
    """ISO week key YYYY-Www using configured week start.

    Python's %G/%V/%u already produce ISO weeks (Monday-start). For
    Sunday-start we shift the reference date back/forward by one day so the
    week bucket aligns to Sunday.
    """
    now = now or now_in_timezone()
    if week_starts_on() == 6:  # Sunday-start
        ref = now + _day_offset(1)
    else:
        ref = now
    iso_year, iso_week, _ = ref.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"


def _day_offset(days: int) -> object:
    from datetime import timedelta

    return timedelta(days=days)


def period_key_for(frequency: str, now: datetime | None = None) -> str:
    freq = (frequency or "").lower()
    if freq == "weekly":
        return weekly_key(now)
    if freq == "monthly":
        return monthly_key(now)
    return daily_key(now)


def format_date_label(now: datetime | None = None) -> str:
    now = now or now_in_timezone()
    return now.strftime("%A, %d %B %Y")


def today_date(now: datetime | None = None) -> date:
    now = now or now_in_timezone()
    return now.date()


def all_period_keys_between(frequency: str, start: date, end: date) -> list[str]:
    """Inclusive list of period keys from start date to end date."""
    keys: list[str] = []
    cursor = start
    while cursor <= end:
        if frequency == "monthly":
            keys.append(cursor.strftime("%Y-%m"))
            # advance to first day of next month
            if cursor.month == 12:
                cursor = cursor.replace(year=cursor.year + 1, month=1, day=1)
            else:
                cursor = cursor.replace(month=cursor.month + 1, day=1)
        elif frequency == "weekly":
            keys.append(weekly_key_for_date(cursor))
            cursor = cursor + timedelta(days=7)
        else:  # daily
            keys.append(cursor.strftime("%Y-%m-%d"))
            cursor = cursor + timedelta(days=1)
    # dedupe (weekly/monthly boundaries can repeat)
    seen = set()
    out = []
    for k in keys:
        if k not in seen:
            seen.add(k)
            out.append(k)
    return out


def weekly_key_for_date(d: date) -> str:
    """Weekly key for an explicit calendar date (keeps week-start config)."""
    if week_starts_on() == 6:  # Sunday-start
        ref = d + timedelta(days=1)
    else:
        ref = d
    iso_year, iso_week, _ = ref.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"
