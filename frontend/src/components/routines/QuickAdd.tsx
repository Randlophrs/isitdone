import { useState } from "react";
import { Plus } from "lucide-react";
import { useCreateRoutine } from "@/features/routines/queries";
import type { Frequency } from "@/types";

const FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly"];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const create = useCreateRoutine();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(
      { name: trimmed, frequency },
      {
        onSuccess: () => {
          setName("");
          setFrequency("daily");
          setOpen(false);
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
    <form onSubmit={submit} className="card space-y-3 p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Routine name"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />
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
      <div className="flex gap-2">
        <button type="submit" className="btn-accent flex-1" disabled={create.isPending}>
          Save
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setOpen(false);
            setName("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
