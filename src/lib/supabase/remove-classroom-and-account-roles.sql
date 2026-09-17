-- ================================================================
-- FlyDo: gỡ tính năng Lớp học và vai trò Giáo viên/Học sinh
-- Chạy MỘT LẦN trong Supabase SQL Editor cho cơ sở dữ liệu đang hoạt động.
--
-- CẢNH BÁO: Script này xóa vĩnh viễn dữ liệu của tính năng lớp học cũ.
-- Hãy sao lưu trước nếu bạn còn cần lịch học, điểm danh, tài liệu hoặc kết quả lớp.
-- ADMIN không bị ảnh hưởng vì ứng dụng nhận diện ADMIN bằng email quản trị.
-- ================================================================

BEGIN;

-- Tài khoản mới chỉ còn thông tin chung, không còn metadata role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'Người dùng'
    ),
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', '')
    )
  );
  RETURN NEW;
END;
$$;

-- Xóa các bảng theo thứ tự phụ thuộc, chỉ thuộc hệ thống lớp học cũ.
DROP TABLE IF EXISTS public.tuition_config CASCADE;
DROP TABLE IF EXISTS public.exam_results CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.monthly_reviews CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.schedule CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;

-- Xóa vai trò khỏi hồ sơ và metadata xác thực hiện có.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'role'
WHERE COALESCE(raw_user_meta_data, '{}'::jsonb) ? 'role';

COMMIT;
