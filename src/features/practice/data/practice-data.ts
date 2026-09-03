// Lesson metadata - maps lesson_id to display info
// This is the only static data; actual questions come from Supabase
export const LESSON_META: Record<string, { grade: number; chapter: string; title: string }> = {
  'l6-1': { grade: 6, chapter: 'Số tự nhiên', title: 'Tập hợp các số tự nhiên' },
  'l7-1': { grade: 7, chapter: 'Số hữu tỉ', title: 'Các phép toán với số hữu tỉ' },
  'l8-1': { grade: 8, chapter: 'Phép nhân và phép chia đa thức', title: 'Nhân đơn thức với đa thức' },
  'l8-2-1': { grade: 8, chapter: 'ÔN TẬP ĐA THỨC', title: 'Bài tập trắc nghiệm' },
  'l9-1': { grade: 9, chapter: 'Căn bậc hai', title: 'Khái niệm về căn bậc hai' },
};

// Grade labels
export const GRADE_LABELS: Record<number, string> = {
  6: 'Lớp 6',
  7: 'Lớp 7', 
  8: 'Lớp 8',
  9: 'Lớp 9',
};
