import { create } from 'zustand';
import { ExamState, StudentAnswer, ExamResult } from '../types';
import { ExamConfig } from '@/features/exam-setup/types';

let timerInterval: ReturnType<typeof setInterval> | null = null;

interface ExamStore {
  examState: ExamState;
  examConfig: ExamConfig | null;
  studentAnswers: StudentAnswer[];
  timeRemaining: number;
  
  startExam: (config: ExamConfig) => void;
  setAnswer: (questionNumber: number, answer: string) => void;
  toggleFlag: (questionNumber: number) => void;
  submitExam: () => ExamResult | null;
  tick: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  examState: 'waiting',
  examConfig: null,
  studentAnswers: [],
  timeRemaining: 0,
  
  startExam: (config) => {
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    set({
      examState: 'in-progress',
      examConfig: config,
      studentAnswers: [],
      timeRemaining: config.durationMinutes * 60,
    });

    // Start the ONE global timer
    timerInterval = setInterval(() => {
      const state = get();
      if (state.examState !== 'in-progress' || state.timeRemaining <= 0) {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        if (state.examState === 'in-progress' && state.timeRemaining <= 0) {
          state.submitExam();
        }
        return;
      }
      set({ timeRemaining: state.timeRemaining - 1 });
    }, 1000);
  },
  
  setAnswer: (questionNumber, answer) => {
    set((state) => {
      const existingIdx = state.studentAnswers.findIndex(a => a.questionNumber === questionNumber);
      if (existingIdx >= 0) {
        const newAnswers = [...state.studentAnswers];
        newAnswers[existingIdx] = { ...newAnswers[existingIdx], answer };
        return { studentAnswers: newAnswers };
      }
      return {
        studentAnswers: [...state.studentAnswers, { questionNumber, answer, isFlagged: false }]
      };
    });
  },
  
  toggleFlag: (questionNumber) => {
    set((state) => {
      const existingIdx = state.studentAnswers.findIndex(a => a.questionNumber === questionNumber);
      if (existingIdx >= 0) {
        const newAnswers = [...state.studentAnswers];
        newAnswers[existingIdx] = { ...newAnswers[existingIdx], isFlagged: !newAnswers[existingIdx].isFlagged };
        return { studentAnswers: newAnswers };
      }
      return {
        studentAnswers: [...state.studentAnswers, { questionNumber, answer: '', isFlagged: true }]
      };
    });
  },
  
  submitExam: () => {
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const state = get();
    if (!state.examConfig) return null;
    
    const result: ExamResult = {
      examId: state.examConfig.id,
      studentId: 'student-123',
      answers: state.studentAnswers,
      score: 0,
      total: 0,
      percentage: 0,
      flaggedQuestions: state.studentAnswers.filter(a => a.isFlagged).map(a => a.questionNumber),
      submittedAt: new Date().toISOString(),
      timeTaken: (state.examConfig.durationMinutes * 60) - state.timeRemaining,
    };
    
    set({ examState: 'submitted' });
    return result;
  },
  
  tick: () => {
    // Keep for backward compat but no longer used
    set((state) => {
      if (state.examState !== 'in-progress' || state.timeRemaining <= 0) return state;
      return { timeRemaining: state.timeRemaining - 1 };
    });
  },
  
  reset: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({
      examState: 'waiting',
      examConfig: null,
      studentAnswers: [],
      timeRemaining: 0,
    });
  }
}));
