import { useEffect, useState } from "react";
import { Plus, Tag, Clock, ChevronDown, Repeat } from "lucide-react";
import {
  useCreateRoutine,
  useCategories,
  useCreateCategory,
} from "@/features/routines/queries";
import type { Category, Frequency, Routine } from "@/types";
import { formatTzNow } from "@/lib/timezones";

const FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly"];
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
// week-of-month options (1=first … 5=last)
const MONTH_WEEKS = [1, 2, 3, 4, 5];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [weekday, setWeekday] = useState<number>(0);
  const [monthweek, setMonthweek] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [resetTime, setResetTime] = useState<string>("00:00");
  const [nowPreview, setNowPreview] = useState<string>("");

  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#6366f1");

  const create = useCreateRoutine();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();

  useEffect(() => {
    const tick = () => setNowPreview(formatTzNow(null));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  function reset() {
    setName("");
    setFrequency("daily");
    setWeekday(0);
    setMonthweek(1);
    setCategoryId("");
    setResetTime("00:00");
    setCatOpen(false);
    setCatName("");
    setCatColor("#6366f1");
    setOpen(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const payload: Partial<Routine> = {
      name: trimmed,
      frequency,
      resetTime: resetTime || "00:00",
      weekday: frequency === "weekly" ? weekday : null,
      monthweek: frequency === "monthly" ? monthweek : null,
    };
    if (categoryId) payload.categoryId = categoryId;
    create.mutate(payload, { onSuccess: () => reset() });
  }

  function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = catName.trim();
    if (!trimmed) return;
    createCategory.mutate(
      { name: trimmed, color: catColor },
      {
        onSuccess: (cat: Category) => {
          setCategoryId(cat.id);
          setCatOpen(false);
          setCatName("");
        },
      },
    );
  }

  if (!open) {
    return (
      <button className="btn-accent w-full" onClick={() => setOpen(true)}>
        <Plus size={18} /> Add routine
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-3">
      {/* Name */}
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Routine name"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {/* Category */}
      <Section icon={<Tag size={13} />} label="Category">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm outline-none focus:border-accent"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setCatOpen((v) => !v)}
          >
            {catOpen ? "Cancel" : "+ New"}
          </button>
        </div>

        {catOpen && (
          <form
            onSubmit={submitCategory}
            className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-bg p-2"
          >
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Category name"
              className="flex-1 rounded-md border border-border bg-bg px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
            <input
              type="color"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              className="h-8 w-8 flex-none cursor-pointer rounded-md border border-border bg-bg"
              title="Category color"
              aria-label="Category color"
            />
            <button type="submit" className="btn-accent flex-none">
              Add
            </button>
          </form>
        )}
      </Section>

      {/* Repeat */}
      <Section icon={<Repeat size={13} />} label="Repeat">
        <div className="flex gap-2">
          {FREQUENCIES.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFrequency(f)}
              className={
                "flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize transition-colors " +
                (frequency === f
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted")
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Contextual schedule */}
        {frequency === "weekly" && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-muted">Reset every</p>
            <div className="relative">
              <select
                value={weekday}
                onChange={(e) =>
                  setWeekday(Number(e.target.value))
                }
                className="w-full appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm outline-none focus:border-accent"
              >
                {WEEKDAYS.map((w, i) => (
                  <option key={w} value={i}>
                    {w}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>
        )}

        {frequency === "monthly" && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={monthweek}
                  onChange={(e) =>
                    setMonthweek(
                      Number(e.target.value),
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm outline-none focus:border-accent"
                >
                  {MONTH_WEEKS.map((w) => (
                    <option key={w} value={w}>
                      {w === 5 ? "Last week" : `Week ${w}`}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
              <span className="text-xs text-muted">on</span>
              <div className="relative flex-1">
                <select
                  value={weekday}
                  onChange={(e) =>
                    setWeekday(
                      Number(e.target.value),
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm outline-none focus:border-accent"
                >
                  {WEEKDAYS.map((w, i) => (
                    <option key={w} value={i}>
                      {w}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Reset time */}
      <Section icon={<Clock size={13} />} label="Reset time">
        <div className="relative max-w-[160px]">
          <Clock
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="time"
            value={resetTime}
            onChange={(e) => setResetTime(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
            aria-label="Reset time"
          />
        </div>
        <div className="mt-1 flex items-center justify-between px-1 text-xs text-muted">
          <span>now</span>
          <span className="font-mono text-accent">{nowPreview}</span>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="btn-accent flex-1"
          disabled={create.isPending}
        >
          Save
        </button>
        <button type="button" className="btn-ghost" onClick={reset}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
