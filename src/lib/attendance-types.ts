export interface TimetableEntry {
  id: string;
  subject: string;
  faculty: string;
  startTime: string;
  endTime: string;
  day: string;
}

export interface AttendanceRecord {
  [subject: string]: {
    total: number;
    attended: number;
  };
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  subject: string;
  status: "present" | "absent";
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function getDayName(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

export function calcAttendancePercent(attended: number, total: number): number {
  if (total === 0) return 0;
  return (attended / total) * 100;
}

/** Classes needed to reach 75% */
export function classesRequiredFor75(attended: number, total: number): number {
  if (total === 0) return 0;
  const needed = Math.ceil((0.75 * total - attended) / 0.25);
  return Math.max(0, needed);
}

/** Classes you can still bunk and stay ≥75% */
export function classesBunkable(attended: number, total: number): number {
  if (total === 0) return 0;
  const bunkable = Math.floor(attended / 0.75 - total);
  return Math.max(0, bunkable);
}
