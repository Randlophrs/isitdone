import { useEffect, useState } from "react";
import { Tag, Clock, ChevronDown, Repeat, X } from "lucide-react";
import {
  useCreateRoutine,
  useUpdateRoutine,
  useCategories,
  useCreateCategory,
} from "@/features/routines/queries";
import { CategorySelect } from "@/components/routines/CategorySelect";
import type { Frequency, Routine, DashboardRoutine } from "@/types";
import { formatTzNow } from "@/lib/timezones";
import { Modal } from "@/components/layout/Modal";
import { cx } from "@/lib/utils";

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

interface Props {
  open: boolean;
  onClose: () => void;
  routine?: DashboardRoutine | null;
}

export function QuickAdd({ open, onClose, routine = null }: Props) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [weekday, setWeekday] = useState<number>(0);
  const [monthweek, setMonthweek] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [resetTime, setResetTime] = useState<string>("00:00");
  const [nowPreview, setNowPreview] = useState<string>("");

  const create = useCreateRoutine();
  const update = useUpdateRoutine();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const editing = !!routine;

  useEffect(() => {
    const tick = () => setNowPreview(formatTzNow(null));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open || !routine) return;
    setName(routine.name);
    setFrequency(routine.frequency);
    setWeekday(routine.weekday ?? 0);
    setMonthweek(routine.monthweek ?? 1);
    setCategoryId(routine.categoryId ?? "");
    setResetTime(routine.resetTime ?? "00:00");
  }, [open, routine]);

  function reset() {
    setName("");
    setFrequency("daily");
    setWeekday(0);
    setMonthweek(1);
    setCategoryId("");
    setResetTime("00:00");
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const payload: Partial<Routine> = {
      name: trimmed,
      frequency,
      resetTime: resetTime || "00:00",
      weekday: frequency === "weekly" || frequency === "monthly" ? weekday : null,
      monthweek: frequency === "monthly" ? monthweek : null,
    };
    if (categoryId) payload.categoryId = categoryId;
    if (editing && routine) {
      update.mutate({ id: routine.id, data: payload }, { onSuccess: () => reset() });
    } else {
      create.mutate(payload, { onSuccess: () => reset() });
    }
  }

  function handleCreateCategory(name: string) {
    return createCategory.mutateAsync({ name });
  }

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} label={editing ? "Edit routine" : "Add routine"}>
      <form
        onSubmit={submit}
        className="card max-h-[88vh] w-full max-w-md space-y-4 overflow-y-auto p-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{editing ? "Edit routine" : "New routine"}</h2>
          <button
            type="button"
            className="btn-ghost -mr-2 -mt-1 p-1.5"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

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
          <CategorySelect
            categories={categories}
            value={categoryId || null}
            onChange={(id) => setCategoryId(id ?? "")}
            onCreate={handleCreateCategory}
          />
        </Section>

        {/* Repeat */}
        <Section icon={<Repeat size={13} />} label="Repeat">
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFrequency(f)}
                className={cx(
                  "flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize transition-colors",
                  frequency === f
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted",
                )}
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
                  onChange={(e) => setWeekday(Number(e.target.value))}
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
                    onChange={(e) => setMonthweek(Number(e.target.value))}
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
                    onChange={(e) => setWeekday(Number(e.target.value))}
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
            disabled={create.isPending || update.isPending}
          >
            {editing ? "Save" : "Add"}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
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
