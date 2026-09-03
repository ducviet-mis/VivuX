export type StudentAnswer = {
  questionNumber: number;
  answer: string;
  isFlagged: boolean;
};

export type ExamResult = {
  examId: string;
  studentId: string;
  answers: StudentAnswer[];
  score: number;
  total: number;
  percentage: number;
  flaggedQuestions: number[];
  submittedAt: string;
  timeTaken: number;
};

export type ExamState = 'waiting' | 'in-progress' | 'submitted';
