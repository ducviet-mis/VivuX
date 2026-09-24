-- Chạy MỘT LẦN trong Supabase SQL Editor sau khi đã cài:
-- subscription-schema.sql và flytiee-events-schema.sql.
-- Chỉ hai tài khoản ADMIN hiện tại được xem, phát hành và tạm khóa mã.
-- Người học không thể liệt kê hay tạo giftcode; họ chỉ đổi mã qua RPC hiện có.

CREATE OR REPLACE FUNCTION public.flydo_is_gift_code_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN
      ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com');
$$;

REVOKE ALL ON FUNCTION public.flydo_is_gift_code_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.flydo_is_gift_code_admin() TO authenticated;

ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.gift_codes TO authenticated;
DROP POLICY IF EXISTS "ADMIN view FlyMax gift codes" ON public.gift_codes;
CREATE POLICY "ADMIN view FlyMax gift codes"
  ON public.gift_codes FOR SELECT TO authenticated
  USING (public.flydo_is_gift_code_admin());
DROP POLICY IF EXISTS "ADMIN create FlyMax gift codes" ON public.gift_codes;
CREATE POLICY "ADMIN create FlyMax gift codes"
  ON public.gift_codes FOR INSERT TO authenticated
  WITH CHECK (public.flydo_is_gift_code_admin());
DROP POLICY IF EXISTS "ADMIN update FlyMax gift codes" ON public.gift_codes;
CREATE POLICY "ADMIN update FlyMax gift codes"
  ON public.gift_codes FOR UPDATE TO authenticated
  USING (public.flydo_is_gift_code_admin())
  WITH CHECK (public.flydo_is_gift_code_admin());

ALTER TABLE public.flytiee_gift_codes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.flytiee_gift_codes TO authenticated;
DROP POLICY IF EXISTS "ADMIN view FlyTiee gift codes" ON public.flytiee_gift_codes;
CREATE POLICY "ADMIN view FlyTiee gift codes"
  ON public.flytiee_gift_codes FOR SELECT TO authenticated
  USING (public.flydo_is_gift_code_admin());
DROP POLICY IF EXISTS "ADMIN create FlyTiee gift codes" ON public.flytiee_gift_codes;
CREATE POLICY "ADMIN create FlyTiee gift codes"
  ON public.flytiee_gift_codes FOR INSERT TO authenticated
  WITH CHECK (public.flydo_is_gift_code_admin());
DROP POLICY IF EXISTS "ADMIN update FlyTiee gift codes" ON public.flytiee_gift_codes;
CREATE POLICY "ADMIN update FlyTiee gift codes"
  ON public.flytiee_gift_codes FOR UPDATE TO authenticated
  USING (public.flydo_is_gift_code_admin())
  WITH CHECK (public.flydo_is_gift_code_admin());
