import { useState } from "react";
import {
  calcAttendancePercent,
  classesRequiredFor75,
  classesBunkable,
} from "@/lib/attendance-types";
import { motion } from "framer-motion";
import { RotateCcw, Plus, Minus } from "lucide-react";

interface Props {
  subject: string;
  total: number;
  attended: number;
  onReset?: () => void;
  onPresent?: () => void;
  onAbsent?: () => void;
  onUndoPresent?: () => void;
  onUndoAbsent?: () => void;
}

export default function SubjectCard({
  subject, total, attended, onReset, onPresent, onAbsent, onUndoPresent, onUndoAbsent,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const pct = calcAttendancePercent(attended, total);
  const needed = classesRequiredFor75(attended, total);
  const bunkable = classesBunkable(attended, total);
  const isGood = pct >= 75;
  const absent = total - attended;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      {/* header: subject name + attendance badge + reset */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-bold text-card-foreground truncate flex-1 min-w-0">
          {subject}
        </h4>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`rounded-full px-3 py-1 text-base font-extrabold ${
              isGood ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
            }`}
          >
            {pct.toFixed(1)}%
          </span>
          {onReset && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg p-1.5 text-muted-foreground active:scale-90 hover:bg-destructive/15 hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 mb-3">
          <span className="text-xs text-destructive">Reset?</span>
          <button
            onClick={() => { onReset?.(); setConfirming(false); }}
            className="rounded-lg bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground active:scale-95"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground active:scale-95"
          >
            No
          </button>
        </div>
      )}

      {/* progress bar */}
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${isGood ? "bg-success" : "bg-destructive"}`}
        />
      </div>

      {/* present / absent counters with +/- buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* present column */}
        <div className="rounded-xl bg-success/10 p-3 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-success uppercase tracking-wider font-semibold">Present</span>
          <span className="text-2xl font-extrabold text-success">{attended}</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={onUndoPresent}
              disabled={attended <= 0}
              className="rounded-lg bg-success/20 p-2 text-success active:scale-90 transition-all disabled:opacity-30 disabled:active:scale-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={onPresent}
              className="rounded-lg bg-success p-2 text-success-foreground active:scale-90 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* absent column */}
        <div className="rounded-xl bg-destructive/10 p-3 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-destructive uppercase tracking-wider font-semibold">Absent</span>
          <span className="text-2xl font-extrabold text-destructive">{absent}</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={onUndoAbsent}
              disabled={absent <= 0}
              className="rounded-lg bg-destructive/20 p-2 text-destructive active:scale-90 transition-all disabled:opacity-30 disabled:active:scale-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={onAbsent}
              className="rounded-lg bg-destructive p-2 text-destructive-foreground active:scale-90 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 75% info */}
      {total > 0 && (
        <div className="rounded-xl bg-muted/50 px-3 py-3 text-xs space-y-1.5">
          {needed > 0 ? (
            <>
              <p className="text-destructive font-medium">
                ⚠ Attend <span className="font-bold text-sm">{needed}</span> more class{needed !== 1 ? "es" : ""} to reach 75%
              </p>
              <p className="text-muted-foreground">
                {attended} of {total} classes · Below 75% target
              </p>
            </>
          ) : (
            <>
              <p className="text-success font-medium">
                ✓ You can bunk <span className="font-bold text-sm">{bunkable}</span> class{bunkable !== 1 ? "es" : ""} and still maintain ≥75%
              </p>
              <p className="text-muted-foreground">
                {attended} of {total} classes · {pct.toFixed(1)}% attendance · {bunkable === 0 ? "No margin left" : `${bunkable} class${bunkable !== 1 ? "es" : ""} buffer`}
              </p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
