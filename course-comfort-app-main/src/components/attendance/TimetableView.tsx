import { Trash2 } from "lucide-react";
import { DAYS, type TimetableEntry } from "@/lib/attendance-types";

interface Props {
  entries: TimetableEntry[];
  onRemove: (id: string) => void;
}

export default function TimetableView({ entries, onRemove }: Props) {
  return (
    <div className="space-y-5">
      {DAYS.map((day) => {
        const dayEntries = entries.filter((e) => e.day === day);
        if (dayEntries.length === 0) return null;
        return (
          <div key={day}>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              {day}
            </h4>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{entry.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.faculty} · {entry.startTime} – {entry.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {entries.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No classes added yet. Use the form above to build your timetable.
        </p>
      )}
    </div>
  );
}
