type ClassValue = string | number | null | false | undefined | ClassValue[];

/** Minimal classnames helper — avoids an extra dependency. */
export function cx(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const a of args) {
    if (!a) continue;
    if (Array.isArray(a)) {
      const inner = cx(...a);
      if (inner) out.push(inner);
    } else {
      out.push(String(a));
    }
  }
  return out.join(" ");
}

export function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function frequencyLabel(f: string): string {
  return f.charAt(0).toUpperCase() + f.slice(1);
}
