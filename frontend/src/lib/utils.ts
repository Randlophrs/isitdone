type ClassValue = string | number | null | false | undefined | ClassValue[];

/** Minimal classnames helper — avoids an extra dependency. */
export function cx(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const a of args) {
    if (!a) continue;
    if (Array.isArray(a)) {
      const inner = cx(...a);
      if (inner) out.push(inner);
    } else {
      out.push(String(a));
    }
  }
  return out.join(" ");
}

export function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function frequencyLabel(f: string): string {
  return f.charAt(0).toUpperCase() + f.slice(1);
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Compact schedule tokens for the card meta line (day, or "Nth week · day"). */
export function compactSchedule(
  frequency: string,
  weekday: number | null,
  monthweek: number | null,
): string {
  if (frequency === "weekly" && weekday !== null && weekday >= 0 && weekday <= 6) {
    return WEEKDAYS[weekday];
  }
  if (
    frequency === "monthly" &&
    monthweek !== null &&
    monthweek >= 1 &&
    monthweek <= 5 &&
    weekday !== null &&
    weekday >= 0 &&
    weekday <= 6
  ) {
    const ord = ["1st", "2nd", "3rd", "4th", "5th"][monthweek - 1] ?? `${monthweek}th`;
    return `${ord} · ${WEEKDAYS[weekday].slice(0, 3)}`;
  }
  return "";
}
