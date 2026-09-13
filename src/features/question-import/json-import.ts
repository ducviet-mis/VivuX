export type ImportTarget = 'practice' | 'mock_exam';

export type ImportedQuestion = {
  content: string;
  options: string[];
  correct_answer: number;
  solution: string;
  diagram?: Record<string, unknown>;
};

export type ImportParseResult = {
  questions: ImportedQuestion[];
  errors: string[];
};

const LETTER_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

function getQuestionArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.questions)) return record.questions;
    if (record.data && typeof record.data === 'object' && Array.isArray((record.data as Record<string, unknown>).questions)) {
      return (record.data as Record<string, unknown>).questions as unknown[];
    }
  }
  return null;
}

function normalizeCorrectAnswer(value: unknown, options: string[]) {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^[A-Da-d]$/.test(trimmed)) return LETTER_TO_INDEX[trimmed.toUpperCase()];
    if (/^[0-3]$/.test(trimmed)) return Number(trimmed);
    const matchingOption = options.findIndex((option) => option.trim() === trimmed);
    if (matchingOption >= 0) return matchingOption;
  }
  return -1;
}

export function parseQuestionJson(raw: string): ImportParseResult {
  if (!raw.trim()) return { questions: [], errors: ['Hãy dán JSON câu hỏi trước khi xem trước.'] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { questions: [], errors: ['JSON chưa đúng định dạng. Hãy kiểm tra dấu ngoặc, dấu phẩy và dấu nháy kép.'] };
  }

  const sourceQuestions = getQuestionArray(parsed);
  if (!sourceQuestions) {
    return { questions: [], errors: ['JSON phải là một mảng câu hỏi hoặc một đối tượng có trường "questions".'] };
  }
  if (sourceQuestions.length === 0) return { questions: [], errors: ['Danh sách câu hỏi đang trống.'] };
  if (sourceQuestions.length > 100) return { questions: [], errors: ['Mỗi lượt chỉ nhập tối đa 100 câu để dễ kiểm tra.'] };

  const errors: string[] = [];
  const questions: ImportedQuestion[] = [];

  sourceQuestions.forEach((item, index) => {
    const row = index + 1;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`Câu ${row}: phải là một đối tượng JSON.`);
      return;
    }

    const record = item as Record<string, unknown>;
    const content = typeof record.content === 'string'
      ? record.content.trim()
      : typeof record.question === 'string'
        ? record.question.trim()
        : '';
    const rawOptions = Array.isArray(record.options) ? record.options : Array.isArray(record.answers) ? record.answers : [];
    const options = rawOptions.map((option) => typeof option === 'string' ? option.trim() : '');
    const correctAnswer = normalizeCorrectAnswer(record.correct_answer ?? record.correctAnswer ?? record.answer, options);
    const solution = typeof record.solution === 'string'
      ? record.solution.trim()
      : typeof record.explanation === 'string'
        ? record.explanation.trim()
        : '';

    if (!content) errors.push(`Câu ${row}: thiếu nội dung (content).`);
    if (options.length !== 4 || options.some((option) => !option)) errors.push(`Câu ${row}: cần đúng 4 phương án không để trống.`);
    if (correctAnswer < 0 || correctAnswer > 3) errors.push(`Câu ${row}: đáp án đúng phải là 0–3, A–D hoặc đúng nguyên văn một phương án.`);

    if (content && options.length === 4 && options.every(Boolean) && correctAnswer >= 0 && correctAnswer <= 3) {
      questions.push({
        content,
        options,
        correct_answer: correctAnswer,
        solution,
        diagram: record.diagram && typeof record.diagram === 'object' && !Array.isArray(record.diagram)
          ? record.diagram as Record<string, unknown>
          : undefined,
      });
    }
  });

  return { questions, errors };
}

export function buildAiPrompt(target: ImportTarget, destination: string, level?: string) {
  const scope = target === 'practice'
    ? `bài tự luyện "${destination}"${level ? `, Level ${level}` : ''}`
    : `đề thi thử "${destination}"`;

  return `Hãy tạo câu hỏi trắc nghiệm Toán THCS cho ${scope}.
Chỉ trả về JSON hợp lệ, không markdown, không giải thích bên ngoài JSON.
Mỗi câu dùng đúng cấu trúc sau:
{
  "questions": [
    {
      "content": "Nội dung câu hỏi. Công thức đặt trong $...$ hoặc $$...$$.",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correct_answer": 0,
      "solution": "Lời giải rõ ràng, xuống dòng khi cần. Công thức dài đặt trong $$...$$."
    }
  ]
}
Quy ước: correct_answer là vị trí đáp án đúng, A = 0, B = 1, C = 2, D = 3. Mỗi câu phải có đúng 4 phương án và một đáp án đúng.`;
}
