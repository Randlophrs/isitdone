const ENABLED_KEY = "isitdone-reminders-enabled";
const TIMES_KEY = "isitdone-reminders";
const NOTIFIED_KEY = "isitdone-reminder-notified";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function remindersEnabled(): boolean {
  return localStorage.getItem(ENABLED_KEY) === "1";
}

export function setRemindersEnabled(on: boolean): void {
  localStorage.setItem(ENABLED_KEY, on ? "1" : "0");
  if (!on) clearNotified();
}

export function getReminderTimes(): Record<string, string> {
  return read<Record<string, string>>(TIMES_KEY, {});
}

export function setReminderTime(id: string, time: string | null): void {
  const times = getReminderTimes();
  if (time) times[id] = time;
  else delete times[id];
  localStorage.setItem(TIMES_KEY, JSON.stringify(times));
}

function getNotified(): Record<string, string> {
  return read<Record<string, string>>(NOTIFIED_KEY, {});
}

export function clearNotified(): void {
  localStorage.removeItem(NOTIFIED_KEY);
}

export function alreadyNotifiedToday(id: string, day: string): boolean {
  return getNotified()[id] === day;
}

export function markNotified(id: string, day: string): void {
  const notified = getNotified();
  notified[id] = day;
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
}
