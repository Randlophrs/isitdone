import { useEffect, useMemo, useRef, useState } from "react";
import { Tag, Check, Plus, X } from "lucide-react";
import type { Category } from "@/types";
import { useDeleteCategory, useCategoryUsage } from "@/features/routines/queries";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  getCategoryIcon,
} from "@/lib/category-style";
import { cx } from "@/lib/utils";

interface Props {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
  onCreate: (data: { name: string; color?: string; icon?: string }) => Promise<Category>;
}

export function CategorySelect({ categories, value, onChange, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [color, setColor] = useState<string>(CATEGORY_COLORS[5]);
  const [icon, setIcon] = useState<string>(CATEGORY_ICONS[0].name);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deleteCategory = useDeleteCategory();
  const usage = useCategoryUsage(pendingDelete?.id ?? null);

  const selected = useMemo(
    () => categories.find((c) => c.id === value) ?? null,
    [categories, value],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const exactExists = categories.some(
    (c) =>
      c.name.toLowerCase() === query.trim().toLowerCase() && query.trim() !== "",
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPendingDelete(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function openMenu() {
    setOpen(true);
    setQuery("");
    setPendingDelete(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function pick(cat: Category) {
    onChange(cat.id);
    setOpen(false);
  }

  async function createAndPick() {
    const name = query.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const cat = await onCreate({ name, color, icon });
      onChange(cat.id);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  function askDelete(cat: Category) {
    setPendingDelete(cat);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    if (value === id) onChange(null);
    await deleteCategory.mutateAsync(id);
    setPendingDelete(null);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={openMenu}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {selected ? (
          <>
            <CategoryBadge color={selected.color} icon={selected.icon} />
            <span className="truncate">{selected.name}</span>
          </>
        ) : (
          <>
            <Tag size={14} className="text-muted" />
            <span className="text-muted">Uncategorized</span>
          </>
        )}
        <ChevronDownSmall className="ml-auto text-muted" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {pendingDelete ? (
            <ConfirmDelete
              category={pendingDelete}
              count={usage.data?.count ?? 0}
              busy={deleteCategory.isPending}
              onCancel={() => setPendingDelete(null)}
              onConfirm={confirmDelete}
            />
          ) : (
            <>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !exactExists && query.trim()) {
                    e.preventDefault();
                    createAndPick();
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Search or type a new category…"
                className="w-full border-b border-border bg-bg px-3 py-2 text-sm outline-none"
              />
              <ul className="max-h-48 overflow-y-auto py-1">
                {selected && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(null);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-muted hover:bg-bg"
                    >
                      <Tag size={14} />
                      Uncategorized
                    </button>
                  </li>
                )}
                {matches.map((c) => (
                  <li key={c.id}>
                    <div className="group flex items-center gap-2 px-3 py-1.5 hover:bg-bg">
                      <button
                        type="button"
                        onClick={() => pick(c)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
                      >
                        <CategoryBadge color={c.color} icon={c.icon} />
                        <span className="truncate">{c.name}</span>
                        {c.id === value && (
                          <Check size={14} className="ml-auto text-accent" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(c)}
                        className="flex-none rounded p-0.5 text-muted opacity-0 transition-opacity hover:bg-border hover:text-red-500 group-hover:opacity-100"
                        title={`Delete ${c.name}`}
                        aria-label={`Delete ${c.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                ))}
                {query.trim() && !exactExists && (
                  <li className="space-y-2 border-t border-border p-3">
                    <div className="flex items-center gap-2">
                      <CategoryBadge color={color} icon={icon} />
                      <span className="text-sm">
                        Create “{query.trim()}”
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORY_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          aria-label={`Color ${c}`}
                          className={cx(
                            "h-5 w-5 rounded-full ring-2 ring-offset-1 ring-offset-surface transition",
                            color === c ? "ring-accent" : "ring-transparent",
                          )}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {CATEGORY_ICONS.map(({ name, Icon }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setIcon(name)}
                          aria-label={`Icon ${name}`}
                          className={cx(
                            "flex items-center justify-center rounded-md p-1 transition-colors",
                            icon === name
                              ? "bg-accent/15 text-accent"
                              : "text-muted hover:bg-bg",
                          )}
                        >
                          <Icon size={15} />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={createAndPick}
                      disabled={busy}
                      className="btn-accent w-full"
                    >
                      <Plus size={14} /> Create
                    </button>
                  </li>
                )}
                {!query.trim() && matches.length === 0 && (
                  <li className="px-3 py-2 text-xs text-muted">
                    No categories yet
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ConfirmDelete({
  category,
  count,
  busy,
  onCancel,
  onConfirm,
}: {
  category: Category;
  count: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-3 p-3">
      <p className="text-sm">
        Delete <span className="font-medium">{category.name}</span>?
      </p>
      {count > 0 ? (
        <p className="rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-600">
          {count} {count === 1 ? "routine uses" : "routines use"} this category.
          Deleting it makes {count === 1 ? "it" : "them"} Uncategorized — nothing
          else is lost.
        </p>
      ) : (
        <p className="text-xs text-muted">No routines use this category.</p>
      )}
      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
          Keep it
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function CategoryBadge({
  color,
  icon,
}: {
  color: string | null | undefined;
  icon: string | null | undefined;
}) {
  const Icon = getCategoryIcon(icon);
  return (
    <span
      className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
      style={{ background: (color ?? "rgb(var(--muted))") + "22", color: color ?? "rgb(var(--muted))" }}
      aria-hidden
    >
      <Icon size={12} />
    </span>
  );
}

function ChevronDownSmall({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
