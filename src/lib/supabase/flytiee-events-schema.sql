-- ============================================================================
-- FlyDo · FlyTiee Events, inventory, reward history and Birdie Mail gift codes
-- Chạy MỘT LẦN trong Supabase Dashboard > SQL Editor > New query > Run.
--
-- Tệp này chỉ tạo lớp lưu trữ an toàn trên Supabase. Sau khi chạy, website cần
-- được chuyển sang gọi các RPC ở cuối tệp để dùng dữ liệu này thay cho metadata.
-- Có thể chạy lại an toàn: toàn bộ CREATE/ALTER đều có điều kiện.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Hồ sơ, kho rương và trạng thái mặc đồ của FlyTiee (một hồ sơ / tài khoản)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flytiee_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  version SMALLINT NOT NULL DEFAULT 1 CHECK (version = 1),
  name TEXT NOT NULL DEFAULT 'FlyTiee' CHECK (char_length(name) BETWEEN 2 AND 20),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins INTEGER NOT NULL DEFAULT 60 CHECK (coins >= 0),
  satiety SMALLINT NOT NULL DEFAULT 78 CHECK (satiety BETWEEN 0 AND 100),
  satiety_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owned_accessory_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  equipped JSONB NOT NULL DEFAULT '{}'::JSONB,
  owned_skin_ids TEXT[] NOT NULL DEFAULT ARRAY['classic']::TEXT[],
  equipped_skin_id TEXT NOT NULL DEFAULT 'classic',
  owned_set_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  equipped_set_id TEXT,
  chests JSONB NOT NULL DEFAULT '{"bronze": 0, "silver": 0, "gold": 0}'::JSONB,
  redeemed_mail_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    jsonb_typeof(chests) = 'object'
    AND COALESCE((chests ->> 'bronze')::INTEGER, 0) >= 0
    AND COALESCE((chests ->> 'silver')::INTEGER, 0) >= 0
    AND COALESCE((chests ->> 'gold')::INTEGER, 0) >= 0
  )
);

-- ---------------------------------------------------------------------------
-- 2. Mốc nhận thưởng trong ngày và nhiệm vụ đã nhận
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flytiee_daily_events (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  study_claimed_milestones SMALLINT[] NOT NULL DEFAULT ARRAY[]::SMALLINT[],
  practice_coins_claimed INTEGER NOT NULL DEFAULT 0 CHECK (practice_coins_claimed BETWEEN 0 AND 100),
  completion_chest_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_date),
  CHECK (study_claimed_milestones <@ ARRAY[15, 45, 90]::SMALLINT[])
);

CREATE TABLE IF NOT EXISTS public.flytiee_mission_claims (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_granted INTEGER NOT NULL DEFAULT 0 CHECK (xp_granted >= 0),
  coins_granted INTEGER NOT NULL DEFAULT 0 CHECK (coins_granted >= 0),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, mission_id, reward_date)
);

-- ---------------------------------------------------------------------------
-- 3. Lịch sử phần thưởng. Có log để đối soát khi học sinh báo thiếu xu/rương.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flytiee_reward_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('mission', 'streak', 'study', 'practice', 'daily_completion', 'chest', 'gift_code', 'shop')),
  reward_kind TEXT NOT NULL CHECK (reward_kind IN ('coins', 'chest', 'accessory', 'skin', 'set', 'xp')),
  amount INTEGER CHECK (amount IS NULL OR amount >= 0),
  chest_tier TEXT CHECK (chest_tier IS NULL OR chest_tier IN ('bronze', 'silver', 'gold')),
  item_id TEXT,
  reference_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS flytiee_reward_logs_user_created_index
  ON public.flytiee_reward_logs (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Birdie Mail: mã quà, giới hạn số lượt và nhật ký nhận mã.
-- reward_kind / reward_value xác định phần thưởng:
--   coins: reward_value = {"amount": 50}
--   chest: reward_value = {"tier": "silver"}
--   accessory / skin / set: reward_value = {"item_id": "study-pencil"}
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flytiee_gift_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code = UPPER(BTRIM(code)) AND code ~ '^[A-Z0-9-]{3,48}$'),
  title TEXT NOT NULL,
  description TEXT,
  reward_kind TEXT NOT NULL CHECK (reward_kind IN ('coins', 'chest', 'accessory', 'skin', 'set')),
  reward_value JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  redemption_count INTEGER NOT NULL DEFAULT 0 CHECK (redemption_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (expires_at IS NULL OR starts_at IS NULL OR expires_at > starts_at),
  CONSTRAINT flytiee_gift_codes_no_phoenix_check
    CHECK (reward_kind <> 'set' OR (reward_value ->> 'item_id') IS DISTINCT FROM 'phoenix-dawn')
);

