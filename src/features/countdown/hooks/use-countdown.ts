import { useState, useEffect } from 'react';
import { getCountdownData } from '../data/exam-dates';

export function useCountdown(targetDate: Date) {
  const [countdown, setCountdown] = useState(() => getCountdownData(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownData(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return countdown;
}
