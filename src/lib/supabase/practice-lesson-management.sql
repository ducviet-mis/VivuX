-- FlyDo: chạy tệp này trong Supabase SQL Editor trước khi đổi ID bài tự luyện từ Admin.
-- Hàm tạo bài mới, chuyển các dữ liệu liên quan, rồi xóa ID cũ trong cùng một giao dịch.

CREATE OR REPLACE FUNCTION public.rename_practice_lesson(
  p_old_lesson_id TEXT,
  p_new_lesson_id TEXT,
  p_chapter TEXT,
  p_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grade INTEGER;
BEGIN
  IF COALESCE(auth.jwt() ->> 'email', '') NOT IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com') THEN
    RAISE EXCEPTION 'Bạn không có quyền đổi ID bài học';
  END IF;

  SELECT grade INTO v_grade
  FROM public.practice_lessons
  WHERE id = p_old_lesson_id;

  IF v_grade IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy bài học có ID: %', p_old_lesson_id;
  END IF;

  IF p_new_lesson_id <> p_old_lesson_id
    AND EXISTS (SELECT 1 FROM public.practice_lessons WHERE id = p_new_lesson_id) THEN
    RAISE EXCEPTION 'ID bài học % đã tồn tại', p_new_lesson_id;
  END IF;

  -- Tạo bản ghi mới trước để các khóa ngoại (nếu có) luôn hợp lệ.
  IF p_new_lesson_id <> p_old_lesson_id THEN
    INSERT INTO public.practice_lessons (id, grade, chapter, title)
    VALUES (p_new_lesson_id, v_grade, p_chapter, p_title);

    IF to_regclass('public.practice_questions') IS NOT NULL THEN
      UPDATE public.practice_questions SET lesson_id = p_new_lesson_id WHERE lesson_id = p_old_lesson_id;
    END IF;
    IF to_regclass('public.practice_progress') IS NOT NULL THEN
      UPDATE public.practice_progress SET lesson_id = p_new_lesson_id WHERE lesson_id = p_old_lesson_id;
    END IF;
    IF to_regclass('public.saved_questions') IS NOT NULL THEN
      UPDATE public.saved_questions SET lesson_id = p_new_lesson_id WHERE lesson_id = p_old_lesson_id;
    END IF;

    DELETE FROM public.practice_lessons WHERE id = p_old_lesson_id;
  ELSE
    UPDATE public.practice_lessons
    SET chapter = p_chapter, title = p_title
    WHERE id = p_old_lesson_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.rename_practice_lesson(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rename_practice_lesson(TEXT, TEXT, TEXT, TEXT) TO authenticated;
