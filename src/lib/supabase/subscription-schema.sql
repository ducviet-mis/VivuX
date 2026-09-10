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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_reward_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_discount_percent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_redeemed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_eligible_until TIMESTAMPTZ;

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

-- Mỗi tài khoản có một mã giới thiệu riêng. Mã được gán tự động cho tài khoản mới
-- và được bổ sung cho những tài khoản đã tồn tại.
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  LOOP
    v_code := 'FLY' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_code);
  END LOOP;
  RETURN v_code;
END;
$$;

UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL OR BTRIM(referral_code) = '';

UPDATE public.profiles
SET
  referral_reward_days = LEAST(30, GREATEST(0, COALESCE(referral_reward_days, 0))),
  referral_discount_percent = LEAST(20, GREATEST(0, COALESCE(referral_discount_percent, 0)));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_unique_idx
  ON public.profiles(referral_code);

CREATE INDEX IF NOT EXISTS profiles_referred_by_idx
  ON public.profiles(referred_by);

CREATE OR REPLACE FUNCTION public.assign_profile_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR BTRIM(NEW.referral_code) = '' THEN
    NEW.referral_code := public.generate_referral_code();
  ELSE
    NEW.referral_code := UPPER(BTRIM(NEW.referral_code));
  END IF;
  -- Chỉ tài khoản tạo sau khi chương trình mở mới có 72 giờ để nhập mã.
  IF NEW.referral_eligible_until IS NULL THEN
    NEW.referral_eligible_until := COALESCE(NEW.created_at, NOW()) + INTERVAL '72 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_profile_referral_code_trigger ON public.profiles;
CREATE TRIGGER assign_profile_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_profile_referral_code();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_referral_reward_days_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_referral_reward_days_check
      CHECK (referral_reward_days BETWEEN 0 AND 30);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_referral_discount_percent_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_referral_discount_percent_check
      CHECK (referral_discount_percent BETWEEN 0 AND 20);
  END IF;
END $$;

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
  ('flymax_quarterly', 'FlyMax 3 tháng', 'flymax', 69000, 90, TRUE),
  ('flymax_half_yearly', 'FlyMax 6 tháng', 'flymax', 139000, 180, TRUE),
  ('flymax_yearly', 'FlyMax 1 năm', 'flymax', 199000, 365, TRUE),
  ('flyinfinity', 'FlyInfinity trọn đời', 'flyinfinity', 299000, NULL, TRUE),
  ('flymax_gift', 'FlyMax từ mã quà tặng', 'flymax', 0, NULL, FALSE),
  ('flymax_referral', 'FlyMax từ giới thiệu', 'flymax', 0, NULL, FALSE)
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

-- 5. Giới thiệu bạn bè. Mỗi người chỉ dùng một mã, nhưng có thể mời nhiều bạn.
CREATE TABLE IF NOT EXISTS public.referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_flymax_days INTEGER NOT NULL DEFAULT 0 CHECK (referrer_flymax_days BETWEEN 0 AND 3),
  referee_flymax_days INTEGER NOT NULL DEFAULT 0 CHECK (referee_flymax_days BETWEEN 0 AND 3),
  referrer_discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (referrer_discount_percent BETWEEN 0 AND 5),
  referee_discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (referee_discount_percent BETWEEN 0 AND 5),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referee_id),
  CHECK (referrer_id <> referee_id)
);

CREATE INDEX IF NOT EXISTS referral_redemptions_referrer_id_idx
  ON public.referral_redemptions(referrer_id, redeemed_at DESC);

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

ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS list_price_vnd INTEGER;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS discount_percent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS discount_amount_vnd INTEGER NOT NULL DEFAULT 0;

UPDATE public.payment_orders
SET list_price_vnd = amount_vnd
WHERE list_price_vnd IS NULL;

CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx
  ON public.payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx
  ON public.payment_orders(status, created_at DESC);

-- 6. RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;
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

DROP POLICY IF EXISTS "Users can view own referral redemptions" ON public.referral_redemptions;
CREATE POLICY "Users can view own referral redemptions"
  ON public.referral_redemptions FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

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
    NEW.referral_code := OLD.referral_code;
    NEW.referral_reward_days := OLD.referral_reward_days;
    NEW.referral_discount_percent := OLD.referral_discount_percent;
    NEW.referred_by := OLD.referred_by;
    NEW.referral_redeemed_at := OLD.referral_redeemed_at;
    NEW.referral_eligible_until := OLD.referral_eligible_until;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_membership_columns_trigger ON public.profiles;
CREATE TRIGGER protect_membership_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_membership_columns();

