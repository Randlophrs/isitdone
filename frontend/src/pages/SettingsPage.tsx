import { useEffect, useRef, useState } from "react";
import {
  useExportBackup,
  useImportBackup,
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
import { Bell, Trash2, Upload } from "lucide-react";

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
  const wipeMut = useWipeAll();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"merge" | "replace" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [wipeOpen, setWipeOpen] = useState(false);

  function onImport() {
    if (!pickedFile || !mode) return;
    importMut.mutate(
      { file: pickedFile, mode },
      {
        onSuccess: (r) => {
          setMsg(`Imported ${r.imported.routines} routines (${mode}).`);
          setImportOpen(false);
          setPickedFile(null);
        },
        onError: (err) => {
          setMsg(`Import failed: ${String(err)}`);
        },
      },
    );
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
            Restore from a JSON file. Pick the mode carefully — Replace clears
            current data first.
          </p>
          <button
            className="btn-accent"
            onClick={() => {
              setMode(null);
              setPickedFile(null);
              setImportOpen(true);
            }}
          >
            Import backup
          </button>
        </div>

        <ImportDialog
          open={importOpen}
          fileRef={fileRef as React.RefObject<HTMLInputElement>}
          mode={mode}
          picked={pickedFile}
          pending={importMut.isPending}
          onClose={() => setImportOpen(false)}
          onPickMode={setMode}
          onPickFile={(f) => setPickedFile(f)}
          onSubmit={onImport}
        />

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

function ImportDialog({
  open,
  fileRef,
  mode,
  picked,
  pending,
  onClose,
  onPickMode,
  onPickFile,
  onSubmit,
}: {
  open: boolean;
  fileRef: React.RefObject<HTMLInputElement>;
  mode: "merge" | "replace" | null;
  picked: File | null;
  pending: boolean;
  onClose: () => void;
  onPickMode: (m: "merge" | "replace") => void;
  onPickFile: (f: File | null) => void;
  onSubmit: () => void;
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} label="Import backup">
      <div className="card w-full max-w-sm space-y-3 p-4">
        <h2 className="text-sm font-semibold">Import backup</h2>
        <p className="text-sm text-muted">
          Pick a JSON file, then a mode.{" "}
          <span className="font-medium text-red-600">Replace</span> clears your
          current data first.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="btn-ghost flex w-full items-center justify-center gap-1.5 border border-border"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={14} />
          {picked ? picked.name : "Choose JSON file"}
        </button>
        {picked && (
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => onPickMode("merge")}
              className={cx(
                "flex-1 rounded-lg border px-2 py-2 capitalize transition-colors",
                mode === "merge"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted",
              )}
            >
              Merge
            </button>
            <button
              type="button"
              onClick={() => onPickMode("replace")}
              className={cx(
                "flex-1 rounded-lg border px-2 py-2 capitalize transition-colors",
                mode === "replace"
                  ? "border-red-500 bg-red-500/10 text-red-600"
                  : "border-border text-muted",
              )}
            >
              Replace
            </button>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={cx(
              "btn-accent flex-1 disabled:opacity-40",
              mode === "replace" && "bg-red-500 hover:bg-red-600",
            )}
            disabled={!mode || !picked || pending}
            onClick={onSubmit}
          >
            {pending ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </Modal>
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
