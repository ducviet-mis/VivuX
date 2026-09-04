CREATE TABLE handbook_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Toán & Đời sống', 'Phương pháp học toán', 'Bản đồ lý thuyết')),
  title TEXT NOT NULL,
  sapo TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_url TEXT,
  author_name TEXT NOT NULL,
  read_time_minutes INTEGER DEFAULT 3,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE handbook_posts ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access to handbook posts" 
  ON handbook_posts FOR SELECT 
  USING (true);

-- Allow all access to admin (assuming anon key or simple rules for this prototype)
CREATE POLICY "Allow all access to admin" 
  ON handbook_posts FOR ALL 
  USING (true);
