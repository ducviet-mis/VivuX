-- ================================================================
-- FlyDo Membership & Payment Schema
-- Chạy file này SAU schema.sql trong Supabase SQL Editor.
-- Có thể chạy lại an toàn khi cần cập nhật cấu trúc.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Bổ sung trạng thái tài khoản vào profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_tier TEXT NOT NULL DEFAULT 'flygo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_account_tier_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_tier_check
      CHECK (account_tier IN ('flygo', 'flymax', 'flyinfinity'));
  END IF;
END $$;

UPDATE public.profiles
SET account_tier = 'flygo'
WHERE account_tier IS NULL;

-- 2. Danh mục gói
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_tier TEXT NOT NULL CHECK (account_tier IN ('flygo', 'flymax', 'flyinfinity')),
  price_vnd INTEGER NOT NULL DEFAULT 0 CHECK (price_vnd >= 0),
  duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.subscription_plans (code, name, account_tier, price_vnd, duration_days, is_public)
VALUES
  ('flygo', 'FlyGo', 'flygo', 0, NULL, TRUE),
  ('flymax_monthly', 'FlyMax 1 tháng', 'flymax', 29000, 30, TRUE),
  ('flymax_yearly', 'FlyMax 1 năm', 'flymax', 199000, 365, TRUE),
  ('flyinfinity', 'FlyInfinity trọn đời', 'flyinfinity', 299000, NULL, TRUE),
  ('flymax_gift', 'FlyMax từ mã quà tặng', 'flymax', 0, NULL, FALSE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  account_tier = EXCLUDED.account_tier,
  price_vnd = EXCLUDED.price_vnd,
  duration_days = EXCLUDED.duration_days,
  is_public = EXCLUDED.is_public,
  updated_at = NOW();

-- 3. Lịch sử đăng ký
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES public.subscription_plans(code),
  source TEXT NOT NULL DEFAULT 'payment' CHECK (source IN ('payment', 'gift_code', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
  ON public.subscriptions(user_id, created_at DESC);

-- 4. Mã quà tặng và lịch sử đổi mã
CREATE TABLE IF NOT EXISTS public.gift_codes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flymax_days INTEGER NOT NULL CHECK (flymax_days > 0),
  max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT gift_codes_uppercase_check CHECK (code = UPPER(BTRIM(code)))
);

CREATE TABLE IF NOT EXISTS public.gift_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code TEXT NOT NULL REFERENCES public.gift_codes(code) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flymax_days INTEGER NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(gift_code, user_id)
);

CREATE INDEX IF NOT EXISTS gift_code_redemptions_user_id_idx
  ON public.gift_code_redemptions(user_id, redeemed_at DESC);

-- 5. Cấu hình chuyển khoản và yêu cầu thanh toán
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  qr_image_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.payment_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES public.subscription_plans(code),
  amount_vnd INTEGER NOT NULL CHECK (amount_vnd > 0),
  transfer_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  proof_url TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx
  ON public.payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx
  ON public.payment_orders(status, created_at DESC);

-- 6. RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active plans" ON public.subscription_plans;
CREATE POLICY "Public can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (is_public = TRUE AND is_active = TRUE);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Không tạo SELECT policy cho gift_codes để người dùng không thể dò toàn bộ mã.
DROP POLICY IF EXISTS "Users can view own gift redemptions" ON public.gift_code_redemptions;
CREATE POLICY "Users can view own gift redemptions"
  ON public.gift_code_redemptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view payment settings" ON public.payment_settings;
CREATE POLICY "Public can view payment settings"
  ON public.payment_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can view own payment orders" ON public.payment_orders;
CREATE POLICY "Users can view own payment orders"
  ON public.payment_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Chặn người dùng tự sửa cấp tài khoản qua API profiles.
-- Các hàm SECURITY DEFINER và service_role vẫn có thể cập nhật.
CREATE OR REPLACE FUNCTION public.protect_membership_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF CURRENT_USER IN ('anon', 'authenticated') THEN
    NEW.account_tier := OLD.account_tier;
    NEW.subscription_started_at := OLD.subscription_started_at;
    NEW.subscription_expires_at := OLD.subscription_expires_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_membership_columns_trigger ON public.profiles;
CREATE TRIGGER protect_membership_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_membership_columns();

-- 7. Đổi mã quà tặng: mỗi tài khoản dùng một mã tối đa một lần.
-- Thời hạn được cộng nối tiếp nếu người dùng vẫn còn FlyMax.
CREATE OR REPLACE FUNCTION public.redeem_gift_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code TEXT := UPPER(BTRIM(COALESCE(p_code, '')));
  v_gift public.gift_codes%ROWTYPE;
  v_current_tier TEXT;
  v_current_expires TIMESTAMPTZ;
  v_start_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_subscription_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn cần đăng nhập để sử dụng mã.');
  END IF;

  IF v_code = '' THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Vui lòng nhập mã quà tặng.');
  END IF;

  SELECT * INTO v_gift
  FROM public.gift_codes
  WHERE code = v_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mã quà tặng không tồn tại.');
  END IF;

  IF NOT v_gift.is_active THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mã quà tặng đã bị khóa.');
  END IF;

  IF v_gift.starts_at IS NOT NULL AND NOW() < v_gift.starts_at THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mã quà tặng chưa đến thời gian sử dụng.');
  END IF;

  IF v_gift.expires_at IS NOT NULL AND NOW() > v_gift.expires_at THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mã quà tặng đã hết hạn.');
  END IF;

  IF v_gift.max_redemptions IS NOT NULL AND v_gift.usage_count >= v_gift.max_redemptions THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mã quà tặng đã hết lượt sử dụng.');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.gift_code_redemptions
    WHERE gift_code = v_code AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn đã sử dụng mã quà tặng này rồi.');
  END IF;

  SELECT account_tier, subscription_expires_at
  INTO v_current_tier, v_current_expires
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Không tìm thấy hồ sơ tài khoản.');
  END IF;

  IF v_current_tier = 'flyinfinity' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', 'Tài khoản của bạn đã là FlyInfinity nên không cần dùng thêm mã FlyMax.'
    );
  END IF;

  v_start_at := GREATEST(NOW(), COALESCE(v_current_expires, NOW()));
  v_expires_at := v_start_at + make_interval(days => v_gift.flymax_days);

  INSERT INTO public.subscriptions (
    user_id, plan_code, source, status, starts_at, expires_at, metadata
  ) VALUES (
    v_user_id,
    'flymax_gift',
    'gift_code',
    'active',
    v_start_at,
    v_expires_at,
    jsonb_build_object('gift_code', v_code, 'days', v_gift.flymax_days)
  )
  RETURNING id INTO v_subscription_id;

  INSERT INTO public.gift_code_redemptions (
    gift_code, user_id, flymax_days, subscription_id
  ) VALUES (
    v_code, v_user_id, v_gift.flymax_days, v_subscription_id
  );

  UPDATE public.gift_codes
  SET usage_count = usage_count + 1
  WHERE code = v_code;

  UPDATE public.profiles
  SET
    account_tier = 'flymax',
    subscription_started_at = CASE
      WHEN subscription_expires_at IS NULL OR subscription_expires_at <= NOW() THEN NOW()
      ELSE COALESCE(subscription_started_at, NOW())
    END,
    subscription_expires_at = v_expires_at
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Đã cộng ' || v_gift.flymax_days || ' ngày FlyMax vào tài khoản.',
    'tier', 'flymax',
    'days', v_gift.flymax_days,
    'expires_at', v_expires_at
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn đã sử dụng mã quà tặng này rồi.');
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_gift_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_gift_code(TEXT) TO authenticated;

