import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Goals {
  studyMinutes: number;
  questionsCount: number;
  accuracy: number;
}

export interface Progress {
  studyMinutes: number;
  questionsCount: number;
  correctCount: number;
  totalCount: number;
}

interface GoalState {
  goals: Goals;
  progress: Progress;
  lastUpdated: string;
  setGoals: (goals: Goals) => void;
  addProgress: (minutes: number, correct: number, total: number) => void;
  resetDaily: () => void;
}

const defaultGoals: Goals = {
  studyMinutes: 60,
  questionsCount: 30,
  accuracy: 80
};

const emptyProgress: Progress = {
  studyMinutes: 0,
  questionsCount: 0,
  correctCount: 0,
  totalCount: 0
};

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: defaultGoals,
      progress: emptyProgress,
      lastUpdated: new Date().toISOString(),
      
      setGoals: (goals) => set({ goals }),
      
      addProgress: (minutes, correct, total) => {
        const state = get();
        // Auto reset if new day
        const today = new Date().toISOString().split('T')[0];
        const lastUpdateDate = new Date(state.lastUpdated).toISOString().split('T')[0];
        
        if (today !== lastUpdateDate) {
          set({
            progress: {
              studyMinutes: minutes,
              questionsCount: total,
              correctCount: correct,
              totalCount: total
            },
            lastUpdated: new Date().toISOString()
          });
        } else {
          set({
            progress: {
              studyMinutes: state.progress.studyMinutes + minutes,
              questionsCount: state.progress.questionsCount + total,
              correctCount: state.progress.correctCount + correct,
              totalCount: state.progress.totalCount + total
            },
            lastUpdated: new Date().toISOString()
          });
        }
      },
      
      resetDaily: () => set({ progress: emptyProgress, lastUpdated: new Date().toISOString() }),
    }),
    {
      name: 'edu-tutor-goals',
    }
  )
);
