import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarDays, LayoutDashboard, BookOpenCheck, BarChart3, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useTimetable, useAttendance } from "@/hooks/use-attendance-store";
import TimetableForm from "@/components/attendance/TimetableForm";
import TimetableView from "@/components/attendance/TimetableView";
import TodayClasses from "@/components/attendance/TodayClasses";
import Dashboard from "@/components/attendance/Dashboard";
import AttendanceChart from "@/components/attendance/AttendanceChart";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Attenex — Smart Attendance Tracker" },
      { name: "description", content: "Track attendance, calculate 75% requirements, and manage your timetable with Attenex." },
    ],
  }),
});

type Tab = "dashboard" | "timetable" | "today" | "trends";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "today", label: "Today", icon: BookOpenCheck },
  { id: "trends", label: "Trends", icon: BarChart3 },
  { id: "timetable", label: "Schedule", icon: CalendarDays },
];

function Index() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { entries, addEntry, removeEntry } = useTimetable();
  const { records, history, markPresent, markAbsent, undoPresent, undoAbsent, resetSubject, resetAll } = useAttendance();

  const { dark, toggle: toggleTheme } = useTheme();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dayStr = now?.toLocaleDateString(undefined, { weekday: "long" }) ?? "";
  const dateStr = now?.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) ?? "";

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* top bar */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-md px-4 pt-[env(safe-area-inset-top)] pb-0">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground leading-tight">
                Attenex
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Smart Attendance Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{dayStr}</p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">{dateStr}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-xl bg-secondary p-2 text-foreground transition-all active:scale-90 hover:bg-accent"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* scrollable content */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-2">
        {tab === "dashboard" && (
          <Dashboard
            records={records}
            onResetSubject={resetSubject}
            onResetAll={resetAll}
            onPresent={markPresent}
            onAbsent={markAbsent}
            onUndoPresent={undoPresent}
            onUndoAbsent={undoAbsent}
          />
        )}
        {tab === "today" && (
          <TodayClasses entries={entries} onPresent={markPresent} onAbsent={markAbsent} />
        )}
        {tab === "trends" && (
          <AttendanceChart history={history} records={records} />
        )}
        {tab === "timetable" && (
          <div className="space-y-5">
            <TimetableForm onAdd={addEntry} />
            <TimetableView entries={entries} onRemove={removeEntry} />
          </div>
        )}
      </main>

      {/* bottom nav */}
      <nav className="shrink-0 border-t border-border bg-card/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 gap-0">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <t.icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_var(--primary)]" : ""}`} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* footer */}
      <div className="shrink-0 bg-background text-center py-1.5 border-t border-border">
        <p className="text-[9px] text-muted-foreground">
          © {new Date().getFullYear()} Attenex. All rights reserved by Dev Developers.
        </p>
      </div>
    </div>
  );
}
