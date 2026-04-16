import { useState } from "react";
import type { AttendanceRecord } from "@/lib/attendance-types";
import { calcAttendancePercent } from "@/lib/attendance-types";
import SubjectCard from "./SubjectCard";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  records: AttendanceRecord;
  onResetSubject: (subject: string) => void;
  onResetAll: () => void;
  onPresent: (subject: string) => void;
  onAbsent: (subject: string) => void;
  onUndoPresent: (subject: string) => void;
  onUndoAbsent: (subject: string) => void;
}

function AttendanceRing({ percent }: { percent: number }) {
  const isGood = percent >= 75;
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={isGood ? "var(--success)" : "var(--destructive)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          key={percent.toFixed(1)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-extrabold ${isGood ? "text-success" : "text-destructive"}`}
        >
          {percent.toFixed(1)}%
        </motion.span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
          Overall
        </span>
      </div>
    </div>
  );
}

export default function Dashboard({ records, onResetSubject, onResetAll, onPresent, onAbsent, onUndoPresent, onUndoAbsent }: Props) {
  const [confirmAll, setConfirmAll] = useState(false);
  const subjects = Object.keys(records);
  const totalAttended = subjects.reduce((s, k) => s + records[k].attended, 0);
  const totalClasses = subjects.reduce((s, k) => s + records[k].total, 0);
  const totalAbsent = totalClasses - totalAttended;
  const overallPct = calcAttendancePercent(totalAttended, totalClasses);

  return (
    <div className="space-y-5">
      {/* big ring */}
      <div className="flex flex-col items-center py-2">
        <AttendanceRing percent={overallPct} />
        <div className="mt-4 flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">{totalClasses}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-success">{totalAttended}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Present</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-destructive">{totalAbsent}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Absent</span>
          </div>
        </div>
      </div>

      {/* reset all */}
      {subjects.length > 0 && (
        <div className="flex justify-end">
          {confirmAll ? (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2">
              <span className="text-xs text-destructive">Reset all?</span>
              <button
                onClick={() => { onResetAll(); setConfirmAll(false); }}
                className="rounded-lg bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground active:scale-95"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmAll(false)}
                className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground active:scale-95"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmAll(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground active:scale-95 hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </button>
          )}
        </div>
      )}

      {/* subjects */}
      {subjects.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Add subjects in Schedule tab, then mark attendance here.
        </p>
      ) : (
        <div className="space-y-3">
          {subjects.map((s) => (
            <SubjectCard
              key={s}
              subject={s}
              total={records[s].total}
              attended={records[s].attended}
              onReset={() => onResetSubject(s)}
              onPresent={() => onPresent(s)}
              onAbsent={() => onAbsent(s)}
              onUndoPresent={() => onUndoPresent(s)}
              onUndoAbsent={() => onUndoAbsent(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
