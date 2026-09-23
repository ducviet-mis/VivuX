import { create } from 'zustand';

export function localStudyDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function studyDayBounds(date: string): { start: string; end: string } {
  const startMs = new Date(`${date}T00:00:00+07:00`).getTime();
  return { start: new Date(startMs).toISOString(), end: new Date(startMs + 86_400_000).toISOString() };
}

interface OnlineStudyState {
  userId: string | null;
  date: string;
  seconds: number;
  setSnapshot: (userId: string, date: string, seconds: number) => void;
  reset: () => void;
}

export const useOnlineStudyStore = create<OnlineStudyState>((set) => ({
  userId: null,
  date: '',
  seconds: 0,
  setSnapshot: (userId, date, seconds) => set((state) => {
    if (state.userId === userId && state.date > date) return state;
    if (state.userId === userId && state.date === date && state.seconds > seconds) return state;
    return { userId, date, seconds: Math.max(0, seconds) };
  }),
  reset: () => set({ userId: null, date: '', seconds: 0 }),
}));
