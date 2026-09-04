-- Tạo bucket lưu trữ ảnh cho Cẩm nang
INSERT INTO storage.buckets (id, name, public)
VALUES ('handbook_images', 'handbook_images', true);

-- Cho phép tất cả mọi người được xem ảnh
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'handbook_images' );

-- Cho phép tất cả mọi người được upload ảnh (Tạm thời để test dễ dàng, sau này có thể khóa lại bằng auth.uid())
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'handbook_images' );

-- Bổ sung cột lưu lời giới thiệu tác giả (author_bio) nếu chưa có
ALTER TABLE handbook_posts ADD COLUMN IF NOT EXISTS author_bio TEXT;
