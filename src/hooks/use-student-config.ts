import { create } from 'zustand';

export interface StudentConfig {
  // Profile
  name: string;
  rollNumber: string;
  department: string;
  semester: number;
  
  // Attendance Goals
  targetAttendance: number; // 75, 80, 85, 90, 95
  warningThreshold: number; // Alert when below this
  
  // Preferences
  notificationsEnabled: boolean;
  classReminderMinutes: number; // 30, 60, 120
  theme: 'dark' | 'light' | 'auto';
  
  // Display
  showWeekends: boolean;
  compactMode: boolean;
  groupByDepartment: boolean;
}

const DEFAULT_CONFIG: StudentConfig = {
  name: '',
  rollNumber: '',
  department: 'Not Set',
  semester: 1,
  targetAttendance: 75,
  warningThreshold: 70,
  notificationsEnabled: true,
  classReminderMinutes: 60,
  theme: 'dark',
  showWeekends: false,
  compactMode: false,
  groupByDepartment: false,
};

interface StudentConfigStore {
  config: StudentConfig;
  setConfig: (updates: Partial<StudentConfig>) => void;
  resetConfig: () => void;
  loadConfig: () => void;
  saveConfig: () => void;
}

export const useStudentConfig = create<StudentConfigStore>((set, get) => ({
  config: DEFAULT_CONFIG,
  
  setConfig: (updates) => {
    set((state) => {
      const newConfig = { ...state.config, ...updates };
      return { config: newConfig };
    });
    // Auto-save after update
    setTimeout(() => get().saveConfig(), 300);
  },
  
  resetConfig: () => {
    set({ config: { ...DEFAULT_CONFIG } });
    localStorage.removeItem('attenex_student_config');
  },
  
  loadConfig: () => {
    try {
      const saved = localStorage.getItem('attenex_student_config');
      if (saved) {
        const loaded = JSON.parse(saved);
        set({ config: { ...DEFAULT_CONFIG, ...loaded } });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  },
  
  saveConfig: () => {
    try {
      const { config } = get();
      localStorage.setItem('attenex_student_config', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },
}));