ALTER TABLE public.flytiee_gift_codes DROP CONSTRAINT IF EXISTS flytiee_gift_codes_no_phoenix_check;
ALTER TABLE public.flytiee_gift_codes ADD CONSTRAINT flytiee_gift_codes_no_phoenix_check
  CHECK (reward_kind <> 'set' OR (reward_value ->> 'item_id') IS DISTINCT FROM 'phoenix-dawn');

CREATE TABLE IF NOT EXISTS public.flytiee_gift_code_redemptions (
  gift_code_id UUID NOT NULL REFERENCES public.flytiee_gift_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (gift_code_id, user_id)
);

CREATE INDEX IF NOT EXISTS flytiee_gift_code_redemptions_user_index
  ON public.flytiee_gift_code_redemptions (user_id, redeemed_at DESC);

-- ---------------------------------------------------------------------------
-- 5. Hàm kỹ thuật và timestamp.
-- Chỉ hai email ADMIN hiện tại có quyền tạo/sửa/xóa Birdie Mail từ Dashboard.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.flytiee_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '') IN ('vietdang293.vn@gmail.com', 'vietdang293@gmail.com');
$$;

CREATE OR REPLACE FUNCTION public.flytiee_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS flytiee_profiles_touch_updated_at ON public.flytiee_profiles;
CREATE TRIGGER flytiee_profiles_touch_updated_at
  BEFORE UPDATE ON public.flytiee_profiles
  FOR EACH ROW EXECUTE FUNCTION public.flytiee_touch_updated_at();

DROP TRIGGER IF EXISTS flytiee_daily_events_touch_updated_at ON public.flytiee_daily_events;
CREATE TRIGGER flytiee_daily_events_touch_updated_at
  BEFORE UPDATE ON public.flytiee_daily_events
  FOR EACH ROW EXECUTE FUNCTION public.flytiee_touch_updated_at();

DROP TRIGGER IF EXISTS flytiee_gift_codes_touch_updated_at ON public.flytiee_gift_codes;
CREATE TRIGGER flytiee_gift_codes_touch_updated_at
  BEFORE UPDATE ON public.flytiee_gift_codes
  FOR EACH ROW EXECUTE FUNCTION public.flytiee_touch_updated_at();

-- Tạo hồ sơ an toàn cho lần gọi đầu tiên của mỗi tài khoản.
CREATE OR REPLACE FUNCTION public.ensure_flytiee_profile()
RETURNS public.flytiee_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.flytiee_profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Bạn cần đăng nhập để dùng FlyTiee';
  END IF;

  INSERT INTO public.flytiee_profiles (user_id)
  VALUES (auth.uid())
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_profile
  FROM public.flytiee_profiles
  WHERE user_id = auth.uid();

  RETURN v_profile;
END;
$$;

