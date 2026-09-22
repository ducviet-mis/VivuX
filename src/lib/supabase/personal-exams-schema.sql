-- FlyDo: Lưu mẫu "Tạo đề cá nhân" cho FlyMax và FlyInfinity.
-- Chạy TOÀN BỘ tệp này một lần trong Supabase SQL Editor.
-- Câu hỏi không được sao chép vào đây: mỗi lần tạo đề, web lấy ngẫu nhiên
-- trực tiếp từ ngân hàng practice_questions (Tự luyện) hiện có.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.personal_exam_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  grade SMALLINT NOT NULL CHECK (grade IN (6, 7, 8, 9)),
  mode TEXT NOT NULL DEFAULT 'exam' CHECK (mode IN ('practice', 'exam')),
  chapter_weights JSONB NOT NULL DEFAULT '[]'::jsonb,
  level_weights JSONB NOT NULL DEFAULT '{"1": 30, "2": 40, "3": 25, "4": 5}'::jsonb,
  question_count SMALLINT NOT NULL CHECK (question_count BETWEEN 5 AND 100),
  duration_minutes SMALLINT NOT NULL CHECK (duration_minutes BETWEEN 5 AND 180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT personal_exam_templates_user_name_key UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS personal_exam_templates_user_updated_index
  ON public.personal_exam_templates (user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.set_personal_exam_template_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS personal_exam_templates_set_updated_at ON public.personal_exam_templates;
CREATE TRIGGER personal_exam_templates_set_updated_at
  BEFORE UPDATE ON public.personal_exam_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_personal_exam_template_updated_at();

-- Quyền này ở database để người dùng FlyGo không thể tự gửi request lưu mẫu.
CREATE OR REPLACE FUNCTION public.can_manage_personal_exam_templates()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND (
        account_tier = 'flyinfinity'
        OR (account_tier = 'flymax' AND subscription_expires_at > NOW())
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_manage_personal_exam_templates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_personal_exam_templates() TO authenticated;

ALTER TABLE public.personal_exam_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own personal exam templates" ON public.personal_exam_templates;
DROP POLICY IF EXISTS "Paid users create personal exam templates" ON public.personal_exam_templates;
DROP POLICY IF EXISTS "Paid users update own personal exam templates" ON public.personal_exam_templates;
DROP POLICY IF EXISTS "Users delete own personal exam templates" ON public.personal_exam_templates;

CREATE POLICY "Users read own personal exam templates"
  ON public.personal_exam_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Paid users create personal exam templates"
  ON public.personal_exam_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.can_manage_personal_exam_templates()
  );

CREATE POLICY "Paid users update own personal exam templates"
  ON public.personal_exam_templates FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND public.can_manage_personal_exam_templates()
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.can_manage_personal_exam_templates()
  );

-- Người dùng vẫn có thể xóa mẫu cũ sau khi gói FlyMax đã hết hạn.
CREATE POLICY "Users delete own personal exam templates"
  ON public.personal_exam_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.personal_exam_templates TO authenticated;

