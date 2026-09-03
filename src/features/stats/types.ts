export type TimeFilter = 'today' | 'week' | 'month' | 'all';

export interface StatsData {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  totalMinutes: number;
  accuracy: number;
}
