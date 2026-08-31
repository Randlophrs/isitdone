import { useEffect, useRef, useState } from "react";
import {
  useExportBackup,
  useImportBackup,
  useRestoreSqlite,
  useWipeAll,
} from "@/features/backup/queries";
import { useRoutines } from "@/features/routines/queries";
import { useTheme } from "@/hooks/use-theme";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { Modal } from "@/components/layout/Modal";
import { cx } from "@/lib/utils";
import {
  getReminderTimes,
  remindersEnabled,
  setReminderTime,
  setRemindersEnabled,
} from "@/lib/reminders";
import { Bell, Trash2 } from "lucide-react";

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
  const wipeMut = useWipeAll();
  const fileRef = useRef<HTMLInputElement>(null);
  const sqliteRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [msg, setMsg] = useState<string | null>(null);
  const [wipeOpen, setWipeOpen] = useState(false);

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

  function onWipeConfirm() {
    wipeMut.mutate(undefined, {
      onSuccess: () => {
        setMsg("All data wiped.");
        setWipeOpen(false);
      },
      onError: (err) => setMsg(`Wipe failed: ${String(err)}`),
    });
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

        <div className="border-t border-red-500/30 p-4">
          <p className="flex items-center gap-1.5 font-medium text-red-600">
            <Trash2 size={14} /> Reset all data
          </p>
          <p className="mb-2 text-xs text-muted">
            Permanently deletes every routine, category, and completion. This
            can’t be undone.
          </p>
          <button
            type="button"
            className="btn-accent mt-1 bg-red-500 hover:bg-red-600"
            onClick={() => setWipeOpen(true)}
          >
            Delete everything
          </button>
        </div>
      </section>

      <WipeDialog
        open={wipeOpen}
        pending={wipeMut.isPending}
        onClose={() => setWipeOpen(false)}
        onConfirm={onWipeConfirm}
      />

      <p className="px-1 text-xs text-muted">
        Timezone and week start are set by the local server. Data stays on this
        device.
      </p>
    </div>
  );
}

function WipeDialog({
  open,
  pending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [remaining, setRemaining] = useState(3);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) return;
    setRemaining(3);
    setTyped("");
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const left = 3 - (performance.now() - start) / 1000;
      setRemaining(left > 0 ? left : 0);
      if (left > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;
  const armed = remaining <= 0 && typed === "RESET";

  return (
    <Modal open={open} onClose={onClose} label="Reset all data">
      <div className="card w-full max-w-sm space-y-3 p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
          <Trash2 size={15} /> Delete all data?
        </h2>
        <p className="text-sm text-muted">
          Every routine, category, and completion is gone for good. Export a
          backup first if you might want it back.
        </p>
        <label className="block text-xs text-muted">
          {remaining > 0 ? (
            <>Wait <span className="font-mono text-foreground">{remaining.toFixed(1)}s</span> before this unlocks.</>
          ) : (
            <>Type <span className="font-mono font-medium text-foreground">RESET</span> to confirm</>
          )}
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="RESET"
            disabled={remaining > 0}
            autoFocus={remaining <= 0}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-red-500 disabled:opacity-50"
            aria-label="Type RESET to confirm wipe"
          />
        </label>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-accent flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40"
            disabled={!armed || pending}
            onClick={onConfirm}
          >
            {pending ? "Deleting…" : "Delete everything"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
