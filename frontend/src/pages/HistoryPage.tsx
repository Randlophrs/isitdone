import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useHistoryMonth, useHistory } from "@/features/history/queries";
import { Modal } from "@/components/layout/Modal";
import { cx } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

type Completion = { periodKey: string; routineName: string; completedAt: string };

type View = "month" | "week" | "year";

export function HistoryPage() {
  const now = new Date();
  const [view, setView] = useState<View>("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: monthData, isLoading, isError } = useHistoryMonth(year, month);
  const { data: allData } = useHistory();

  const completions = (monthData as { completions?: Completion[] } | undefined)
    ?.completions;

  const byDay = useMemo(() => {
    const map = new Map<number, { count: number; names: string[] }>();
    for (const c of completions ?? []) {
      const d = Number(c.periodKey.slice(-2));
      const cur = map.get(d) ?? { count: 0, names: [] };
      cur.count += 1;
      cur.names.push(c.routineName);
      map.set(d, cur);
    }
    return map;
  }, [completions]);

  const dayDetail = useMemo(() => {
    if (selected === null) return null;
    const pad = String(selected).padStart(2, "0");
    const items = (completions ?? [])
      .filter((c) => c.periodKey.endsWith(`-${pad}`))
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .map((c) => ({
        name: c.routineName,
        time: new Date(c.completedAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    return { day: selected, items };
  }, [selected, completions]);

  // Week range for the week view.
  const weekRange = useMemo(() => {
    const base = new Date(year, month - 1, 1);
    const cursor = new Date(base);
    cursor.setDate(1 - ((base.getDay() + 6) % 7) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + i);
      return d;
    });
  }, [year, month, weekOffset]);

  const weekByDay = useMemo(() => {
    const map = new Map<string, { count: number; names: string[] }>();
    const start = weekRange[0];
    const end = weekRange[6];
    for (const c of completions ?? []) {
      const d = new Date(c.periodKey);
      if (d < start || d > end) continue;
      const key = c.periodKey;
      const cur = map.get(key) ?? { count: 0, names: [] };
      cur.count += 1;
      cur.names.push(c.routineName);
      map.set(key, cur);
    }
    return map;
  }, [completions, weekRange]);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
    setSelected(null);
  }

  function shiftWeek(delta: number) {
    setWeekOffset((w) => w + delta);
    setSelected(null);
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array((firstDay + 6) % 7).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <div className="flex gap-1 rounded-lg bg-surface p-1 text-xs">
          {(["month", "week", "year"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cx(
                "rounded-md px-2.5 py-1.5 capitalize transition-colors",
                view === v ? "bg-accent/10 text-accent" : "text-muted",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {view === "year" ? (
        <YearHeatmap
          data={allData}
          year={selectedYear}
          onYearChange={setSelectedYear}
        />
      ) : isError ? (
        <div className="card p-6 text-center text-sm text-muted">Could not load history.</div>
      ) : isLoading ? (
        <div className="card p-6 text-center text-sm text-muted">Loading…</div>
      ) : view === "month" ? (
        <MonthView
          year={year}
          month={month}
          cells={cells}
          byDay={byDay}
          selected={selected}
          onShift={shiftMonth}
          onSelect={setSelected}
        />
      ) : (
        <WeekView
          weekRange={weekRange}
          weekByDay={weekByDay}
          selected={selected}
          onShift={shiftWeek}
          onSelect={(d) => setSelected(d)}
        />
      )}

      <Modal
        open={dayDetail !== null}
        onClose={() => setSelected(null)}
        label={`Routines on ${MONTHS[month - 1]} ${dayDetail?.day ?? ""}`}
      >
        <div className="card w-full max-w-md overflow-hidden [animation:sheet-up_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">
                {MONTHS[month - 1]} {dayDetail?.day}
              </h2>
              <p className="text-xs text-muted">
                {dayDetail?.items.length} {dayDetail?.items.length === 1 ? "routine" : "routines"} completed
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
            {dayDetail?.items.map((it, idx) => (
              <li key={idx} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Check size={15} />
                </span>
                <span className="flex-1 text-sm">{it.name}</span>
                <span className="rounded-md bg-bg px-2 py-0.5 font-mono text-xs text-muted">
                  {it.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}

function MonthView({
  year, month, cells, byDay, selected, onShift, onSelect,
}: {
  year: number; month: number; cells: (number | null)[];
  byDay: Map<number, { count: number; names: string[] }>;
  selected: number | null;
  onShift: (d: number) => void; onSelect: (d: number | null) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <button className="btn-ghost px-2" onClick={() => onShift(-1)} aria-label="Previous month">‹</button>
        <span className="w-32 text-center text-sm font-medium">
          {MONTHS[month - 1]} {year}
        </span>
        <button className="btn-ghost px-2" onClick={() => onShift(1)} aria-label="Next month">›</button>
      </div>

      <div className="card grid grid-cols-7 gap-1 p-3 text-center text-xs font-medium text-muted">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="card grid grid-cols-7 gap-1.5 p-3">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const info = byDay.get(day);
          const isSelected = selected === day;
          return (
            <button
              key={day}
              type="button"
              disabled={!info}
              onClick={() => onSelect(isSelected ? null : day)}
              aria-pressed={isSelected}
              className={cx(
                "group flex aspect-square flex-col items-center justify-center rounded-xl border text-xs transition-all",
                !info && "border-border/60 text-muted/70 cursor-default",
                info && !isSelected && "border-accent/30 bg-accent/5 text-accent hover:border-accent/60 hover:bg-accent/10",
                isSelected && "border-accent bg-accent text-white shadow-md",
              )}
            >
              <span>{day}</span>
              {info && <span className="font-semibold">{info.count}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function WeekView({
  weekRange, weekByDay, selected, onShift, onSelect,
}: {
  weekRange: Date[];
  weekByDay: Map<string, { count: number; names: string[] }>;
  selected: number | null;
  onShift: (d: number) => void;
  onSelect: (d: number | null) => void;
}) {
  const selectedKey = selected !== null
    ? `${weekRange[selected].getFullYear()}-${String(weekRange[selected].getMonth() + 1).padStart(2, "0")}-${String(weekRange[selected].getDate()).padStart(2, "0")}`
    : null;
  return (
    <>
      <div className="flex items-center justify-between">
        <button className="btn-ghost px-2" onClick={() => onShift(-1)} aria-label="Previous week">‹</button>
        <span className="text-sm font-medium">
          {weekRange[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {weekRange[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        <button className="btn-ghost px-2" onClick={() => onShift(1)} aria-label="Next week">›</button>
      </div>

      <div className="card grid grid-cols-7 gap-1.5 p-3">
        {weekRange.map((d, i) => {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const info = weekByDay.get(key);
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!info}
              onClick={() => onSelect(isSelected ? null : i)}
              aria-pressed={isSelected}
              className={cx(
                "group flex aspect-square flex-col items-center justify-center rounded-xl border text-xs transition-all",
                !info && "border-border/60 text-muted/70 cursor-default",
                info && !isSelected && "border-accent/30 bg-accent/5 text-accent hover:border-accent/60 hover:bg-accent/10",
                isSelected && "border-accent bg-accent text-white shadow-md",
              )}
            >
              <span className="text-[10px] uppercase text-muted">{WEEKDAYS[i]}</span>
              <span>{d.getDate()}</span>
              {info && <span className="font-semibold">{info.count}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function YearHeatmap({
  data, year, onYearChange,
}: {
  data: { periods?: { periodKey: string; completions: { routineName: string }[] }[] } | undefined;
  year: number;
  onYearChange: (y: number) => void;
}) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of data?.periods ?? []) {
      // only daily period keys (YYYY-MM-DD) contribute to the heatmap
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.periodKey)) continue;
      if (!p.periodKey.startsWith(`${year}-`)) continue;
      map.set(p.periodKey, (map.get(p.periodKey) ?? 0) + p.completions.length);
    }
    return map;
  }, [data, year]);

  const max = Math.max(1, ...counts.values());

  const weeks = useMemo(() => {
    const first = new Date(year, 0, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    const end = new Date(year, 11, 31);
    const out: (string | null)[][] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const week: (string | null)[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(cursor);
        week.push(d.getFullYear() === year ? d.toISOString().slice(0, 10) : null);
        cursor.setDate(cursor.getDate() + 1);
      }
      out.push(week);
    }
    return out;
  }, [year]);

  const level = (n: number) => {
    if (n === 0) return "bg-border/40";
    const r = n / max;
    if (r > 0.75) return "bg-accent";
    if (r > 0.5) return "bg-accent/80";
    if (r > 0.25) return "bg-accent/60";
    return "bg-accent/40";
  };

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[-1, 1].map((d) => (
            <button
              key={d}
              className="btn-ghost px-2 py-1 text-xs"
              onClick={() => onYearChange(year + d)}
            >
              {d < 0 ? "‹" : "›"} {Math.abs(year + d)}
            </button>
          ))}
        </div>
        <span className="text-sm font-medium">{year}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={day}
                    title={`${day}: ${counts.get(day) ?? 0} done`}
                    className={cx("h-3 w-3 rounded-sm", level(counts.get(day) ?? 0))}
                  />
                ) : (
                  <div key={`e${di}`} className="h-3 w-3" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 text-[10px] text-muted">
        <span>Less</span>
        {["bg-border/40", "bg-accent/40", "bg-accent/60", "bg-accent/80", "bg-accent"].map((c) => (
          <div key={c} className={cx("h-3 w-3 rounded-sm", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
