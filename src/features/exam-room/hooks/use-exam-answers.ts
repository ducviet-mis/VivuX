import { useExamStore } from '../stores/exam-store';

export function useExamAnswers() {
  const { examConfig, studentAnswers, setAnswer, toggleFlag } = useExamStore();

  const getAnswer = (questionNumber: number): string => {
    const ans = studentAnswers.find(a => a.questionNumber === questionNumber);
    return ans ? ans.answer : '';
  };

  const isFlagged = (questionNumber: number): boolean => {
    const ans = studentAnswers.find(a => a.questionNumber === questionNumber);
    return ans ? ans.isFlagged : false;
  };

  const answeredCount = studentAnswers.filter(a => a.answer.trim() !== '').length;
  const flaggedCount = studentAnswers.filter(a => a.isFlagged).length;
  const totalQuestions = examConfig ? examConfig.answerKeys.length : 0;

  return {
    getAnswer,
    setAnswer,
    isFlagged,
    toggleFlag,
    answeredCount,
    flaggedCount,
    totalQuestions,
    studentAnswers
  };
}
