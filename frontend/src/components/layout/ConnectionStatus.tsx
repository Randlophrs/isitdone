import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cx } from "@/lib/utils";

export function ConnectionStatus() {
  const { isError, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 15_000,
  });

  const label = isLoading ? "Connecting…" : isError ? "Disconnected" : "Local server connected";
  const dot = isError ? "bg-red-500" : isLoading ? "bg-amber-400" : "bg-emerald-500";

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span className={cx("h-2 w-2 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}
