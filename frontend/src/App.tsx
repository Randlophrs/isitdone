import { QueryClientProvider } from "@tanstack/react-query";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import { useTheme } from "@/hooks/use-theme";
import { cx } from "@/lib/utils";
import { Moon, Sun, LayoutDashboard, History, BarChart3, Settings } from "lucide-react";
import { DashboardPage } from "@/pages/DashboardPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { StatisticsPage } from "@/pages/StatisticsPage";
import { SettingsPage } from "@/pages/SettingsPage";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/history", label: "History", icon: History },
  { to: "/statistics", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-lg">isitdone</span>
            <button
              className="btn-ghost"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-4">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <nav className="sticky bottom-0 border-t border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto max-w-3xl grid grid-cols-4">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    "flex flex-col items-center gap-1 py-2 text-xs",
                    isActive ? "text-accent" : "text-muted",
                  )
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </QueryClientProvider>
  );
}
