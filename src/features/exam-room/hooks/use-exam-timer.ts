import { useExamStore } from '../stores/exam-store';

export function useExamTimer() {
  const { timeRemaining, examConfig } = useExamStore();

  const minutes = Math.floor(Math.max(0, timeRemaining) / 60);
  const seconds = Math.max(0, timeRemaining) % 60;

  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    minutes,
    seconds,
    isLow: timeRemaining > 0 && timeRemaining < 300,
    isDanger: timeRemaining > 0 && timeRemaining < 60,
    formatted,
  };
}
