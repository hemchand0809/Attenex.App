import { useState, useEffect, useCallback } from "react";
import type { TimetableEntry, AttendanceRecord, HistoryEntry } from "@/lib/attendance-types";

function loadFromLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLS(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(loadFromLS("timetable", []));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveToLS("timetable", entries); }, [entries, hydrated]);

  const addEntry = useCallback((entry: TimetableEntry) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, addEntry, removeEntry };
}

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecords(loadFromLS("attendance", {}));
    setHistory(loadFromLS("attendance_history", []));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveToLS("attendance", records); }, [records, hydrated]);
  useEffect(() => { if (hydrated) saveToLS("attendance_history", history); }, [history, hydrated]);

  const addHistoryEntry = useCallback((subject: string, status: "present" | "absent") => {
    setHistory((prev) => [...prev, { date: todayStr(), subject, status }]);
  }, []);

  const markPresent = useCallback((subject: string) => {
    setRecords((prev) => {
      const rec = prev[subject] || { total: 0, attended: 0 };
      return { ...prev, [subject]: { total: rec.total + 1, attended: rec.attended + 1 } };
    });
    addHistoryEntry(subject, "present");
  }, [addHistoryEntry]);

  const markAbsent = useCallback((subject: string) => {
    setRecords((prev) => {
      const rec = prev[subject] || { total: 0, attended: 0 };
      return { ...prev, [subject]: { total: rec.total + 1, attended: rec.attended } };
    });
    addHistoryEntry(subject, "absent");
  }, [addHistoryEntry]);

  const undoPresent = useCallback((subject: string) => {
    setRecords((prev) => {
      const rec = prev[subject];
      if (!rec || rec.attended <= 0 || rec.total <= 0) return prev;
      const newAttended = rec.attended - 1;
      const newTotal = rec.total - 1;
      if (newTotal <= 0) {
        const next = { ...prev };
        delete next[subject];
        return next;
      }
      return { ...prev, [subject]: { total: newTotal, attended: newAttended } };
    });
    setHistory((prev: HistoryEntry[]) => {
      let idx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].subject === subject && prev[i].status === "present") { idx = i; break; }
      }
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const undoAbsent = useCallback((subject: string) => {
    setRecords((prev) => {
      const rec = prev[subject];
      if (!rec || rec.total <= 0 || rec.attended >= rec.total) return prev;
      const newTotal = rec.total - 1;
      if (newTotal <= 0) {
        const next = { ...prev };
        delete next[subject];
        return next;
      }
      return { ...prev, [subject]: { total: newTotal, attended: rec.attended } };
    });
    setHistory((prev: HistoryEntry[]) => {
      let idx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].subject === subject && prev[i].status === "absent") { idx = i; break; }
      }
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const resetSubject = useCallback((subject: string) => {
    setRecords((prev) => {
      const next = { ...prev };
      delete next[subject];
      return next;
    });
    setHistory((prev) => prev.filter((h) => h.subject !== subject));
  }, []);

  const resetAll = useCallback(() => {
    setRecords({});
    setHistory([]);
  }, []);

  return { records, history, markPresent, markAbsent, undoPresent, undoAbsent, resetSubject, resetAll };
}