-- 7. Đồng bộ cấp tài khoản khi FlyMax đã hết hạn.
-- Hàm này được web gọi khi đăng nhập/làm mới tài khoản để trạng thái trong
-- profiles luôn về FlyGo ngay cả khi chưa thiết lập lịch chạy tự động.
CREATE OR REPLACE FUNCTION public.sync_my_membership_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_tier TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn cần đăng nhập để đồng bộ gói tài khoản.');
  END IF;

  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE user_id = v_user_id
    AND status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  UPDATE public.profiles
  SET
    account_tier = 'flygo',
    subscription_started_at = NULL
  WHERE id = v_user_id
    AND account_tier = 'flymax'
    AND (subscription_expires_at IS NULL OR subscription_expires_at <= NOW());

  SELECT account_tier, subscription_expires_at
  INTO v_tier, v_expires_at
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'tier', COALESCE(v_tier, 'flygo'),
    'expires_at', v_expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.sync_my_membership_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_my_membership_status() TO authenticated;

-- Hàm dành cho tác vụ nền (cron) để tự xử lý cả những tài khoản đang không mở web.
CREATE OR REPLACE FUNCTION public.expire_flymax_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  UPDATE public.profiles
  SET
    account_tier = 'flygo',
    subscription_started_at = NULL
  WHERE account_tier = 'flymax'
    AND (subscription_expires_at IS NULL OR subscription_expires_at <= NOW());

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_flymax_subscriptions() FROM PUBLIC;

-- 8. Đổi mã quà tặng: mỗi tài khoản dùng một mã tối đa một lần.
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

-- 9. Đổi mã giới thiệu. Cả hai bên được cộng ngày FlyMax (tối đa 30 ngày
-- từ giới thiệu cho mỗi tài khoản) và +5% ưu đãi (tối đa 20%). Ngày thưởng
-- không còn được cộng vẫn không làm mất quyền nhận ưu đãi.
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_source_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_source_check
  CHECK (source IN ('payment', 'gift_code', 'referral', 'admin'));

CREATE OR REPLACE FUNCTION public.redeem_referral_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code TEXT := UPPER(BTRIM(COALESCE(p_code, '')));
  v_referrer_id UUID;
  v_referrer public.profiles%ROWTYPE;
  v_referee public.profiles%ROWTYPE;
  v_redemption_id UUID;
  v_referrer_days INTEGER;
  v_referee_days INTEGER;
  v_referrer_discount INTEGER;
  v_referee_discount INTEGER;
  v_referrer_start TIMESTAMPTZ;
  v_referee_start TIMESTAMPTZ;
  v_referrer_expires TIMESTAMPTZ;
  v_referee_expires TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn cần đăng nhập để dùng mã giới thiệu.');
  END IF;

  IF v_code = '' THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Vui lòng nhập mã giới thiệu.');
  END IF;

  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = v_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mã giới thiệu không tồn tại.');
  END IF;

  IF v_referrer_id = v_user_id THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn không thể sử dụng mã giới thiệu của chính mình.');
  END IF;

  -- Khóa hai hồ sơ theo cùng một thứ tự để tránh cộng thưởng trùng khi gửi lại yêu cầu.
  PERFORM 1
  FROM public.profiles
  WHERE id IN (v_referrer_id, v_user_id)
  ORDER BY id
  FOR UPDATE;

  IF EXISTS (SELECT 1 FROM public.referral_redemptions WHERE referee_id = v_user_id) THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mỗi tài khoản chỉ có thể dùng một mã giới thiệu.');
  END IF;

  SELECT * INTO v_referrer FROM public.profiles WHERE id = v_referrer_id;
  SELECT * INTO v_referee FROM public.profiles WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Không tìm thấy hồ sơ tài khoản.');
  END IF;

  IF v_referee.referral_eligible_until IS NULL OR v_referee.referral_eligible_until <= NOW() THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Thời gian nhập mã giới thiệu của bạn đã kết thúc.');
  END IF;

  -- FlyInfinity không bị thay đổi cấp gói; tài khoản này vẫn nhận ưu đãi mua hàng.
  v_referrer_days := CASE WHEN v_referrer.account_tier = 'flyinfinity' THEN 0
    ELSE LEAST(3, GREATEST(0, 30 - COALESCE(v_referrer.referral_reward_days, 0))) END;
  v_referee_days := CASE WHEN v_referee.account_tier = 'flyinfinity' THEN 0
    ELSE LEAST(3, GREATEST(0, 30 - COALESCE(v_referee.referral_reward_days, 0))) END;
  v_referrer_discount := LEAST(5, GREATEST(0, 20 - COALESCE(v_referrer.referral_discount_percent, 0)));
  v_referee_discount := LEAST(5, GREATEST(0, 20 - COALESCE(v_referee.referral_discount_percent, 0)));

  INSERT INTO public.referral_redemptions (
    referral_code, referrer_id, referee_id,
    referrer_flymax_days, referee_flymax_days,
    referrer_discount_percent, referee_discount_percent
  ) VALUES (
    v_code, v_referrer_id, v_user_id,
    v_referrer_days, v_referee_days,
    v_referrer_discount, v_referee_discount
  ) RETURNING id INTO v_redemption_id;

  IF v_referrer_days > 0 THEN
    v_referrer_start := GREATEST(NOW(), COALESCE(v_referrer.subscription_expires_at, NOW()));
    v_referrer_expires := v_referrer_start + make_interval(days => v_referrer_days);
    INSERT INTO public.subscriptions (user_id, plan_code, source, status, starts_at, expires_at, metadata)
    VALUES (v_referrer_id, 'flymax_referral', 'referral', 'active', v_referrer_start, v_referrer_expires,
      jsonb_build_object('referral_redemption_id', v_redemption_id, 'role', 'referrer', 'days', v_referrer_days));
    UPDATE public.profiles SET
      account_tier = 'flymax',
      subscription_started_at = CASE WHEN subscription_expires_at IS NULL OR subscription_expires_at <= NOW() THEN NOW() ELSE COALESCE(subscription_started_at, NOW()) END,
      subscription_expires_at = v_referrer_expires
    WHERE id = v_referrer_id;
  END IF;

  IF v_referee_days > 0 THEN
    v_referee_start := GREATEST(NOW(), COALESCE(v_referee.subscription_expires_at, NOW()));
    v_referee_expires := v_referee_start + make_interval(days => v_referee_days);
    INSERT INTO public.subscriptions (user_id, plan_code, source, status, starts_at, expires_at, metadata)
    VALUES (v_user_id, 'flymax_referral', 'referral', 'active', v_referee_start, v_referee_expires,
      jsonb_build_object('referral_redemption_id', v_redemption_id, 'role', 'referee', 'days', v_referee_days));
    UPDATE public.profiles SET
      account_tier = 'flymax',
      subscription_started_at = CASE WHEN subscription_expires_at IS NULL OR subscription_expires_at <= NOW() THEN NOW() ELSE COALESCE(subscription_started_at, NOW()) END,
      subscription_expires_at = v_referee_expires
    WHERE id = v_user_id;
  END IF;

  UPDATE public.profiles SET
    referral_reward_days = LEAST(30, referral_reward_days + v_referrer_days),
    referral_discount_percent = LEAST(20, referral_discount_percent + v_referrer_discount)
  WHERE id = v_referrer_id;

  UPDATE public.profiles SET
    referral_reward_days = LEAST(30, referral_reward_days + v_referee_days),
    referral_discount_percent = LEAST(20, referral_discount_percent + v_referee_discount),
    referred_by = v_referrer_id,
    referral_redeemed_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Đã áp dụng mã. Bạn nhận ' || v_referee_days || ' ngày FlyMax và thêm ' || v_referee_discount || '% ưu đãi.',
    'flymax_days', v_referee_days,
    'discount_percent', v_referee_discount
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Mỗi tài khoản chỉ có thể dùng một mã giới thiệu.');
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_referral_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_referral_code(TEXT) TO authenticated;

