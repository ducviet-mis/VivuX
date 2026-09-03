'use client';

import { useExamStore } from '../stores/exam-store';
import { useExamAnswers } from '../hooks/use-exam-answers';
import { McqAnswer } from './mcq-answer';
import { TrueFalseAnswer } from './true-false-answer';
import { ShortAnswer } from './short-answer';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

export function AnswerSheet() {
  const { examConfig } = useExamStore();
  const { getAnswer, setAnswer, isFlagged, toggleFlag, answeredCount, totalQuestions } = useExamAnswers();
  const listRef = useRef<HTMLDivElement>(null);

  if (!examConfig) return null;

  const handleNavClick = (qNum: number) => {
    const el = document.getElementById(`question-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header + Navigation */}
      <div className="p-4 border-b bg-card shrink-0">
        <h3 className="font-semibold mb-3">Phiếu trả lời ({answeredCount}/{totalQuestions})</h3>
        
        {/* Navigation Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-28 overflow-y-auto pr-1">
          {examConfig.answerKeys.map(key => {
            const hasAns = !!getAnswer(key.questionNumber);
            const flagged = isFlagged(key.questionNumber);
            
            return (
              <button
                key={`nav-${key.questionNumber}`}
                onClick={() => handleNavClick(key.questionNumber)}
                className={cn(
                  "h-8 text-xs font-medium rounded border flex items-center justify-center transition-colors",
                  flagged ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400" :
                  hasAns ? "bg-primary text-primary-foreground border-primary" :
                  "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                {key.questionNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Answer List */}
      <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
        <div className="space-y-4 pb-24">
          {examConfig.answerKeys.map(key => (
            <div id={`question-${key.questionNumber}`} key={`q-${key.questionNumber}`}>
              {key.type === 'mcq' && (
                <McqAnswer 
                  questionNumber={key.questionNumber}
                  value={getAnswer(key.questionNumber)}
                  onChange={(val) => setAnswer(key.questionNumber, val)}
                  isFlagged={isFlagged(key.questionNumber)}
                  onToggleFlag={() => toggleFlag(key.questionNumber)}
                />
              )}
              {key.type === 'tf' && (
                <TrueFalseAnswer 
                  questionNumber={key.questionNumber}
                  value={getAnswer(key.questionNumber)}
                  onChange={(val) => setAnswer(key.questionNumber, val)}
                  isFlagged={isFlagged(key.questionNumber)}
                  onToggleFlag={() => toggleFlag(key.questionNumber)}
                />
              )}
              {key.type === 'short' && (
                <ShortAnswer 
                  questionNumber={key.questionNumber}
                  value={getAnswer(key.questionNumber)}
                  onChange={(val) => setAnswer(key.questionNumber, val)}
                  isFlagged={isFlagged(key.questionNumber)}
                  onToggleFlag={() => toggleFlag(key.questionNumber)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