-- Đổi Birdie Mail. Hàm này khóa dòng mã quà, nên không thể vượt quá lượt dùng
-- khi hai người nhập mã cùng lúc. Website gọi RPC này thay vì tự cộng xu ở client.
CREATE OR REPLACE FUNCTION public.redeem_flytiee_gift_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code TEXT := UPPER(REGEXP_REPLACE(BTRIM(COALESCE(p_code, '')), '\\s+', '-', 'g'));
  v_gift public.flytiee_gift_codes;
  v_current_count INTEGER;
  v_tier TEXT;
  v_amount INTEGER;
  v_item_id TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Bạn cần đăng nhập để nhận Birdie Mail';
  END IF;

  IF v_code !~ '^[A-Z0-9-]{3,48}$' THEN
    RAISE EXCEPTION 'Mã Birdie Mail không hợp lệ';
  END IF;

  PERFORM public.ensure_flytiee_profile();

  SELECT * INTO v_gift
  FROM public.flytiee_gift_codes
  WHERE code = v_code
  FOR UPDATE;

  IF NOT FOUND OR NOT v_gift.is_active
     OR (v_gift.starts_at IS NOT NULL AND v_gift.starts_at > NOW())
     OR (v_gift.expires_at IS NOT NULL AND v_gift.expires_at <= NOW()) THEN
    RAISE EXCEPTION 'Birdie Mail không hợp lệ hoặc đã hết hạn';
  END IF;

  IF v_gift.max_redemptions IS NOT NULL AND v_gift.redemption_count >= v_gift.max_redemptions THEN
    RAISE EXCEPTION 'Birdie Mail này đã hết lượt nhận';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.flytiee_gift_code_redemptions
    WHERE gift_code_id = v_gift.id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Bạn đã nhận Birdie Mail này rồi';
  END IF;

  IF v_gift.reward_kind = 'coins' THEN
    v_amount := GREATEST(0, COALESCE((v_gift.reward_value ->> 'amount')::INTEGER, 0));
    IF v_amount = 0 THEN RAISE EXCEPTION 'Cấu hình phần thưởng xu không hợp lệ'; END IF;
    UPDATE public.flytiee_profiles SET coins = coins + v_amount WHERE user_id = v_user_id;
  ELSIF v_gift.reward_kind = 'chest' THEN
    v_tier := v_gift.reward_value ->> 'tier';
    IF v_tier NOT IN ('bronze', 'silver', 'gold') THEN RAISE EXCEPTION 'Cấu hình rương không hợp lệ'; END IF;
    UPDATE public.flytiee_profiles
    SET chests = jsonb_set(
      chests,
      ARRAY[v_tier],
      to_jsonb(COALESCE((chests ->> v_tier)::INTEGER, 0) + 1),
      TRUE
    )
    WHERE user_id = v_user_id;
  ELSE
    v_item_id := NULLIF(BTRIM(v_gift.reward_value ->> 'item_id'), '');
    IF v_item_id IS NULL THEN RAISE EXCEPTION 'Cấu hình vật phẩm không hợp lệ'; END IF;
    IF v_gift.reward_kind = 'accessory' THEN
      UPDATE public.flytiee_profiles
      SET owned_accessory_ids = CASE WHEN v_item_id = ANY(owned_accessory_ids)
        THEN owned_accessory_ids ELSE array_append(owned_accessory_ids, v_item_id) END
      WHERE user_id = v_user_id;
    ELSIF v_gift.reward_kind = 'skin' THEN
      UPDATE public.flytiee_profiles
      SET owned_skin_ids = CASE WHEN v_item_id = ANY(owned_skin_ids)
        THEN owned_skin_ids ELSE array_append(owned_skin_ids, v_item_id) END
      WHERE user_id = v_user_id;
    ELSE
      UPDATE public.flytiee_profiles
      SET owned_set_ids = CASE WHEN v_item_id = ANY(owned_set_ids)
        THEN owned_set_ids ELSE array_append(owned_set_ids, v_item_id) END
      WHERE user_id = v_user_id;
    END IF;
  END IF;

  INSERT INTO public.flytiee_gift_code_redemptions (gift_code_id, user_id)
  VALUES (v_gift.id, v_user_id);

  UPDATE public.flytiee_gift_codes
  SET redemption_count = redemption_count + 1
  WHERE id = v_gift.id;

  INSERT INTO public.flytiee_reward_logs (user_id, source, reward_kind, amount, chest_tier, item_id, reference_id)
  VALUES (
    v_user_id,
    'gift_code',
    v_gift.reward_kind,
    CASE WHEN v_gift.reward_kind = 'coins' THEN v_amount ELSE NULL END,
    CASE WHEN v_gift.reward_kind = 'chest' THEN v_tier ELSE NULL END,
    CASE WHEN v_gift.reward_kind IN ('accessory', 'skin', 'set') THEN v_item_id ELSE NULL END,
    v_gift.code
  );

  RETURN jsonb_build_object(
    'ok', TRUE,
    'code', v_gift.code,
    'title', v_gift.title,
    'description', COALESCE(v_gift.description, 'Quà đã được chuyển vào FlyTiee.'),
    'kind', v_gift.reward_kind,
    'amount', v_amount,
    'chestTier', v_tier,
    'itemId', v_item_id
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS: học sinh chỉ xem dữ liệu của mình. Mọi cộng/trừ thưởng đi qua RPC.
-- ---------------------------------------------------------------------------
ALTER TABLE public.flytiee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flytiee_daily_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flytiee_mission_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flytiee_reward_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flytiee_gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flytiee_gift_code_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own FlyTiee profile" ON public.flytiee_profiles;
CREATE POLICY "Users read own FlyTiee profile" ON public.flytiee_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own FlyTiee daily events" ON public.flytiee_daily_events;
CREATE POLICY "Users read own FlyTiee daily events" ON public.flytiee_daily_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own FlyTiee mission claims" ON public.flytiee_mission_claims;
CREATE POLICY "Users read own FlyTiee mission claims" ON public.flytiee_mission_claims
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own FlyTiee reward logs" ON public.flytiee_reward_logs;
CREATE POLICY "Users read own FlyTiee reward logs" ON public.flytiee_reward_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own Birdie Mail redemptions" ON public.flytiee_gift_code_redemptions;
CREATE POLICY "Users read own Birdie Mail redemptions" ON public.flytiee_gift_code_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage Birdie Mail" ON public.flytiee_gift_codes;
CREATE POLICY "Admin manage Birdie Mail" ON public.flytiee_gift_codes
  FOR ALL TO authenticated
  USING (public.flytiee_is_admin())
  WITH CHECK (public.flytiee_is_admin());

REVOKE ALL ON FUNCTION public.ensure_flytiee_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_flytiee_gift_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_flytiee_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_flytiee_gift_code(TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. Ba mã thử nghiệm tương ứng với các mã web hiện có.
-- Bạn có thể đổi, tắt hoặc xóa chúng trong Table Editor sau khi đã kiểm tra.
-- ---------------------------------------------------------------------------
INSERT INTO public.flytiee_gift_codes (code, title, description, reward_kind, reward_value)
VALUES
  ('BIRDIE-WELCOME', 'Chào mừng từ Birdie!', 'FlyTiee gửi bạn 50 xu để bắt đầu hành trình.', 'coins', '{"amount": 50}'::JSONB),
  ('CHAM-HOC', 'Quà chăm học', 'Bút chì chăm học đã được thêm vào tủ đồ.', 'accessory', '{"item_id": "study-pencil"}'::JSONB),
  ('BAY-CAO', 'Bay cao cùng FlyTiee', 'Một Rương bạc đã được chuyển vào kho.', 'chest', '{"tier": "silver"}'::JSONB)
ON CONFLICT (code) DO NOTHING;

COMMIT;

-- ============================================================================
-- TẠO MÃ QUÀ MỚI (chạy từng lệnh dưới đây SAU khi script phía trên thành công)
-- ============================================================================

-- Ví dụ 1: 100 xu, chỉ 500 người đầu, hết hạn lúc 23:59 ngày 31/12/2026 (GMT+7)
-- INSERT INTO public.flytiee_gift_codes
--   (code, title, description, reward_kind, reward_value, max_redemptions, expires_at)
-- VALUES
--   ('NOEL-2026', 'Quà Giáng sinh', 'FlyTiee gửi bạn 100 xu.', 'coins',
--    '{"amount": 100}'::JSONB, 500, '2026-12-31 23:59:59+07');

-- Ví dụ 2: tặng Rương vàng
-- INSERT INTO public.flytiee_gift_codes
--   (code, title, description, reward_kind, reward_value)
-- VALUES
--   ('GOLD-BIRDIE', 'Rương vàng bí mật', 'Một Rương vàng đã về kho!', 'chest',
--    '{"tier": "gold"}'::JSONB);

-- Ví dụ 3: tặng skin Hồng đào Sakura
-- INSERT INTO public.flytiee_gift_codes
--   (code, title, description, reward_kind, reward_value)
-- VALUES
--   ('SAKURA-LOVE', 'Sắc hồng Sakura', 'Skin Hồng đào Sakura đã được mở khóa.', 'skin',
--    '{"item_id": "sakura"}'::JSONB);

-- Ví dụ 4: tặng Set sự kiện Giáng sinh tuyết
-- INSERT INTO public.flytiee_gift_codes
--   (code, title, description, reward_kind, reward_value)
-- VALUES
--   ('SNOWY-SET', 'Giáng sinh tuyết', 'Set sự kiện đã được mở khóa.', 'set',
--    '{"item_id": "snowy-christmas"}'::JSONB);

-- Tắt một mã, không cần xóa lịch sử ai đã đổi mã:
-- UPDATE public.flytiee_gift_codes SET is_active = FALSE WHERE code = 'NOEL-2026';
