from __future__ import annotations

from datetime import date, datetime, timedelta

from ..config import settings
from ..utils.dates import now_in_timezone
from ..utils.timezone import get_tz


def week_starts_on() -> int:
    """Return weekday index (0=Monday) for week start per config."""
    return 0 if settings.isitdone_week_starts_on.lower() == "monday" else 6


WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


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


def period_key_for(
    frequency: str,
    now: datetime | None = None,
    *,
    weekday: int | None = None,
    monthweek: int | None = None,
) -> str:
    """Period key for a frequency.

    `weekday` (0=Mon..6=Sun) turns a weekly routine into a fixed-day-of-week
    routine (keyed by the date of that weekday). `monthweek` (1..5) turns a
    monthly routine into a fixed-week-of-month routine (keyed by YYYY-MM-Wn).
    """
    now = now or now_in_timezone()
    freq = (frequency or "").lower()
    if freq == "monthly":
        if monthweek:
            suffix = f"-W{monthweek}"
            if weekday is not None:
                suffix += f"-{WEEKDAY_SHORT[weekday % 7]}"
            return f"{now.strftime('%Y-%m')}{suffix}"
        return monthly_key(now)
    if freq == "weekly":
        if weekday is not None:
            return _weekday_occurrence(weekday, now).strftime("%Y-%m-%d")
        return weekly_key(now)
    return daily_key(now)


def _weekday_occurrence(weekday: int, now: datetime | date) -> date:
    """Date of the most recent occurrence of `weekday` on or before `now`."""
    base = now if isinstance(now, date) and not isinstance(now, datetime) else now.date()
    wd = ((weekday % 7) + 7) % 7
    delta = (base.weekday() - wd) % 7
    return base - timedelta(days=delta)


def now_for_routine(tz: str | None = None, reset_time: str | None = None) -> datetime:
    """Current aware datetime in the routine's tz (global tz if None).

    If `reset_time` (HH:MM) is given, the clock is shifted back so each
    period begins at that hour instead of midnight — e.g. a daily routine
    with reset_time "04:00" counts 04:00→03:59 as one day.
    """
    now = datetime.now(get_tz() if tz is None else _zone(tz))
    return _shift_for_reset(now, reset_time)


def period_key_for_routine(
    frequency: str,
    tz: str | None = None,
    reset_time: str | None = None,
    now: datetime | None = None,
    *,
    weekday: int | None = None,
    monthweek: int | None = None,
) -> str:
    """Period key for a routine, computed in the routine's own timezone."""
    if now is None:
        now = now_for_routine(tz, reset_time)
    return period_key_for(
        frequency, now, weekday=weekday, monthweek=monthweek
    )


def _shift_for_reset(now: datetime, reset_time: str | None) -> datetime:
    if not reset_time:
        return now
    try:
        h, m = (int(x) for x in reset_time.split(":"))
    except (ValueError, AttributeError):
        return now
    if not (0 <= h <= 23 and 0 <= m <= 59):
        return now
    if now.hour < h or (now.hour == h and now.minute < m):
        # Before today's reset: still in the previous period.
        return now - timedelta(days=1)
    return now


def _zone(tz: str) -> object:
    from zoneinfo import ZoneInfo

    try:
        return ZoneInfo(tz)
    except (Exception):
        return get_tz()


def format_date_label(now: datetime | None = None) -> str:
    now = now or now_in_timezone()
    return now.strftime("%A, %d %B %Y")


def today_date(now: datetime | None = None) -> date:
    now = now or now_in_timezone()
    return now.date()


def all_period_keys_between(
    frequency: str,
    start: date,
    end: date,
    *,
    weekday: int | None = None,
    monthweek: int | None = None,
) -> list[str]:
    """Inclusive list of period keys from start date to end date.

    Honors `weekday` (weekly→fixed day) and `monthweek` (monthly→fixed
    week-of-month) the same way `period_key_for` does.
    """
    freq = (frequency or "").lower()
    keys: list[str] = []
    cursor = start
    while cursor <= end:
        if freq == "monthly" and monthweek:
            suffix = f"-W{monthweek}"
            if weekday is not None:
                suffix += f"-{WEEKDAY_SHORT[weekday % 7]}"
            keys.append(f"{cursor.strftime('%Y-%m')}{suffix}")
            # advance to first day of next month
            if cursor.month == 12:
                cursor = cursor.replace(year=cursor.year + 1, month=1, day=1)
            else:
                cursor = cursor.replace(month=cursor.month + 1, day=1)
        elif freq == "weekly" and weekday is not None:
            keys.append(_weekday_occurrence(weekday, cursor).strftime("%Y-%m-%d"))
            cursor = cursor + timedelta(days=7)
        elif freq == "monthly":
            keys.append(cursor.strftime("%Y-%m"))
            if cursor.month == 12:
                cursor = cursor.replace(year=cursor.year + 1, month=1, day=1)
            else:
                cursor = cursor.replace(month=cursor.month + 1, day=1)
        elif freq == "weekly":
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
