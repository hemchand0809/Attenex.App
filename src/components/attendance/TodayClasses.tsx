import { CheckCircle2, XCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { getDayName, type TimetableEntry } from "@/lib/attendance-types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  entries: TimetableEntry[];
  onPresent: (subject: string) => void;
  onAbsent: (subject: string) => void;
}

export default function TodayClasses({ entries, onPresent, onAbsent }: Props) {
  const [feedback, setFeedback] = useState<Record<string, "present" | "absent">>({});
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const showFeedback = (subject: string, status: "present" | "absent") => {
    setFeedback((prev) => ({ ...prev, [subject]: status }));
    if (timers.current[subject]) {
      window.clearTimeout(timers.current[subject]);
    }
    timers.current[subject] = window.setTimeout(() => {
      setFeedback((prev) => {
        const next = { ...prev };
        delete next[subject];
        return next;
      });
      delete timers.current[subject];
    }, 2200);
  };

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
                className="relative flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{entry.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.startTime} – {entry.endTime}
                  </p>
                </div>

                <AnimatePresence>
                  {feedback[entry.subject] ? (
                    <motion.div
                      key={`${entry.subject}-${feedback[entry.subject]}`}
                      initial={{ opacity: 0, y: -8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                      className={`absolute right-4 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-lg shadow-black/5 ${
                        feedback[entry.subject] === "present"
                          ? "bg-success/90 text-success-foreground"
                          : "bg-destructive/90 text-destructive-foreground"
                      }`}
                    >
                      {feedback[entry.subject] === "present" ? "Nice! 😊" : "Oops... 😢"}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onPresent(entry.subject);
                      showFeedback(entry.subject, "present");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-success/20 px-4 py-2.5 text-sm font-medium text-success transition-all active:scale-95 hover:bg-success/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Present
                  </button>
                  <button
                    onClick={() => {
                      onAbsent(entry.subject);
                      showFeedback(entry.subject, "absent");
                    }}
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
