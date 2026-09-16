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

-- Tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Người dùng'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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
