import { useStudentConfig } from '@/hooks/use-student-config';
import { Settings, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function StudentSettings() {
  const { config, setConfig, resetConfig } = useStudentConfig();
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-bold">Settings & Preferences</h2>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Your Profile</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ name: e.target.value })}
            placeholder="Enter your name"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Roll Number</label>
            <input
              type="text"
              value={config.rollNumber}
              onChange={(e) => setConfig({ rollNumber: e.target.value })}
              placeholder="e.g., 2024001"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Semester</label>
            <select
              value={config.semester}
              onChange={(e) => setConfig({ semester: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Department</label>
          <select
            value={config.department}
            onChange={(e) => setConfig({ department: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Not Set</option>
            <option>Computer Science</option>
            <option>Information Technology</option>
            <option>Electronics</option>
            <option>Mechanical</option>
            <option>Civil</option>
            <option>Electrical</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Attendance Goals Section */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Attendance Goals</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target Attendance: {config.targetAttendance}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={config.targetAttendance}
              onChange={(e) => setConfig({ targetAttendance: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">50% - 100%</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Warning Threshold: {config.warningThreshold}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={config.warningThreshold}
              onChange={(e) => setConfig({ warningThreshold: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">Alert when below this</div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Enable Notifications</label>
            <input
              type="checkbox"
              checked={config.notificationsEnabled}
              onChange={(e) => setConfig({ notificationsEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
          </div>

          {config.notificationsEnabled && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-sm font-medium text-foreground">
                Class Reminder: {config.classReminderMinutes} minutes before
              </label>
              <select
                value={config.classReminderMinutes}
                onChange={(e) => setConfig({ classReminderMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Display Preferences Section */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Display Preferences</h3>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Theme: {config.theme === 'auto' ? 'System' : config.theme === 'dark' ? 'Dark' : 'Light'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['dark', 'light', 'auto'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setConfig({ theme: t })}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  config.theme === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {t === 'auto' ? 'System' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Show Weekends</label>
            <input
              type="checkbox"
              checked={config.showWeekends}
              onChange={(e) => setConfig({ showWeekends: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Compact Mode</label>
            <input
              type="checkbox"
              checked={config.compactMode}
              onChange={(e) => setConfig({ compactMode: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Group by Department</label>
            <input
              type="checkbox"
              checked={config.groupByDepartment}
              onChange={(e) => setConfig({ groupByDepartment: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="space-y-2">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-md border border-destructive bg-destructive/5">
            <p className="text-sm text-destructive font-medium">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetConfig();
                  setShowReset(false);
                }}
                className="flex-1 py-1.5 px-3 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-1.5 px-3 rounded-md border border-input text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
