-- =============================================
-- VivuX Database Schema
-- Chạy SQL này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- =============================================

-- ========== 1. PROFILES (Thông tin người dùng) ==========
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Người dùng'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========== 2. CLASSES (Lớp học) ==========
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 4),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  password TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 6),
  invite_token TEXT DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 3. CLASS_MEMBERS (Học sinh trong lớp) ==========
CREATE TABLE IF NOT EXISTS class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- ========== 4. ANNOUNCEMENTS (Thông báo lớp) ==========
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 5. SCHEDULE (Lịch học) ==========
CREATE TABLE IF NOT EXISTS schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  has_class BOOLEAN DEFAULT TRUE,
  note TEXT,
  UNIQUE(class_id, date)
);

-- ========== 6. ATTENDANCE (Điểm danh) ==========
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'excused', 'absent', 'makeup')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, date)
);

-- ========== 7. MONTHLY_REVIEWS (Nhận xét tháng) ==========
CREATE TABLE IF NOT EXISTS monthly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,  -- Format: '2026-09'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, month)
);

-- ========== 8. RESOURCES (Tài liệu lớp học) ==========
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('document', 'video', 'exam')),
  url TEXT NOT NULL,
  folder TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 9. EXAMS (Đề thi) ==========
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pdf_url TEXT,
  duration_minutes INT NOT NULL DEFAULT 45,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('mcq', 'tf', 'short')),
  answer_keys JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 10. EXAM_RESULTS (Kết quả thi) ==========
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]',
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  flagged_questions JSONB DEFAULT '[]',
  time_taken INT DEFAULT 0,  -- seconds
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- ========== 11. TUITION_CONFIG (Cấu hình học phí) ==========
CREATE TABLE IF NOT EXISTS tuition_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  fee_per_session INT NOT NULL DEFAULT 0,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  qr_image_url TEXT,
  UNIQUE(teacher_id, class_id)
);

-- ========== 12. STREAK (Chuỗi ngày rèn luyện) ==========
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  last_login_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 13. DAILY_GOALS (Mục tiêu ngày) ==========
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  target_minutes INT DEFAULT 60,
  target_questions INT DEFAULT 30,
  target_accuracy INT DEFAULT 80,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 14. PRACTICE_PROGRESS (Tiến trình tự luyện) ==========
CREATE TABLE IF NOT EXISTS practice_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_answer INT NOT NULL,
  practiced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ========== 15. WRONG_NOTEBOOK (Sổ câu sai) ==========
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_notebook ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Classes: Teachers create, everyone can read
CREATE POLICY "Classes are viewable by everyone" ON classes FOR SELECT USING (true);
CREATE POLICY "Teachers can create classes" ON classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own classes" ON classes FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete own classes" ON classes FOR DELETE USING (auth.uid() = teacher_id);

-- Class Members: Members can read, students can join
CREATE POLICY "Class members are viewable by class participants" ON class_members FOR SELECT USING (true);
CREATE POLICY "Students can join classes" ON class_members FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can manage members" ON class_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_members.class_id AND classes.teacher_id = auth.uid())
);
CREATE POLICY "Members can leave" ON class_members FOR DELETE USING (auth.uid() = student_id);

-- Announcements: Class participants can read, teachers can write
CREATE POLICY "Announcements viewable by all" ON announcements FOR SELECT USING (true);
CREATE POLICY "Teachers can post announcements" ON announcements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = announcements.class_id AND classes.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update announcements" ON announcements FOR UPDATE USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = announcements.class_id AND classes.teacher_id = auth.uid())
);

-- Schedule: Viewable by all, managed by teachers
CREATE POLICY "Schedule viewable by all" ON schedule FOR SELECT USING (true);
CREATE POLICY "Teachers manage schedule" ON schedule FOR ALL USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = schedule.class_id AND classes.teacher_id = auth.uid())
);

-- Attendance: Viewable by class participants, managed by teachers
CREATE POLICY "Attendance viewable by all" ON attendance FOR SELECT USING (true);
CREATE POLICY "Teachers manage attendance" ON attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = attendance.class_id AND classes.teacher_id = auth.uid())
);

-- Monthly Reviews
CREATE POLICY "Reviews viewable by all" ON monthly_reviews FOR SELECT USING (true);
CREATE POLICY "Teachers write reviews" ON monthly_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = monthly_reviews.class_id AND classes.teacher_id = auth.uid())
);

-- Resources
CREATE POLICY "Resources viewable by all" ON resources FOR SELECT USING (true);
CREATE POLICY "Teachers manage resources" ON resources FOR ALL USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = resources.class_id AND classes.teacher_id = auth.uid())
);

-- Exams
CREATE POLICY "Exams viewable by all" ON exams FOR SELECT USING (true);
CREATE POLICY "Teachers manage exams" ON exams FOR ALL USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = exams.class_id AND classes.teacher_id = auth.uid())
);

-- Exam Results: Students see own, teachers see all in their classes
CREATE POLICY "Students see own results" ON exam_results FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers see class results" ON exam_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exams
    JOIN classes ON classes.id = exams.class_id
    WHERE exams.id = exam_results.exam_id AND classes.teacher_id = auth.uid()
  )
);
CREATE POLICY "Students submit results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Tuition Config: Only teachers
CREATE POLICY "Teachers manage tuition" ON tuition_config FOR ALL USING (auth.uid() = teacher_id);

-- Streaks: Only own data
CREATE POLICY "Users manage own streak" ON streaks FOR ALL USING (auth.uid() = user_id);

-- Daily Goals: Only own data
CREATE POLICY "Users manage own goals" ON daily_goals FOR ALL USING (auth.uid() = user_id);

-- Practice Progress: Only own data
CREATE POLICY "Users manage own progress" ON practice_progress FOR ALL USING (auth.uid() = user_id);

-- Wrong Notebook: Only own data
CREATE POLICY "Users manage own wrong notebook" ON wrong_notebook FOR ALL USING (auth.uid() = user_id);

-- ========== STORAGE BUCKET ==========
-- Tạo bucket cho upload PDF và ảnh QR
INSERT INTO storage.buckets (id, name, public) VALUES ('edu-tutor', 'edu-tutor', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
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
