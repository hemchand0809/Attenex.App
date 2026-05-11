import { useMemo, useState } from "react";
import type { HistoryEntry, AttendanceRecord } from "@/lib/attendance-types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  history: HistoryEntry[];
  records: AttendanceRecord;
}

/** Build daily cumulative attendance % per subject over the last N days */
function buildChartData(history: HistoryEntry[], numDays: number) {
  const today = new Date();
  const dates: string[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // collect all subjects
  const subjects = [...new Set(history.map((h) => h.subject))];

  // running totals per subject
  const totals: Record<string, { total: number; attended: number }> = {};
  subjects.forEach((s) => (totals[s] = { total: 0, attended: 0 }));

  // index history by date
  const byDate: Record<string, HistoryEntry[]> = {};
  history.forEach((h) => {
    (byDate[h.date] ||= []).push(h);
  });

  return dates.map((date) => {
    const dayEntries = byDate[date] || [];
    dayEntries.forEach((e) => {
      if (!totals[e.subject]) totals[e.subject] = { total: 0, attended: 0 };
      totals[e.subject].total++;
      if (e.status === "present") totals[e.subject].attended++;
    });

    const point: Record<string, string | number> = {
      date: `${date.slice(5)}`, // MM-DD
    };
    subjects.forEach((s) => {
      const t = totals[s];
      point[s] = t.total > 0 ? Math.round((t.attended / t.total) * 100) : 0;
    });
    return point;
  });
}

const COLORS = [
  "oklch(0.6 0.18 250)",   // primary blue
  "oklch(0.65 0.2 150)",   // green
  "oklch(0.75 0.15 80)",   // amber
  "oklch(0.6 0.2 300)",    // purple
  "oklch(0.65 0.2 20)",    // red-orange
  "oklch(0.65 0.15 190)",  // teal
];

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export default function AttendanceChart({ history, records }: Props) {
  const [range, setRange] = useState(14);
  const subjects = Object.keys(records);
  const data = useMemo(() => buildChartData(history, range), [history, range]);

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No attendance history yet. Mark classes as present or absent to see trends here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Attendance Trends</h3>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 75% threshold line info */}
      <p className="text-xs text-muted-foreground">
        Cumulative attendance % per subject · dashed line = 75% threshold
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              {subjects.map((s, i) => (
                <linearGradient key={s} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 260)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "oklch(0.65 0.04 255)" }}
              axisLine={{ stroke: "oklch(0.3 0.04 260)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "oklch(0.65 0.04 255)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.2 0.035 260)",
                border: "1px solid oklch(0.3 0.04 260)",
                borderRadius: "8px",
                fontSize: 12,
                color: "oklch(0.95 0.01 250)",
              }}
              formatter={(value) => [`${value}%`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "oklch(0.65 0.04 255)" }}
            />
            {/* 75% reference line */}
            <Area
              type="monotone"
              dataKey={() => 75}
              name="75% target"
              stroke="oklch(0.6 0.22 25)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              legendType="none"
            />
            {subjects.map((s, i) => (
              <Area
                key={s}
                type="monotone"
                dataKey={s}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                fill={`url(#grad-${i})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
