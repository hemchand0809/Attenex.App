import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarDays, LayoutDashboard, BookOpenCheck, BarChart3, Moon, Sun, Settings, ArrowDownCircle } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useStudentConfig } from "@/hooks/use-student-config";
import { useTimetable, useAttendance } from "@/hooks/use-attendance-store";
import TimetableForm from "@/components/attendance/TimetableForm";
import TimetableView from "@/components/attendance/TimetableView";
import TodayClasses from "@/components/attendance/TodayClasses";
import Dashboard from "@/components/attendance/Dashboard";
import AttendanceChart from "@/components/attendance/AttendanceChart";
import StudentSettings from "@/components/attendance/StudentSettings";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

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
  const [showSettings, setShowSettings] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [installMessage, setInstallMessage] = useState("Install Attenex for quick access");
  const { entries, addEntry, removeEntry } = useTimetable();
  const { records, history, markPresent, markAbsent, undoPresent, undoAbsent, resetSubject, resetAll } = useAttendance();
  const { config, loadConfig } = useStudentConfig();

  const { dark, toggle: toggleTheme } = useTheme();
  const [now, setNow] = useState<Date | null>(null);
  
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(event);
      setShowInstall(true);
      setInstallMessage("Install Attenex for quick access");
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed, continue without offline support.
      });
    }
  }, []);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dayStr = now?.toLocaleDateString(undefined, { weekday: "long" }) ?? "";
  const dateStr = now?.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) ?? "";

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstallMessage("Installed! Open from your home screen.");
    } else {
      setInstallMessage("Install dismissed. You can still install later.");
    }

    setShowInstall(false);
    setDeferredPrompt(null);
  };

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
              {config.name && (
                <p className="text-xs font-semibold text-primary">{config.name}</p>
              )}
              <p className="text-sm font-semibold text-foreground">{dayStr}</p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">{dateStr}</p>
            </div>
            {showInstall && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all active:scale-95 hover:bg-primary/90"
                title="Install Attenex"
              >
                <ArrowDownCircle className="h-4 w-4" />
                Install
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-xl bg-secondary p-2 text-foreground transition-all active:scale-90 hover:bg-accent"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-xl bg-secondary p-2 text-foreground transition-all active:scale-90 hover:bg-accent"
              title="Open Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
        {showInstall && (
          <div className="mt-3 flex items-center justify-center gap-3 pb-3">
            <span className="rounded-full bg-secondary px-3 py-2 text-[11px] font-medium text-foreground shadow-sm">
              {installMessage}
            </span>
          </div>
        )}
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end pt-14">
          <div className="bg-background w-full sm:w-96 h-screen sm:h-auto sm:rounded-l-lg shadow-lg flex flex-col">
            <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between z-10 shrink-0">
              <h2 className="text-lg font-bold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-2xl text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <StudentSettings />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
