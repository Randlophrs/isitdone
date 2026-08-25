// Timezone helpers for the add-routine form.
//
// We lean on the browser's own IANA zone database (Intl.supportedValuesOf)
// rather than shipping a hand-maintained list. Falls back to a small curated
// set on older engines that lack it.

const FALLBACK = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Kuala_Lumpur",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "UTC",
];

export function getTimezones(): string[] {
  try {
    const supported = (Intl as unknown as {
      supportedValuesOf?: (k: string) => string[];
    }).supportedValuesOf?.("timeZone");
    if (supported && supported.length) return supported;
  } catch {
    /* ignore */
  }
  return FALLBACK;
}

export function getDefaultTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/** Live "now" formatted in a timezone, e.g. "14:08 WIB". null → app default. */
export function formatTzNow(tz: string | null): string {
  const zone = tz || getDefaultTimezone() || "UTC";
  const now = new Date();
  // Short zone abbreviation where available (WIB, EST, ...).
  let abbr = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "short",
    }).formatToParts(now);
    abbr = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    abbr = "";
  }
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return abbr ? `${time} ${abbr}` : time;
}
