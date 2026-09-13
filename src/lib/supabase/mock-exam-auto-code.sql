-- FlyDo: mã đề nội bộ được tạo tự động.
-- Chạy toàn bộ tệp này một lần trong Supabase SQL Editor.
-- Người quản trị không còn cần nhập hoặc ghi nhớ mã đề.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.generate_mock_exam_code()
RETURNS TEXT
LANGUAGE SQL
VOLATILE
AS $$
  SELECT 'FLY-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12));
$$;

ALTER TABLE public.mock_exams
  ALTER COLUMN code SET DEFAULT public.generate_mock_exam_code();
