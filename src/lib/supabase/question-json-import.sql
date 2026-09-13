-- FlyDo: nhập hàng loạt câu hỏi bằng JSON từ trang ADMIN.
-- Chạy toàn bộ tệp này một lần trong Supabase SQL Editor.
-- Hàm dưới đây là giao dịch: một câu lỗi thì không câu nào được lưu.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Bảng Tự luyện (chỉ tạo khi dự án chưa có bảng này).
CREATE TABLE IF NOT EXISTS public.practice_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lesson_id TEXT NOT NULL REFERENCES public.practice_lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer SMALLINT NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  solution TEXT NOT NULL DEFAULT '',
  has_math BOOLEAN NOT NULL DEFAULT FALSE,
  difficulty_level SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 4),
  order_index INTEGER NOT NULL DEFAULT 0,
  diagram JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Các cột này giúp tương thích với bảng đã tạo từ các bản FlyDo trước.
ALTER TABLE public.practice_questions ADD COLUMN IF NOT EXISTS has_math BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.practice_questions ADD COLUMN IF NOT EXISTS difficulty_level SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE public.practice_questions ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.practice_questions ADD COLUMN IF NOT EXISTS diagram JSONB;
ALTER TABLE public.mock_exam_questions ADD COLUMN IF NOT EXISTS diagram JSONB;

CREATE INDEX IF NOT EXISTS practice_questions_lesson_order_index
  ON public.practice_questions (lesson_id, difficulty_level, order_index);

ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read practice questions" ON public.practice_questions;
DROP POLICY IF EXISTS "Admin manage practice questions" ON public.practice_questions;

CREATE POLICY "Public read practice questions" ON public.practice_questions
  FOR SELECT USING (true);

CREATE POLICY "Admin manage practice questions" ON public.practice_questions
  FOR ALL
  USING (COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'))
  WITH CHECK (COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'));

CREATE OR REPLACE FUNCTION public.import_questions_json(
  p_target TEXT,
  p_lesson_id TEXT DEFAULT NULL,
  p_exam_id UUID DEFAULT NULL,
  p_level SMALLINT DEFAULT NULL,
  p_questions JSONB DEFAULT '[]'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_content TEXT;
  v_options JSONB;
  v_correct_answer INTEGER;
  v_solution TEXT;
  v_order INTEGER;
  v_inserted INTEGER := 0;
  v_has_math BOOLEAN;
BEGIN
  IF COALESCE(auth.jwt() ->> 'email', '') NOT IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com') THEN
    RAISE EXCEPTION 'Bạn không có quyền nhập câu hỏi';
  END IF;

  IF p_target NOT IN ('practice', 'mock_exam') THEN
    RAISE EXCEPTION 'Loại nội dung không hợp lệ';
  END IF;

  IF jsonb_typeof(p_questions) <> 'array' OR jsonb_array_length(p_questions) = 0 THEN
    RAISE EXCEPTION 'Danh sách câu hỏi phải là một mảng JSON không rỗng';
  END IF;

  IF jsonb_array_length(p_questions) > 100 THEN
    RAISE EXCEPTION 'Mỗi lượt chỉ được nhập tối đa 100 câu';
  END IF;

  IF p_target = 'practice' THEN
    IF p_lesson_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.practice_lessons WHERE id = p_lesson_id) THEN
      RAISE EXCEPTION 'Không tìm thấy bài tự luyện đã chọn';
    END IF;
    IF p_level IS NULL OR p_level NOT BETWEEN 1 AND 4 THEN
      RAISE EXCEPTION 'Level tự luyện phải từ 1 đến 4';
    END IF;
    SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_order
    FROM public.practice_questions WHERE lesson_id = p_lesson_id AND difficulty_level = p_level;
  ELSE
    IF p_exam_id IS NULL THEN
      RAISE EXCEPTION 'Chưa chọn đề thi thử';
    END IF;
    -- Khóa đề trong lúc nhập để không bị trùng thứ tự nếu mở hai lượt nhập cùng lúc.
    PERFORM 1 FROM public.mock_exams WHERE id = p_exam_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Không tìm thấy đề thi thử đã chọn';
    END IF;
    SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_order
    FROM public.mock_exam_questions WHERE exam_id = p_exam_id;
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_questions)
  LOOP
    v_content := NULLIF(BTRIM(v_item ->> 'content'), '');
    v_options := v_item -> 'options';
    v_correct_answer := NULLIF(v_item ->> 'correct_answer', '')::INTEGER;
    v_solution := COALESCE(v_item ->> 'solution', '');

    IF v_content IS NULL THEN
      RAISE EXCEPTION 'Có câu hỏi thiếu nội dung';
    END IF;
    IF jsonb_typeof(v_options) <> 'array' OR jsonb_array_length(v_options) <> 4 THEN
      RAISE EXCEPTION 'Mỗi câu phải có đúng 4 phương án';
    END IF;
    IF v_correct_answer NOT BETWEEN 0 AND 3 THEN
      RAISE EXCEPTION 'Đáp án đúng của mỗi câu phải từ 0 đến 3';
    END IF;

    v_has_math := v_content ~ '\\$|\\\\|\^|_' OR v_solution ~ '\\$|\\\\|\^|_';

    IF p_target = 'practice' THEN
      INSERT INTO public.practice_questions (
        lesson_id, content, options, correct_answer, solution, has_math, difficulty_level, order_index, diagram
      ) VALUES (
        p_lesson_id, v_content, v_options, v_correct_answer, v_solution, v_has_math, p_level, v_order, v_item -> 'diagram'
      );
    ELSE
      INSERT INTO public.mock_exam_questions (
        exam_id, content, options, correct_answer, solution, order_index, diagram
      ) VALUES (
        p_exam_id, v_content, v_options, v_correct_answer, v_solution, v_order, v_item -> 'diagram'
      );
    END IF;

    v_order := v_order + 1;
    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.import_questions_json(TEXT, TEXT, UUID, SMALLINT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_questions_json(TEXT, TEXT, UUID, SMALLINT, JSONB) TO authenticated;
