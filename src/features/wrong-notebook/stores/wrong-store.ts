import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WrongQuestion {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  addedAt: string;
  isCorrected?: boolean;
}

interface WrongStoreState {
  wrongQuestions: WrongQuestion[];
  addWrong: (question: Omit<WrongQuestion, 'addedAt'>) => void;
  removeWrong: (questionId: string) => void;
  clearAll: () => void;
  markCorrected: (questionId: string) => void;
}

export const useWrongStore = create<WrongStoreState>()(
  persist(
    (set) => ({
      wrongQuestions: [
        {
          questionId: 'q1',
          question: 'Giải phương trình: 2x + 5 = 15',
          userAnswer: 'x = 10',
          correctAnswer: 'x = 5',
          addedAt: new Date().toISOString()
        },
        {
          questionId: 'q2',
          question: 'Ai là người tìm ra châu Mỹ?',
          userAnswer: 'Magellan',
          correctAnswer: 'Christopher Columbus',
          addedAt: new Date().toISOString()
        }
      ],
      addWrong: (question) => set((state) => ({
        wrongQuestions: [...state.wrongQuestions, { ...question, addedAt: new Date().toISOString() }]
      })),
      removeWrong: (id) => set((state) => ({
        wrongQuestions: state.wrongQuestions.filter(q => q.questionId !== id)
      })),
      clearAll: () => set({ wrongQuestions: [] }),
      markCorrected: (id) => set((state) => ({
        wrongQuestions: state.wrongQuestions.map(q => 
          q.questionId === id ? { ...q, isCorrected: true } : q
        )
      })),
    }),
    { name: 'edu-tutor-wrong-notebook' }
  )
);
