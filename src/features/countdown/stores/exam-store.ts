import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExamDate {
  id: string;
  name: string;
  date: string;
}

interface ExamDateStore {
  examDates: ExamDate[];
  addExam: (name: string, date: string) => void;
  removeExam: (id: string) => void;
  updateExam: (id: string, name: string, date: string) => void;
}

export const useExamStore = create<ExamDateStore>()(
  persist(
    (set) => ({
      examDates: [
        { id: '1', name: 'Thi Học kỳ 1', date: new Date(new Date().getFullYear(), 11, 20).toISOString() },
        { id: '2', name: 'Thi Học kỳ 2', date: new Date(new Date().getFullYear() + 1, 4, 15).toISOString() }
      ],
      addExam: (name, date) => set((state) => ({
        examDates: [...state.examDates, { id: Date.now().toString(36) + Math.random().toString(36).slice(2), name, date }]
      })),
      removeExam: (id) => set((state) => ({
        examDates: state.examDates.filter((exam) => exam.id !== id)
      })),
      updateExam: (id, name, date) => set((state) => ({
        examDates: state.examDates.map((exam) => 
          exam.id === id ? { ...exam, name, date } : exam
        )
      }))
    }),
    {
      name: 'exam-dates-storage',
    }
  )
);