-- 10. Tạo yêu cầu thanh toán với giá lấy trực tiếp từ bảng gói.
-- Ưu đãi giới thiệu chỉ có hiệu lực với FlyMax 6 tháng, 1 năm và FlyInfinity.
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
  v_discount_percent INTEGER := 0;
  v_discount_amount INTEGER := 0;
  v_amount_due INTEGER;
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

  IF v_plan.code IN ('flymax_half_yearly', 'flymax_yearly', 'flyinfinity') THEN
    SELECT LEAST(20, GREATEST(0, COALESCE(referral_discount_percent, 0)))
    INTO v_discount_percent
    FROM public.profiles
    WHERE id = v_user_id;
  END IF;

  v_discount_amount := FLOOR(v_plan.price_vnd * v_discount_percent / 100.0)::INTEGER;
  v_amount_due := v_plan.price_vnd - v_discount_amount;

  v_transfer_code := 'FLYDO ' || UPPER(SUBSTRING(REPLACE(v_user_id::TEXT, '-', '') FROM 1 FOR 8));

  INSERT INTO public.payment_orders (
    user_id, plan_code, amount_vnd, list_price_vnd, discount_percent, discount_amount_vnd, transfer_code
  ) VALUES (
    v_user_id, v_plan.code, v_amount_due, v_plan.price_vnd, v_discount_percent, v_discount_amount, v_transfer_code
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'amount_vnd', v_amount_due,
    'list_price_vnd', v_plan.price_vnd,
    'discount_percent', v_discount_percent,
    'discount_amount_vnd', v_discount_amount,
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

-- D. Tự chuyển FlyMax hết hạn về FlyGo cho cả tài khoản không mở web.
-- Trong Supabase Dashboard > Database > Extensions, bật pg_cron; sau đó chạy:
-- SELECT cron.schedule(
--   'flydo-expire-flymax-hourly',
--   '5 * * * *',
--   $$SELECT public.expire_flymax_subscriptions();$$
-- );
-- Nếu đã tạo lịch này trước đó, hãy xóa lịch cũ trong cron.job rồi chạy lại lệnh trên.
