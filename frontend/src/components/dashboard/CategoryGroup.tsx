import type { DashboardRoutine } from "@/types";
import { RoutineRow } from "@/components/routines/RoutineRow";
import { getCategoryIcon } from "@/lib/category-style";

interface Props {
  category: string;
  routines: DashboardRoutine[];
  onToggle: (routine: DashboardRoutine) => void;
  onDelete: (routine: DashboardRoutine) => void;
  onEdit: (routine: DashboardRoutine) => void;
  onSkip: (routine: DashboardRoutine) => void;
  onUnskip: (routine: DashboardRoutine) => void;
}

export function CategoryGroup({ category, routines, onToggle, onDelete, onEdit, onSkip, onUnskip }: Props) {
  const remaining = routines.filter((r) => !r.isCompleted && !r.isSkipped).length;
  const first = routines[0];
  const CatIcon = getCategoryIcon(first?.icon);
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          {first?.color && (
            <span
              className="flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full"
              style={{ background: first.color + "22", color: first.color }}
              aria-hidden
            >
              <CatIcon size={10} />
            </span>
          )}
          {category}
        </h3>
        {remaining > 0 && (
          <span className="text-xs text-muted">{remaining} left</span>
        )}
      </div>
      <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
        {routines.map((r) => (
          <RoutineRow
            key={r.id}
            routine={r}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            onSkip={onSkip}
            onUnskip={onUnskip}
          />
        ))}
      </div>
    </section>
  );
}
