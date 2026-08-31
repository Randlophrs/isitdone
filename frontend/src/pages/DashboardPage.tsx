import { useEffect, useMemo, useState } from "react";
import { Plus, CheckCheck, Search } from "lucide-react";
import { useDashboard } from "@/features/routines/queries";
import { useCompleteRoutine, useUncompleteRoutine, useDeleteRoutine, useSkipRoutine, useUnskipRoutine, useReorderRoutines } from "@/features/routines/queries";
import { useToast } from "@/hooks/use-toast";
import { ToastHost } from "@/components/layout/Toast";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { CategoryGroup } from "@/components/dashboard/CategoryGroup";
import { QuickAdd } from "@/components/routines/QuickAdd";
import { Modal } from "@/components/layout/Modal";
import type { DashboardRoutine } from "@/types";
import { cx } from "@/lib/utils";

type Filter = "all" | "pending" | "completed";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function dateLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const complete = useCompleteRoutine();
  const uncomplete = useUncompleteRoutine();
  const deleteRoutine = useDeleteRoutine();
  const skip = useSkipRoutine();
  const unskip = useUnskipRoutine();
  const reorder = useReorderRoutines();
  const { toasts, show, dismiss } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<DashboardRoutine | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const toggle = (routine: DashboardRoutine) => {
    if (routine.isCompleted) {
      uncomplete.mutate(routine.id, {
        onSuccess: () =>
          show(`${routine.name} undone`, {
            actionLabel: "Redo",
            onAction: () => complete.mutate(routine.id),
          }),
      });
    } else if (routine.isSkipped) {
      unskip.mutate(routine.id, {
        onSuccess: () => show(`${routine.name} unskipped`),
      });
    } else {
      complete.mutate(routine.id, {
        onSuccess: () =>
          show(`${routine.name} done`, {
            actionLabel: "Undo",
            onAction: () => uncomplete.mutate(routine.id),
          }),
      });
    }
  };

  const handleSkip = (routine: DashboardRoutine) => {
    if (routine.isCompleted) {
      uncomplete.mutate(routine.id, { onSuccess: () => skip.mutate(routine.id) });
    } else {
      skip.mutate(routine.id, { onSuccess: () => show(`${routine.name} skipped`) });
    }
  };

  const handleUnskip = (routine: DashboardRoutine) => {
    unskip.mutate(routine.id, { onSuccess: () => show(`${routine.name} unskipped`) });
  };

  const handleDelete = (routine: DashboardRoutine) => {
    deleteRoutine.mutate(routine.id, {
      onSuccess: () => show(`${routine.name} deleted`),
    });
  };

  const handleEdit = (routine: DashboardRoutine) => setEditing(routine);

  const handleReorder = (orderedIds: string[]) => {
    reorder.mutate(orderedIds);
  };

  const pendingAll = useMemo(
    () => data?.groups.flatMap((g) => g.routines).filter((r) => !r.isCompleted && !r.isSkipped) ?? [],
    [data],
  );

  const completeAll = () => {
    setConfirmAll(false);
    pendingAll.forEach((r) => complete.mutate(r.id));
    show(`${pendingAll.length} routines done`);
  };

  const groups = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.groups
      .map((g) => ({
        ...g,
        routines: g.routines.filter((r) => {
          if (filter === "pending" && r.isCompleted) return false;
          if (filter === "completed" && !r.isCompleted) return false;
          if (q && !`${r.name} ${r.description ?? ""}`.toLowerCase().includes(q))
            return false;
          return true;
        }),
      }))
      .filter((g) => g.routines.length > 0);
  }, [data, filter, query]);

  if (isError) {
    return (
      <div className="card p-6 text-center">
        <p className="font-medium">Backend not running</p>
        <p className="mt-1 text-sm text-muted">
          Start the local server, then reload this page.
        </p>
        <ConnectionStatus />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{greeting()} 👋</h1>
          <p className="text-sm text-muted">{dateLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionStatus />
          {pendingAll.length > 0 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setConfirmAll(true)}
            >
              <CheckCheck size={18} /> Complete all
            </button>
          )}
          <button
            type="button"
            className="btn-accent"
            onClick={() => setAdding(true)}
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </header>

      {isLoading || !data ? (
        <div className="card p-6 text-center text-sm text-muted">Loading…</div>
      ) : (
        <>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search routines"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
              aria-label="Search routines"
            />
          </div>

          <ProgressSummary
            completed={data.progress.completed}
            total={data.progress.total}
            percentage={data.progress.percentage}
          />

          {data.progress.total === 0 ? (
            <div className="card p-6 text-center">
              <p className="font-medium">No routines yet</p>
              <p className="mt-1 text-sm text-muted">
                Add the first activity you want to keep track of.
              </p>
            </div>
          ) : (
            <div className="flex gap-1 rounded-lg bg-surface p-1 text-xs">
              {(["all", "pending", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cx(
                    "flex-1 rounded-md py-1.5 capitalize transition-colors",
                    filter === f
                      ? "bg-accent/10 text-accent"
                      : "text-muted",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-5">
            {groups.map((g) => (
              <CategoryGroup
                key={g.category}
                category={g.category}
                routines={g.routines}
                onToggle={toggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onSkip={handleSkip}
                onUnskip={handleUnskip}
                onReorder={handleReorder}
              />
            ))}
          </div>

          {data.progress.completed === data.progress.total &&
            data.progress.total > 0 && (
              <div className="card p-6 text-center">
                <p className="text-lg font-medium">All done</p>
                <p className="mt-1 text-sm text-muted">
                  Enjoy the rest of your day.
                </p>
              </div>
            )}
        </>
      )}

      <ToastHost toasts={toasts} onDismiss={dismiss} />

      <QuickAdd open={adding} onClose={() => setAdding(false)} />
      <QuickAdd open={editing !== null} routine={editing} onClose={() => setEditing(null)} />

      <CompleteAllDialog
        open={confirmAll}
        count={pendingAll.length}
        onClose={() => setConfirmAll(false)}
        onConfirm={completeAll}
      />
    </div>
  );
}

function CompleteAllDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    if (!open) return;
    setRemaining(3);
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
  const ready = remaining <= 0;

  return (
    <Modal open={open} onClose={onClose} label="Complete all routines">
      <div className="card w-full max-w-sm space-y-3 p-4">
        <h2 className="text-sm font-semibold">Complete {count} routines?</h2>
        <p className="text-sm text-muted">
          This marks every pending routine as done. You can undo each one after.
        </p>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-accent flex-1"
            disabled={!ready}
            onClick={onConfirm}
          >
            {ready ? "Complete all" : `Wait ${remaining.toFixed(1)}s`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
