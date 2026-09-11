export const MOCK_EXAM_CATEGORIES = [
  { id: 'midterm_1', label: 'Giữa HK1' },
  { id: 'final_1', label: 'Cuối HK1' },
  { id: 'midterm_2', label: 'Giữa HK2' },
  { id: 'final_2', label: 'Cuối HK2' },
  { id: 'topic', label: 'Chuyên đề' },
] as const;

export type MockExamCategory = (typeof MOCK_EXAM_CATEGORIES)[number]['id'];

export function isMockExamCategory(value: string | null): value is MockExamCategory {
  return MOCK_EXAM_CATEGORIES.some((category) => category.id === value);
}

export function getMockExamCategoryLabel(category: string | null | undefined) {
  return MOCK_EXAM_CATEGORIES.find((item) => item.id === category)?.label || 'Chưa phân loại';
}
