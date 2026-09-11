-- FlyDo: cấu trúc dữ liệu cho Thi thử theo học kỳ và chuyên đề.
-- Chạy toàn bộ tệp này trong Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.mock_exam_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade SMALLINT NOT NULL CHECK (grade IN (6, 7, 8, 9)),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (grade, name)
);

CREATE TABLE IF NOT EXISTS public.mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  grade SMALLINT NOT NULL CHECK (grade IN (6, 7, 8, 9)),
  title TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  category TEXT NOT NULL DEFAULT 'midterm_1' CHECK (category IN ('midterm_1', 'final_1', 'midterm_2', 'final_2', 'topic')),
  topic_id UUID REFERENCES public.mock_exam_topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bổ sung cấu trúc mới cho bảng mock_exams đã tạo từ trước.
ALTER TABLE public.mock_exams ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'midterm_1';
ALTER TABLE public.mock_exams ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.mock_exam_topics(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mock_exams_category_check') THEN
    ALTER TABLE public.mock_exams ADD CONSTRAINT mock_exams_category_check
      CHECK (category IN ('midterm_1', 'final_1', 'midterm_2', 'final_2', 'topic'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS mock_exams_browse_index ON public.mock_exams (grade, category, topic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mock_exam_topics_grade_index ON public.mock_exam_topics (grade, sort_order, name);

-- Hai bảng dưới đây chỉ được tạo nếu dự án chưa có phần Thi thử trước đó.
CREATE TABLE IF NOT EXISTS public.mock_exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  solution TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
  score NUMERIC(4, 2) NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mock_exam_questions_exam_index ON public.mock_exam_questions (exam_id, order_index);
CREATE INDEX IF NOT EXISTS mock_exam_attempts_user_exam_index ON public.mock_exam_attempts (user_id, exam_id, created_at DESC);

ALTER TABLE public.mock_exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read mock exam topics" ON public.mock_exam_topics;
DROP POLICY IF EXISTS "Admin manage mock exam topics" ON public.mock_exam_topics;
DROP POLICY IF EXISTS "Public read mock exams" ON public.mock_exams;
DROP POLICY IF EXISTS "Admin manage mock exams" ON public.mock_exams;
DROP POLICY IF EXISTS "Authenticated read mock exam questions" ON public.mock_exam_questions;
DROP POLICY IF EXISTS "Admin manage mock exam questions" ON public.mock_exam_questions;
DROP POLICY IF EXISTS "Users read own mock exam attempts" ON public.mock_exam_attempts;
DROP POLICY IF EXISTS "Users create own mock exam attempts" ON public.mock_exam_attempts;

CREATE POLICY "Public read mock exam topics" ON public.mock_exam_topics FOR SELECT USING (true);
CREATE POLICY "Admin manage mock exam topics" ON public.mock_exam_topics FOR ALL
  USING (auth.jwt() ->> 'email' IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'));

CREATE POLICY "Public read mock exams" ON public.mock_exams FOR SELECT USING (true);
CREATE POLICY "Admin manage mock exams" ON public.mock_exams FOR ALL
  USING (auth.jwt() ->> 'email' IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'));

-- Ứng dụng hiện chấm điểm ở trình duyệt nên cần đọc câu hỏi sau khi đăng nhập.
CREATE POLICY "Authenticated read mock exam questions" ON public.mock_exam_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage mock exam questions" ON public.mock_exam_questions FOR ALL
  USING (auth.jwt() ->> 'email' IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'));

CREATE POLICY "Users read own mock exam attempts" ON public.mock_exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own mock exam attempts" ON public.mock_exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