-- 8. Tạo yêu cầu thanh toán với giá lấy trực tiếp từ bảng gói.
CREATE OR REPLACE FUNCTION public.create_payment_order(p_plan_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_plan public.subscription_plans%ROWTYPE;
  v_order_id UUID;
  v_transfer_code TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn cần đăng nhập để tạo yêu cầu thanh toán.');
  END IF;

  SELECT * INTO v_plan
  FROM public.subscription_plans
  WHERE code = p_plan_code AND is_active = TRUE AND is_public = TRUE AND price_vnd > 0;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Gói đăng ký không hợp lệ.');
  END IF;

  v_transfer_code := 'FLYDO ' || UPPER(SUBSTRING(REPLACE(v_user_id::TEXT, '-', '') FROM 1 FOR 8));

  INSERT INTO public.payment_orders (user_id, plan_code, amount_vnd, transfer_code)
  VALUES (v_user_id, v_plan.code, v_plan.price_vnd, v_transfer_code)
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'amount_vnd', v_plan.price_vnd,
    'transfer_code', v_transfer_code,
    'message', 'Đã tạo yêu cầu thanh toán.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_payment_order(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_payment_order(TEXT) TO authenticated;

-- ================================================================
-- THIẾT LẬP SAU KHI CHẠY FILE
-- ================================================================

-- A. Tạo mã quà tặng mẫu: 7 ngày, tối đa 100 lượt, hết hạn cuối năm 2026.
-- Đổi code, số ngày, số lượt và ngày hết hạn theo nhu cầu của bạn.
-- INSERT INTO public.gift_codes
--   (code, name, flymax_days, max_redemptions, expires_at)
-- VALUES
--   ('FLYDO7NGAY', 'Trải nghiệm FlyMax 7 ngày', 7, 100, '2026-12-31 23:59:59+07');

-- B. Điền thông tin nhận thanh toán khi sẵn sàng.
-- UPDATE public.payment_settings
-- SET
--   bank_name = 'Tên ngân hàng',
--   account_number = 'Số tài khoản',
--   account_holder = 'TÊN CHỦ TÀI KHOẢN',
--   qr_image_url = 'https://.../qr.png',
--   is_enabled = TRUE,
--   updated_at = NOW()
-- WHERE id = 1;

-- C. Nâng cấp thủ công một tài khoản FlyInfinity (dùng trong SQL Editor).
-- UPDATE public.profiles
-- SET account_tier = 'flyinfinity',
--     subscription_started_at = NOW(),
--     subscription_expires_at = NULL
-- WHERE email = 'email-khach-hang@example.com';
