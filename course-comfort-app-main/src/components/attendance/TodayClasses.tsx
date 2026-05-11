import { CheckCircle2, XCircle } from "lucide-react";
import { getDayName, type TimetableEntry } from "@/lib/attendance-types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  entries: TimetableEntry[];
  onPresent: (subject: string) => void;
  onAbsent: (subject: string) => void;
}

export default function TodayClasses({ entries, onPresent, onAbsent }: Props) {
  const today = getDayName();
  const todayEntries = entries.filter((e) => e.day === today);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-lg font-semibold text-card-foreground">Today's Classes</h3>
      <p className="mb-4 text-xs text-muted-foreground">{today}</p>

      {todayEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No classes today 🎉</p>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{entry.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.startTime} – {entry.endTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPresent(entry.subject)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-success/20 px-4 py-2.5 text-sm font-medium text-success transition-all active:scale-95 hover:bg-success/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Present
                  </button>
                  <button
                    onClick={() => onAbsent(entry.subject)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/20 px-4 py-2.5 text-sm font-medium text-destructive transition-all active:scale-95 hover:bg-destructive/30"
                  >
                    <XCircle className="h-4 w-4" />
                    Absent
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
