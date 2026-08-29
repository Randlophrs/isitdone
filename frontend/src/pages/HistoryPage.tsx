import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useHistory } from "@/features/history/queries";
import { Modal } from "@/components/layout/Modal";
import { cx } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type HistoryCompletion = { routineName: string; completedAt: string };
type HistoryPeriod = { periodKey: string; completions: HistoryCompletion[] };

export function HistoryPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data } = useHistory();

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <div className="flex gap-1">
          {[-1, 1].map((d) => (
            <button
              key={d}
              className="btn-ghost px-3 py-1.5 text-sm"
              onClick={() => setYear((y) => y + d)}
              aria-label={d < 0 ? "Previous year" : "Next year"}
            >
              {d < 0 ? "‹" : "›"} {year + d}
            </button>
          ))}
        </div>
      </header>

      <YearHeatmap data={data} year={year} />
    </div>
  );
}

function YearHeatmap({
  data, year,
}: {
  data: { periods?: HistoryPeriod[] } | undefined;
  year: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of data?.periods ?? []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.periodKey)) continue;
      if (!p.periodKey.startsWith(`${year}-`)) continue;
      map.set(p.periodKey, (map.get(p.periodKey) ?? 0) + p.completions.length);
    }
    return map;
  }, [data, year]);

  const byDate = useMemo(() => {
    const map = new Map<string, HistoryCompletion[]>();
    for (const p of data?.periods ?? []) {
      if (!p.periodKey.startsWith(`${year}-`)) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.periodKey)) continue;
      map.set(
        p.periodKey,
        [...(map.get(p.periodKey) ?? []), ...p.completions].sort((a, b) =>
          b.completedAt.localeCompare(a.completedAt),
        ),
      );
    }
    return map;
  }, [data, year]);

  const max = Math.max(1, ...counts.values());

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const first = new Date(year, m, 1);
      const lead = (first.getDay() + 6) % 7;
      const days = new Date(year, m + 1, 0).getDate();
      const cells: (string | null)[] = [
        ...Array(lead).fill(null),
        ...Array.from({ length: days }, (_, i) =>
          `${year}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
        ),
      ];
      return { m, cells };
    });
  }, [year]);

  const level = (n: number) => levelColor(n, max);

  const detail = selected ? byDate.get(selected) ?? [] : [];

  return (
    <>
      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{year}</span>
          <span className="text-xs text-muted">Tap a day to see what you finished</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {months.map(({ m, cells }) => (
            <div key={m}>
              <div className="mb-1.5 text-[11px] font-medium text-muted">
                {MONTHS[m].slice(0, 3)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day) =>
                  day ? (
                    <button
                      key={day}
                      type="button"
                      disabled={!counts.get(day)}
                      onClick={() => setSelected(day)}
                      title={`${day}: ${counts.get(day) ?? 0} done`}
                      aria-label={`${day}: ${counts.get(day) ?? 0} completed`}
                      className={cx(
                        "aspect-square w-full rounded-sm transition-transform",
                        counts.get(day)
                          ? "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          : "cursor-default",
                        level(counts.get(day) ?? 0),
                      )}
                    />
                  ) : (
                    <div key={`e${day}`} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1 text-[10px] text-muted">
          <span>Less</span>
          {["bg-border/40", "bg-accent/40", "bg-accent/60", "bg-accent/80", "bg-accent"].map((c) => (
            <div key={c} className={cx("h-3 w-3 rounded-sm", c)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        label={selected ? `Routines on ${selected}` : ""}
      >
        <div className="card w-full max-w-md overflow-hidden [animation:sheet-up_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">{selected}</h2>
              <p className="text-xs text-muted">
                {detail.length} {detail.length === 1 ? "routine" : "routines"} completed
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost -mr-2 -mt-1 p-1.5"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {detail.map((it, idx) => (
              <li key={idx} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Check size={15} />
                </span>
                <span className="flex-1 text-sm">{it.routineName}</span>
                <span className="rounded-md bg-bg px-2 py-0.5 font-mono text-xs text-muted">
                  {new Date(it.completedAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}

function levelColor(n: number, max: number): string {
  if (n === 0) return "bg-border/40";
  const r = n / max;
  if (r > 0.75) return "bg-accent";
  if (r > 0.5) return "bg-accent/80";
  if (r > 0.25) return "bg-accent/60";
  return "bg-accent/40";
}
