import { AnswerKey, AnswerType } from '../types';

export function parseMCQAnswers(input: string, startIndex: number = 1): AnswerKey[] {
  const tokens = input.trim().split(/\s+/);
  const results: AnswerKey[] = [];
  let currentIdx = startIndex;
  
  for (const token of tokens) {
    if (!token) continue;
    const explicitMatch = token.match(/^(\d+)([A-Da-d])$/);
    if (explicitMatch) {
      currentIdx = parseInt(explicitMatch[1], 10);
      results.push({
        questionNumber: currentIdx,
        answer: explicitMatch[2].toUpperCase(),
        type: 'mcq'
      });
      currentIdx++;
    } else {
      const implicitMatch = token.match(/^[A-Da-d]$/);
      if (implicitMatch) {
        results.push({
          questionNumber: currentIdx,
          answer: token.toUpperCase(),
          type: 'mcq'
        });
        currentIdx++;
      }
    }
  }
  return results;
}

export function parseTrueFalseAnswers(input: string, startIndex: number = 1): AnswerKey[] {
  const tokens = input.trim().split(/\s+/);
  const results: AnswerKey[] = [];
  let currentIdx = startIndex;
  
  for (const token of tokens) {
    if (!token) continue;
    const explicitMatch = token.match(/^(\d+)([DdSs])$/);
    if (explicitMatch) {
      currentIdx = parseInt(explicitMatch[1], 10);
      results.push({
        questionNumber: currentIdx,
        answer: explicitMatch[2].toUpperCase(),
        type: 'tf'
      });
      currentIdx++;
    } else {
      const implicitMatch = token.match(/^[DdSs]$/);
      if (implicitMatch) {
        results.push({
          questionNumber: currentIdx,
          answer: token.toUpperCase(),
          type: 'tf'
        });
        currentIdx++;
      }
    }
  }
  return results;
}

export function parseShortAnswers(input: string, startIndex: number = 1): AnswerKey[] {
  const separator = /[\n,;]+/.test(input) ? /[\n,;]+/ : /\s+/;
  const tokens = input.trim().split(separator).map(t => t.trim()).filter(Boolean);
  const results: AnswerKey[] = [];
  let currentIdx = startIndex;
  
  for (const token of tokens) {
    const explicitMatch = token.match(/^(\d+)[:.)]\s*(.*)$/);
    if (explicitMatch && explicitMatch[2]) {
      currentIdx = parseInt(explicitMatch[1], 10);
      results.push({
        questionNumber: currentIdx,
        answer: explicitMatch[2],
        type: 'short'
      });
      currentIdx++;
    } else {
      results.push({
        questionNumber: currentIdx,
        answer: token,
        type: 'short'
      });
      currentIdx++;
    }
  }
  
  return results;
}

export function autoDetectType(input: string): AnswerType {
  const mcqMatches = input.match(/\d+\s*[A-Da-d]/g);
  const tfMatches = input.match(/\d+\s*[DdSs]/g);
  
  const mcqCount = mcqMatches ? mcqMatches.length : 0;
  const tfCount = tfMatches ? tfMatches.length : 0;
  
  if (mcqCount > 0 && mcqCount >= tfCount) {
    return 'mcq';
  } else if (tfCount > 0 && tfCount > mcqCount) {
    return 'tf';
  }
  return 'short';
}

export function validateAnswerKey(keys: AnswerKey[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const qNums = keys.map(k => k.questionNumber);
  const uniqueQNums = new Set(qNums);
  
  if (qNums.length !== uniqueQNums.size) {
    errors.push('Có câu hỏi bị trùng lặp số thứ tự.');
  }
  
  // Check gaps
  const sortedQNums = Array.from(uniqueQNums).sort((a, b) => a - b);
  for (let i = 0; i < sortedQNums.length - 1; i++) {
    if (sortedQNums[i + 1] - sortedQNums[i] > 1) {
      errors.push(`Bị thiếu câu hỏi giữa câu ${sortedQNums[i]} và ${sortedQNums[i + 1]}.`);
    }
  }
  
  // Check A-D for MCQ
  const invalidMcq = keys.some(k => k.type === 'mcq' && !['A', 'B', 'C', 'D'].includes(k.answer));
  if (invalidMcq) {
    errors.push('Đáp án trắc nghiệm chỉ được phép là A, B, C, D.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
