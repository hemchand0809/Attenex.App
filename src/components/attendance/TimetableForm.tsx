import { useState } from "react";
import { Plus } from "lucide-react";
import { DAYS, type TimetableEntry } from "@/lib/attendance-types";

interface Props {
  onAdd: (entry: TimetableEntry) => void;
}

export default function TimetableForm({ onAdd }: Props) {
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [day, setDay] = useState<string>(DAYS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      subject: subject.trim(),
      faculty: faculty.trim(),
      startTime,
      endTime,
      day,
    });
    setSubject("");
    setFaculty("");
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-lg font-semibold text-card-foreground">Add Class</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={inputClass}
          placeholder="Subject name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Faculty name"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
        />
        <input
          type="time"
          className={inputClass}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          className={inputClass}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <select
          className={inputClass}
          value={day}
          onChange={(e) => setDay(e.target.value)}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add to Timetable
      </button>
    </form>
  );
}
