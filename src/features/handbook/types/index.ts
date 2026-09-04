export type HandbookCategory = 'Toán & Đời sống' | 'Phương pháp học toán' | 'Bản đồ lý thuyết';

export interface HandbookPost {
  id: string;
  category: HandbookCategory;
  title: string;
  sapo: string;
  content: string;
  cover_url: string | null;
  author_name: string;
  read_time_minutes: number;
  is_featured: boolean;
  created_at: string;
}
