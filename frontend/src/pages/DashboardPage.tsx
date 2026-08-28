import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDashboard } from "@/features/routines/queries";
import { useCompleteRoutine, useUncompleteRoutine, useDeleteRoutine, useSkipRoutine, useUnskipRoutine } from "@/features/routines/queries";
import { useToast } from "@/hooks/use-toast";
import { ToastHost } from "@/components/layout/Toast";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { CategoryGroup } from "@/components/dashboard/CategoryGroup";
import { QuickAdd } from "@/components/routines/QuickAdd";
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
  const { toasts, show, dismiss } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<DashboardRoutine | null>(null);

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

  const groups = useMemo(() => {
    if (!data) return [];
    return data.groups
      .map((g) => ({
        ...g,
        routines: g.routines.filter((r) =>
          filter === "all"
            ? true
            : filter === "pending"
              ? !r.isCompleted
              : r.isCompleted,
        ),
      }))
      .filter((g) => g.routines.length > 0);
  }, [data, filter]);

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
              />
            ))}
          </div>

          {data.progress.completed === data.progress.total &&
            data.progress.total > 0 && (
              <div className="card p-6 text-center">
                <p className="text-lg font-medium">All done 🎉</p>
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
    </div>
  );
}
