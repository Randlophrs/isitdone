import type { DashboardRoutine } from "@/types";
import { RoutineRow } from "@/components/routines/RoutineRow";

interface Props {
  category: string;
  routines: DashboardRoutine[];
  onToggle: (routine: DashboardRoutine) => void;
  onDelete: (routine: DashboardRoutine) => void;
}

export function CategoryGroup({ category, routines, onToggle, onDelete }: Props) {
  const remaining = routines.filter((r) => !r.isCompleted).length;
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {category}
        </h3>
        {remaining > 0 && (
          <span className="text-xs text-muted">{remaining} left</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {routines.map((r) => (
          <RoutineRow
            key={r.id}
            routine={r}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
