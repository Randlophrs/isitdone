import { useRef, useState, useEffect } from "react";
import {
  useExportBackup,
  useImportBackup,
  useRestoreSqlite,
} from "@/features/backup/queries";
import { useRoutines } from "@/features/routines/queries";
import { useTheme } from "@/hooks/use-theme";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { cx } from "@/lib/utils";
import {
  getReminderTimes,
  remindersEnabled,
  setReminderTime,
  setRemindersEnabled,
} from "@/lib/reminders";
import { Bell } from "lucide-react";

export function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { data: routines = [] } = useRoutines();
  const [enabled, setEnabled] = useState(remindersEnabled());
  const [times, setTimes] = useState<Record<string, string>>(getReminderTimes());

  useEffect(() => {
    setTimes(getReminderTimes());
  }, [routines]);

  async function toggleReminders(next: boolean) {
    if (next && "Notification" in window && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    setRemindersEnabled(next);
    setEnabled(next);
  }

  function onTime(routineId: string, time: string | null) {
    setReminderTime(routineId, time);
    setTimes(getReminderTimes());
  }

  const exportMut = useExportBackup();
  const importMut = useImportBackup();
  const restoreMut = useRestoreSqlite();
  const fileRef = useRef<HTMLInputElement>(null);
  const sqliteRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [msg, setMsg] = useState<string | null>(null);

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importMut.mutate(
      { file, mode },
      {
        onSuccess: (r) =>
          setMsg(`Imported ${r.imported.routines} routines (${mode}).`),
        onError: (err) => setMsg(`Import failed: ${String(err)}`),
      },
    );
    e.target.value = "";
  }

  function onRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    restoreMut.mutate(file, {
      onSuccess: () => setMsg("Database restored."),
      onError: (err) => setMsg(`Restore failed: ${String(err)}`),
    });
    e.target.value = "";
  }

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <ConnectionStatus />

      {msg && (
        <div className="card p-3 text-sm text-muted">{msg}</div>
      )}

      <section className="card divide-y divide-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 font-medium">
                <Bell size={14} /> Reminders
              </p>
              <p className="text-xs text-muted">
                Browser notification at each routine’s time. Pending only.
              </p>
            </div>
            <button
              className={cx("btn-accent", !enabled && "opacity-60")}
              onClick={() => toggleReminders(!enabled)}
            >
              {enabled ? "On" : "Off"}
            </button>
          </div>

          {enabled && (
            <div className="mt-3 space-y-2">
              {routines.length === 0 && (
                <p className="text-xs text-muted">No routines yet.</p>
              )}
              {routines.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{r.name}</span>
                  <input
                    type="time"
                    value={times[r.id] ?? ""}
                    onChange={(e) =>
                      onTime(r.id, e.target.value || null)
                    }
                    className="rounded-lg border border-border bg-bg px-2 py-1 text-sm outline-none focus:border-accent"
                    aria-label={`Reminder time for ${r.name}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-xs text-muted">Light or dark.</p>
          </div>
          <button className="btn-accent" onClick={toggle}>
            {theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>

        <div className="p-4">
          <p className="font-medium">Export backup</p>
          <p className="mb-2 text-xs text-muted">
            Download your data as a JSON file.
          </p>
          <button
            className="btn-accent"
            onClick={() => exportMut.mutate()}
            disabled={exportMut.isPending}
          >
            Download JSON
          </button>
        </div>

        <div className="p-4">
          <p className="font-medium">Import backup</p>
          <p className="mb-2 text-xs text-muted">
            Merge adds to current data. Replace clears first.
          </p>
          <div className="mb-2 flex gap-2 text-xs">
            {(["merge", "replace"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cx(
                  "flex-1 rounded-lg border px-2 py-1.5 capitalize transition-colors",
                  mode === m
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImport}
          />
          <button
            className="btn-accent"
            onClick={() => fileRef.current?.click()}
            disabled={importMut.isPending}
          >
            Choose file
          </button>
        </div>

        <div className="p-4">
          <p className="font-medium">Database backup</p>
          <p className="mb-2 text-xs text-muted">
            Copy the SQLite file, or restore from one.
          </p>
          <button
            className="btn-ghost border border-border"
            onClick={() => alert("Use the backend API to copy the .sqlite file from your data directory.")}
          >
            Copy database
          </button>
          <input
            ref={sqliteRef}
            type="file"
            accept=".sqlite"
            className="hidden"
            onChange={onRestore}
          />
          <button
            className="btn-ghost border border-border ml-2"
            onClick={() => sqliteRef.current?.click()}
            disabled={restoreMut.isPending}
          >
            Restore database
          </button>
        </div>
      </section>

      <p className="px-1 text-xs text-muted">
        Timezone and week start are set by the local server. Data stays on this
        device.
      </p>
    </div>
  );
}
