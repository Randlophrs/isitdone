import { QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
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
import { GridSweep } from "@/components/layout/GridSweep";
import { useReminders } from "@/hooks/use-reminders";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/history", label: "History", icon: History },
  { to: "/statistics", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}

function Shell() {
  const { theme, toggle } = useTheme();
  useReminders();

  return (
    <>
      <GridSweep />
      <BrowserRouter>
        <div className="md:flex md:min-h-screen">
          <aside className="flex md:flex-col border-b md:border-b-0 md:border-r border-border bg-surface md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
            <div className="flex items-center justify-between px-4 py-4 md:block">
              <span className="font-semibold text-lg">isitdone</span>
              <button
                className="btn-ghost md:hidden"
                onClick={toggle}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <nav className="flex flex-1 items-center gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:items-stretch md:px-3 md:pb-3 md:pt-2">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cx(
                      "flex items-center gap-3 rounded-lg px-3 py-2 whitespace-nowrap text-sm",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-border/60",
                    )
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <button
              className="btn-ghost hidden w-full justify-start gap-3 px-6 py-3 md:flex"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </aside>

          <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  );
}
