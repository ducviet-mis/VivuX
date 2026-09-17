-- ================================================================
-- FlyDo: xóa toàn bộ câu hỏi của một Level trong một bài Tự luyện
-- Chạy toàn bộ tệp này một lần trong Supabase SQL Editor.
-- Chỉ hai email ADMIN hiện tại mới được phép gọi hàm.
-- ================================================================

CREATE OR REPLACE FUNCTION public.delete_practice_level(
  p_lesson_id TEXT,
  p_level SMALLINT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER := 0;
BEGIN
  IF COALESCE(auth.jwt() ->> 'email', '') NOT IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com') THEN
    RAISE EXCEPTION 'Bạn không có quyền xóa câu hỏi theo Level';
  END IF;

  IF p_lesson_id IS NULL OR BTRIM(p_lesson_id) = '' THEN
    RAISE EXCEPTION 'Chưa chọn bài tự luyện';
  END IF;

  IF p_level IS NULL OR p_level NOT BETWEEN 1 AND 4 THEN
    RAISE EXCEPTION 'Level phải nằm trong khoảng từ 1 đến 4';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.practice_lessons WHERE id = p_lesson_id) THEN
    RAISE EXCEPTION 'Không tìm thấy bài tự luyện đã chọn';
  END IF;

  -- Dọn dữ liệu người học trước để không còn tiến độ/câu đã lưu mồ côi.
  IF to_regclass('public.practice_progress') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.practice_progress WHERE lesson_id = $1 AND difficulty_level = $2'
      USING p_lesson_id, p_level;
  END IF;

  IF to_regclass('public.saved_questions') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.saved_questions WHERE lesson_id = $1 AND difficulty_level = $2'
      USING p_lesson_id, p_level;
  END IF;

  DELETE FROM public.practice_questions
  WHERE lesson_id = p_lesson_id
    AND difficulty_level = p_level;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_practice_level(TEXT, SMALLINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_practice_level(TEXT, SMALLINT) TO authenticated;
