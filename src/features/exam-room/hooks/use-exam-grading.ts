import { ExamResult, StudentAnswer } from '../types';
import { AnswerKey } from '@/features/exam-setup/types';

export function useExamGrading() {
  const gradeExam = (
    examId: string,
    studentAnswers: StudentAnswer[],
    answerKeys: AnswerKey[],
    timeTaken: number
  ): ExamResult => {
    let score = 0;
    
    studentAnswers.forEach(studentAns => {
      const key = answerKeys.find(k => k.questionNumber === studentAns.questionNumber);
      if (!key) return;
      
      const sAns = studentAns.answer.trim().toLowerCase();
      const kAns = key.answer.trim().toLowerCase();
      
      if (sAns === kAns) {
        score++;
      }
    });
    
    const total = answerKeys.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;
    const flaggedQuestions = studentAnswers.filter(a => a.isFlagged).map(a => a.questionNumber);
    
    return {
      examId,
      studentId: 'current-student', // Mock
      answers: studentAnswers,
      score,
      total,
      percentage,
      flaggedQuestions,
      submittedAt: new Date().toISOString(),
      timeTaken
    };
  };

  return { gradeExam };
}
