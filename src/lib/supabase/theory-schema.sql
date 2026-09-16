-- FlyDo: Lý thuyết và kiểm tra lý thuyết.
-- Chạy toàn bộ tệp này một lần trong Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.theory_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 6 AND 9),
  chapter TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  chapter_sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.theory_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.theory_lessons(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('true_false', 'drag_fill')),
  prompt TEXT NOT NULL,
  data JSONB NOT NULL,
  solution TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS theory_lessons_display_index
  ON public.theory_lessons (grade, chapter_sort_order, chapter, sort_order);
CREATE INDEX IF NOT EXISTS theory_questions_lesson_order_index
  ON public.theory_questions (lesson_id, order_index);

ALTER TABLE public.theory_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theory_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published theory lessons" ON public.theory_lessons;
DROP POLICY IF EXISTS "Admin manage theory lessons" ON public.theory_lessons;
DROP POLICY IF EXISTS "Public read theory questions" ON public.theory_questions;
DROP POLICY IF EXISTS "Admin manage theory questions" ON public.theory_questions;

CREATE POLICY "Public read published theory lessons" ON public.theory_lessons
  FOR SELECT USING (
    is_published = TRUE
    OR COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com')
  );

CREATE POLICY "Admin manage theory lessons" ON public.theory_lessons
  FOR ALL
  USING (COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'))
  WITH CHECK (COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'));

CREATE POLICY "Public read theory questions" ON public.theory_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.theory_lessons
      WHERE theory_lessons.id = theory_questions.lesson_id
        AND theory_lessons.is_published = TRUE
    )
  );

CREATE POLICY "Admin manage theory questions" ON public.theory_questions
  FOR ALL
  USING (COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'))
  WITH CHECK (COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com'));

CREATE OR REPLACE FUNCTION public.import_theory_questions_json(
  p_lesson_id UUID,
  p_questions JSONB DEFAULT '[]'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_type TEXT;
  v_prompt TEXT;
  v_data JSONB;
  v_solution TEXT;
  v_order INTEGER;
  v_inserted INTEGER := 0;
BEGIN
  IF COALESCE(auth.jwt() ->> 'email', '') NOT IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com') THEN
    RAISE EXCEPTION 'Bạn không có quyền nhập câu hỏi lý thuyết';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.theory_lessons WHERE id = p_lesson_id) THEN
    RAISE EXCEPTION 'Không tìm thấy bài lý thuyết đã chọn';
  END IF;
  IF jsonb_typeof(p_questions) <> 'array' OR jsonb_array_length(p_questions) = 0 THEN
    RAISE EXCEPTION 'Danh sách câu hỏi phải là một mảng JSON không rỗng';
  END IF;
  IF jsonb_array_length(p_questions) > 100 THEN
    RAISE EXCEPTION 'Mỗi lượt chỉ được nhập tối đa 100 câu';
  END IF;

  SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_order
  FROM public.theory_questions WHERE lesson_id = p_lesson_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_questions)
  LOOP
    v_type := v_item ->> 'question_type';
    v_prompt := NULLIF(BTRIM(v_item ->> 'prompt'), '');
    v_data := v_item -> 'data';
    v_solution := COALESCE(v_item ->> 'solution', '');

    IF v_type NOT IN ('true_false', 'drag_fill') OR v_prompt IS NULL OR jsonb_typeof(v_data) <> 'object' THEN
      RAISE EXCEPTION 'Có câu hỏi thiếu hoặc sai question_type, prompt hay data';
    END IF;
    IF v_type = 'true_false'
      AND (jsonb_typeof(v_data -> 'statements') <> 'array' OR jsonb_array_length(v_data -> 'statements') NOT BETWEEN 2 AND 6) THEN
      RAISE EXCEPTION 'Câu Đúng/Sai phải có từ 2 đến 6 mệnh đề';
    END IF;
    IF v_type = 'drag_fill'
      AND (NULLIF(v_data ->> 'template', '') IS NULL
        OR jsonb_typeof(v_data -> 'options') <> 'array'
        OR jsonb_typeof(v_data -> 'answers') <> 'array') THEN
      RAISE EXCEPTION 'Câu kéo-thả thiếu template, options hoặc answers';
    END IF;

    INSERT INTO public.theory_questions (lesson_id, question_type, prompt, data, solution, order_index)
    VALUES (p_lesson_id, v_type, v_prompt, v_data, v_solution, v_order);
    v_order := v_order + 1;
    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.import_theory_questions_json(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_theory_questions_json(UUID, JSONB) TO authenticated;
