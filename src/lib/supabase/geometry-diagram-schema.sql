-- FlyDo: dữ liệu hình học có cấu trúc cho Tự luyện và Thi thử.
-- Chạy toàn bộ file này một lần trong Supabase SQL Editor.

ALTER TABLE IF EXISTS public.practice_questions
  ADD COLUMN IF NOT EXISTS diagram JSONB;

ALTER TABLE IF EXISTS public.mock_exam_questions
  ADD COLUMN IF NOT EXISTS diagram JSONB;

DO $$
BEGIN
  IF to_regclass('public.practice_questions') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'practice_questions_diagram_shape') THEN
    ALTER TABLE public.practice_questions
      ADD CONSTRAINT practice_questions_diagram_shape
      CHECK (diagram IS NULL OR (jsonb_typeof(diagram) = 'object' AND diagram ->> 'type' = 'geometry')) NOT VALID;
  END IF;

  IF to_regclass('public.mock_exam_questions') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mock_exam_questions_diagram_shape') THEN
    ALTER TABLE public.mock_exam_questions
      ADD CONSTRAINT mock_exam_questions_diagram_shape
      CHECK (diagram IS NULL OR (jsonb_typeof(diagram) = 'object' AND diagram ->> 'type' = 'geometry')) NOT VALID;
  END IF;
END $$;
