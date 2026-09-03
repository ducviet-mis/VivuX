import { ExamConfig } from '@/features/exam-setup/types';

export const mockExams: ExamConfig[] = [];

export const saveMockExam = (exam: ExamConfig) => {
  mockExams.push(exam);
};
