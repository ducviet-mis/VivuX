import type {
  ChapterWeight,
  LevelWeights,
  PersonalExamConfig,
  PersonalExamLevel,
  PersonalExamQuestion,
  PersonalExamSession,
} from './types';

export const PERSONAL_EXAM_SESSION_PREFIX = 'flydo:personal-exam:v1:';

export const LEVEL_META: Record<PersonalExamLevel, { label: string; target: string; estimatedSeconds: number }> = {
  1: { label: 'Level 1', target: 'Mức nền tảng · 0–5 điểm', estimatedSeconds: 20 },
  2: { label: 'Level 2', target: 'Mức khá · trên 5–7 điểm', estimatedSeconds: 45 },
  3: { label: 'Level 3', target: 'Mức giỏi · trên 7–8,5 điểm', estimatedSeconds: 60 },
  4: { label: 'Level 4', target: 'Mức nâng cao · trên 8,5–10 điểm', estimatedSeconds: 100 },
};

export const DEFAULT_LEVEL_WEIGHTS: LevelWeights = { 1: 30, 2: 40, 3: 25, 4: 5 };

export function sumWeights(items: ChapterWeight[] | LevelWeights): number {
  if (Array.isArray(items)) return items.reduce((total, item) => total + (Number(item.weight) || 0), 0);
  return Object.values(items).reduce((total, value) => total + (Number(value) || 0), 0);
}

/** Distributes an integer total fairly while ensuring that the sum remains exact. */
export function allocateByWeights<T extends string | number>(
  total: number,
  items: Array<{ id: T; weight: number }>,
): Map<T, number> {
  const result = new Map<T, number>(items.map((item) => [item.id, 0]));
  const positiveItems = items.filter((item) => item.weight > 0);
  const weightTotal = positiveItems.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0 || weightTotal <= 0) return result;

  const fractions = positiveItems.map((item) => {
    const exact = (total * item.weight) / weightTotal;
    const whole = Math.floor(exact);
    result.set(item.id, whole);
    return { id: item.id, fraction: exact - whole };
  });

  let remaining = total - Array.from(result.values()).reduce((sum, value) => sum + value, 0);
  fractions
    .sort((left, right) => right.fraction - left.fraction)
    .forEach((item) => {
      if (remaining <= 0) return;
      result.set(item.id, (result.get(item.id) || 0) + 1);
      remaining -= 1;
    });

  return result;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function getLevelQuestionNeeds(questionCount: number, levelWeights: LevelWeights) {
  return allocateByWeights(questionCount, ([1, 2, 3, 4] as PersonalExamLevel[]).map((level) => ({
    id: level,
    weight: levelWeights[level],
  })));
}

/**
 * Builds a new paper from the practice bank. Level proportions remain exact;
 * when a chosen chapter lacks one level, the remaining questions of that level
 * are borrowed from another selected chapter and a warning is returned.
 */
export function buildPersonalExam(
  config: PersonalExamConfig,
  availableQuestions: PersonalExamQuestion[],
): { questions: PersonalExamQuestion[]; warnings: string[] } {
  const chapterWeights = config.chapterWeights.filter((item) => item.weight > 0);
  if (chapterWeights.length === 0) throw new Error('Hãy chọn ít nhất một chương có tỉ lệ lớn hơn 0%.');
  if (sumWeights(chapterWeights) !== 100) throw new Error('Tổng tỉ lệ các chương phải bằng 100%.');
  if (sumWeights(config.levelWeights) !== 100) throw new Error('Tổng tỉ lệ các Level phải bằng 100%.');

  const selectedChapters = new Set(chapterWeights.map((item) => item.chapter));
  const candidates = availableQuestions.filter((question) => selectedChapters.has(question.chapter));
  if (candidates.length < config.questionCount) {
    throw new Error(`Ngân hàng câu hỏi đã chọn chỉ có ${candidates.length} câu, chưa đủ ${config.questionCount} câu.`);
  }

  const selected: PersonalExamQuestion[] = [];
  const selectedIds = new Set<string>();
  const warnings: string[] = [];
  const levelNeeds = getLevelQuestionNeeds(config.questionCount, config.levelWeights);

  for (const level of [1, 2, 3, 4] as PersonalExamLevel[]) {
    const required = levelNeeds.get(level) || 0;
    if (required === 0) continue;

    const allOfLevel = shuffle(candidates.filter((question) => question.difficultyLevel === level));
    if (allOfLevel.length < required) {
      throw new Error(`Level ${level} chỉ có ${allOfLevel.length} câu trong các chương đã chọn, chưa đủ ${required} câu theo tỉ lệ bạn đặt.`);
    }

    const chapterNeeds = allocateByWeights(required, chapterWeights.map((item) => ({ id: item.chapter, weight: item.weight })));
    const missingForLevel: number[] = [];

    chapterWeights.forEach(({ chapter }) => {
      const needed = chapterNeeds.get(chapter) || 0;
      const matched = shuffle(allOfLevel.filter((question) => question.chapter === chapter && !selectedIds.has(question.id))).slice(0, needed);
      matched.forEach((question) => {
        selected.push(question);
        selectedIds.add(question.id);
      });
      if (matched.length < needed) missingForLevel.push(needed - matched.length);
    });

    const missing = missingForLevel.reduce((sum, value) => sum + value, 0);
    if (missing > 0) {
      const fallback = allOfLevel.filter((question) => !selectedIds.has(question.id)).slice(0, missing);
      fallback.forEach((question) => {
        selected.push(question);
        selectedIds.add(question.id);
      });
      warnings.push(`Tỉ lệ chương của Level ${level} đã được điều chỉnh nhẹ vì một số chương chưa đủ câu.`);
    }
  }

  if (selected.length !== config.questionCount) {
    throw new Error('Không thể tạo đủ số câu với cấu hình hiện tại. Hãy đổi tỉ lệ hoặc chọn thêm chương.');
  }

  return { questions: shuffle(selected), warnings };
}

export function getEstimatedSeconds(questionCount: number, levelWeights: LevelWeights): number {
  const needs = getLevelQuestionNeeds(questionCount, levelWeights);
  return ([1, 2, 3, 4] as PersonalExamLevel[]).reduce(
    (total, level) => total + (needs.get(level) || 0) * LEVEL_META[level].estimatedSeconds,
    0,
  );
}

export function createPersonalExamSession(config: PersonalExamConfig, questions: PersonalExamQuestion[]): PersonalExamSession {
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return { version: 1, id, config, questions, createdAt: new Date().toISOString() };
}

export function personalExamStorageKey(sessionId: string) {
  return `${PERSONAL_EXAM_SESSION_PREFIX}${sessionId}`;
}

export function formatMinutes(seconds: number) {
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? 'dưới 1 phút' : `${minutes} phút`;
}
