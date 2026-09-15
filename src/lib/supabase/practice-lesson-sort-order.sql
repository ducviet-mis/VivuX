-- FlyDo: chạy toàn bộ tệp này một lần trong Supabase SQL Editor.
-- Tệp thêm thứ tự hiển thị cho các bài tự luyện và cho phép ADMIN đổi vị trí bằng nút lên/xuống.

ALTER TABLE public.practice_lessons
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Gán thứ tự ban đầu một cách tự nhiên: Bài 2 đứng trước Bài 10.
WITH ranked_lessons AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY grade, chapter
      ORDER BY
        COALESCE(NULLIF(regexp_replace(title, '\D', '', 'g'), '')::INTEGER, 999999),
        title,
        id
    ) AS next_sort_order
  FROM public.practice_lessons
)
UPDATE public.practice_lessons AS lesson
SET sort_order = ranked_lessons.next_sort_order
FROM ranked_lessons
WHERE lesson.id = ranked_lessons.id
  AND lesson.sort_order IS NULL;

ALTER TABLE public.practice_lessons
  ALTER COLUMN sort_order SET DEFAULT 0;

CREATE INDEX IF NOT EXISTS practice_lessons_display_order_index
  ON public.practice_lessons (grade, chapter, sort_order, title);

CREATE OR REPLACE FUNCTION public.reorder_practice_lesson(
  p_lesson_id TEXT,
  p_target_lesson_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson_grade INTEGER;
  v_lesson_chapter TEXT;
  v_lesson_sort_order INTEGER;
  v_target_grade INTEGER;
  v_target_chapter TEXT;
  v_target_sort_order INTEGER;
BEGIN
  IF COALESCE(auth.jwt() ->> 'email', '') NOT IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com') THEN
    RAISE EXCEPTION 'Bạn không có quyền sắp xếp bài học';
  END IF;

  SELECT grade, chapter, sort_order
  INTO v_lesson_grade, v_lesson_chapter, v_lesson_sort_order
  FROM public.practice_lessons
  WHERE id = p_lesson_id;

  SELECT grade, chapter, sort_order
  INTO v_target_grade, v_target_chapter, v_target_sort_order
  FROM public.practice_lessons
  WHERE id = p_target_lesson_id;

  IF v_lesson_grade IS NULL OR v_target_grade IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy bài học cần sắp xếp';
  END IF;

  IF v_lesson_grade <> v_target_grade OR v_lesson_chapter IS DISTINCT FROM v_target_chapter THEN
    RAISE EXCEPTION 'Chỉ có thể đổi thứ tự các bài cùng một chương';
  END IF;

  UPDATE public.practice_lessons
  SET sort_order = CASE
    WHEN id = p_lesson_id THEN v_target_sort_order
    WHEN id = p_target_lesson_id THEN v_lesson_sort_order
    ELSE sort_order
  END
  WHERE id IN (p_lesson_id, p_target_lesson_id);
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_practice_lesson(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_practice_lesson(TEXT, TEXT) TO authenticated;
