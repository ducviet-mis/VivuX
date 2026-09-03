export type AnswerType = 'mcq' | 'tf' | 'short';

export interface AnswerKey {
  questionNumber: number;
  answer: string;
  type: AnswerType;
}

export interface ExamConfig {
  id: string;
  title: string;
  classId: string;
  pdfUrl: string;
  durationMinutes: number;
  answerKeys: AnswerKey[];
  answerType: AnswerType;
  createdAt: string;
  isActive: boolean;
}
