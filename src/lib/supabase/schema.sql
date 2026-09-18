-- =============================================
-- FlyDo Database Schema
-- Chạy SQL này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- =============================================

-- ========== 1. PROFILES (Thông tin người dùng) ==========
-- Mọi tài khoản thường có cùng quyền sử dụng. ADMIN được nhận diện riêng
-- trong ứng dụng bằng email quản trị, không dùng cột role.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
    COALESCE(
      NULLIF(NEW.email, ''),
      NULLIF(NEW.raw_user_meta_data->>'email', '')
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', '')
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========== 1B. ACTIVE_ACCOUNT_SESSIONS (Mỗi tài khoản một phiên) ==========
CREATE TABLE IF NOT EXISTS public.active_account_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.active_account_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own active session" ON public.active_account_sessions;
CREATE POLICY "Users can read own active session"
ON public.active_account_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'active_account_sessions'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.active_account_sessions;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_current_session(
  p_session_id TEXT,
  p_replace BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_active_session_id TEXT;
BEGIN
  IF v_user_id IS NULL OR NULLIF(BTRIM(p_session_id), '') IS NULL THEN
    RETURN jsonb_build_object('active', FALSE);
  END IF;

  INSERT INTO public.active_account_sessions (user_id, session_id)
  VALUES (v_user_id, p_session_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT session_id INTO v_active_session_id
  FROM public.active_account_sessions
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF p_replace THEN
    UPDATE public.active_account_sessions
    SET session_id = p_session_id, updated_at = NOW()
    WHERE user_id = v_user_id;
    v_active_session_id := p_session_id;
  END IF;

  RETURN jsonb_build_object('active', v_active_session_id = p_session_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_current_session(p_session_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count BIGINT;
BEGIN
  DELETE FROM public.active_account_sessions
  WHERE user_id = auth.uid() AND session_id = p_session_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_my_active_session()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.active_account_sessions WHERE user_id = auth.uid();
$$;

REVOKE ALL ON TABLE public.active_account_sessions FROM anon, authenticated;
GRANT SELECT ON TABLE public.active_account_sessions TO authenticated;
REVOKE ALL ON FUNCTION public.register_current_session(TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_current_session(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_my_active_session() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_current_session(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_current_session(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_my_active_session() TO authenticated;

-- ========== 2. STREAK (Chuỗi ngày rèn luyện) ==========
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  last_login_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 3. DAILY_GOALS (Mục tiêu ngày) ==========
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  target_minutes INT DEFAULT 60,
  target_questions INT DEFAULT 30,
  target_accuracy INT DEFAULT 80,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 4. PRACTICE_PROGRESS (Tiến trình tự luyện) ==========
CREATE TABLE IF NOT EXISTS practice_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_answer INT NOT NULL,
  practiced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ========== 5. WRONG_NOTEBOOK (Sổ câu sai) ==========
CREATE TABLE IF NOT EXISTS wrong_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_content TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_corrected BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ========== ROW LEVEL SECURITY (RLS) ==========
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_notebook ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Mỗi tài khoản chỉ quản lý dữ liệu học tập của chính mình
CREATE POLICY "Users manage own streak" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON daily_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own progress" ON practice_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wrong notebook" ON wrong_notebook FOR ALL USING (auth.uid() = user_id);

-- ========== STORAGE BUCKET ==========
-- Bucket dùng chung cho ảnh đại diện và các tệp nội dung của FlyDo.
INSERT INTO storage.buckets (id, name, public) VALUES ('edu-tutor', 'edu-tutor', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT USING (bucket_id = 'edu-tutor');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'edu-tutor' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (
  bucket_id = 'edu-tutor' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (
  bucket_id = 'edu-tutor' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sau khi chạy file này, chạy tiếp subscription-schema.sql
-- để bổ sung FlyGo, FlyMax, FlyInfinity, mã quà tặng và thanh toán.
