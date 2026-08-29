import { useEffect } from "react";
import { useDashboard } from "@/features/routines/queries";
import {
  alreadyNotifiedToday,
  getReminderTimes,
  markNotified,
  remindersEnabled,
} from "@/lib/reminders";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function notify(title: string, body: string): void {
  try {
    new Notification(title, { body });
  } catch {
    /* notifications unsupported */
  }
}

export function useReminders(): void {
  const { data } = useDashboard();

  useEffect(() => {
    if (!remindersEnabled()) return;
    if (!("Notification" in window)) return;

    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
      const day = todayStr();
      const times = getReminderTimes();
      const byId = new Map<string, { name: string; done: boolean; skip: boolean }>();
      for (const g of data?.groups ?? []) {
        for (const r of g.routines) {
          byId.set(r.id, { name: r.name, done: r.isCompleted, skip: r.isSkipped });
        }
      }
      for (const [id, time] of Object.entries(times)) {
        if (time !== hhmm) continue;
        if (alreadyNotifiedToday(id, day)) continue;
        const r = byId.get(id);
        if (!r || r.done || r.skip) {
          markNotified(id, day);
          continue;
        }
        notify("isitdone", `${r.name} — time to check in`);
        markNotified(id, day);
      }
    };

    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [data]);
}
