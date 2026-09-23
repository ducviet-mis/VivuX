-- FlyDo: streak đăng nhập và quà theo mốc. Chạy sau subscription-schema.sql.
-- Ngày được tính theo Asia/Ho_Chi_Minh; dữ liệu cũ chỉ ở localStorage không
-- được nhập tự động vì trình duyệt có thể sửa số ngày để lấy thưởng.

BEGIN;

CREATE TABLE IF NOT EXISTS public.learning_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak BETWEEN 0 AND 200),
  best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak BETWEEN 0 AND 200),
  last_checkin_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_streak_claims (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL CHECK (milestone IN (10, 30, 50, 80, 100, 150)),
  selected_set_id TEXT,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, milestone)
);

CREATE TABLE IF NOT EXISTS public.learning_streak_discounts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_percent INTEGER NOT NULL DEFAULT 50 CHECK (discount_percent = 50),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  CHECK (expires_at > starts_at)
);

CREATE INDEX IF NOT EXISTS learning_streak_discounts_expiry_idx
  ON public.learning_streak_discounts (expires_at) WHERE used_at IS NULL;

ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streak_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streak_discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own learning streak" ON public.learning_streaks;
CREATE POLICY "Read own learning streak" ON public.learning_streaks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Read own learning streak claims" ON public.learning_streak_claims;
CREATE POLICY "Read own learning streak claims" ON public.learning_streak_claims
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Read own learning streak discount" ON public.learning_streak_discounts;
CREATE POLICY "Read own learning streak discount" ON public.learning_streak_discounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_in_learning_streak()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
  v_streak public.learning_streaks%ROWTYPE;
  v_claims JSONB;
  v_discount TIMESTAMPTZ;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Bạn cần đăng nhập để điểm danh.');
  END IF;

  INSERT INTO public.learning_streaks (user_id) VALUES (v_user)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_streak FROM public.learning_streaks
  WHERE user_id = v_user FOR UPDATE;

  IF v_streak.last_checkin_date IS DISTINCT FROM v_today THEN
    v_streak.current_streak := CASE
      WHEN v_streak.last_checkin_date = v_today - 1
        THEN LEAST(200, v_streak.current_streak + 1)
      ELSE 1
    END;
    v_streak.best_streak := GREATEST(v_streak.best_streak, v_streak.current_streak);
    v_streak.last_checkin_date := v_today;
    UPDATE public.learning_streaks SET
      current_streak = v_streak.current_streak,
      best_streak = v_streak.best_streak,
      last_checkin_date = v_today,
      updated_at = NOW()
    WHERE user_id = v_user;
  END IF;

  SELECT COALESCE(jsonb_agg(milestone ORDER BY milestone), '[]'::JSONB)
    INTO v_claims FROM public.learning_streak_claims WHERE user_id = v_user;
  SELECT expires_at INTO v_discount FROM public.learning_streak_discounts
    WHERE user_id = v_user AND used_at IS NULL AND expires_at > NOW();

  RETURN jsonb_build_object(
    'ok', TRUE, 'current_streak', v_streak.current_streak,
    'best_streak', v_streak.best_streak, 'last_checkin_date', v_today,
    'claimed_milestones', v_claims, 'discount_expires_at', v_discount
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_learning_streak_milestone(
  p_milestone INTEGER, p_set_id TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
  v_streak public.learning_streaks%ROWTYPE;
  v_metadata JSONB;
  v_bird JSONB;
  v_chests JSONB;
  v_owned JSONB;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_tier TEXT;
  v_message TEXT;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Bạn cần đăng nhập để nhận thưởng.');
  END IF;
  IF p_milestone IS NULL OR p_milestone NOT IN (10, 30, 50, 80, 100, 150) THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Mốc này chưa thể nhận quà.');
  END IF;

  SELECT * INTO v_streak FROM public.learning_streaks
    WHERE user_id = v_user FOR UPDATE;
  IF NOT FOUND OR v_streak.last_checkin_date <> v_today OR v_streak.current_streak < p_milestone THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Bạn chưa đạt mốc streak này.');
  END IF;
  IF EXISTS (SELECT 1 FROM public.learning_streak_claims WHERE user_id = v_user AND milestone = p_milestone) THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Bạn đã nhận quà mốc này rồi.');
  END IF;
  IF p_milestone = 100 AND (p_set_id IS NULL OR p_set_id NOT IN
    ('cosmic-explorer', 'dino-dreamer', 'snowy-christmas', 'shadow-ninja', 'mushroom-kingdom')) THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Hãy chọn một Set FlyTiee hợp lệ.');
  END IF;

  SELECT COALESCE(raw_user_meta_data, '{}'::JSONB) INTO v_metadata
    FROM auth.users WHERE id = v_user FOR UPDATE;
  v_bird := COALESCE(v_metadata -> 'flytiee', '{}'::JSONB);

  IF p_milestone = 10 THEN
    v_bird := jsonb_set(v_bird, '{coins}', to_jsonb(COALESCE((v_bird ->> 'coins')::INTEGER, 60) + 50), TRUE);
    v_message := 'Đã cộng 50 xu vào ví FlyTiee!';
  ELSIF p_milestone IN (30, 50) THEN
    v_chests := COALESCE(v_bird -> 'chests', '{}'::JSONB);
    IF p_milestone = 30 THEN
      v_chests := jsonb_set(v_chests, '{silver}', to_jsonb(COALESCE((v_chests ->> 'silver')::INTEGER, 0) + 5), TRUE);
      v_message := 'Đã thêm 5 Rương bạc vào kho FlyTiee!';
    ELSE
      v_chests := jsonb_set(v_chests, '{gold}', to_jsonb(COALESCE((v_chests ->> 'gold')::INTEGER, 0) + 5), TRUE);
      v_message := 'Đã thêm 5 Rương vàng vào kho FlyTiee!';
    END IF;
    v_bird := jsonb_set(v_bird, '{chests}', v_chests, TRUE);
  ELSIF p_milestone = 80 THEN
    INSERT INTO public.learning_streak_discounts (user_id, expires_at)
      VALUES (v_user, NOW() + INTERVAL '30 days');
    v_message := 'Đã mở ưu đãi 50% trong 30 ngày cho 6 tháng, 1 năm và FlyInfinity!';
  ELSIF p_milestone = 100 THEN
    v_owned := COALESCE(v_bird -> 'ownedSetIds', '[]'::JSONB);
    IF v_owned ? p_set_id THEN
      RETURN jsonb_build_object('ok', FALSE, 'message', 'Bạn đã có Set này. Hãy chọn Set khác.');
    END IF;
    v_owned := v_owned || to_jsonb(p_set_id);
    v_bird := jsonb_set(v_bird, '{ownedSetIds}', v_owned, TRUE);
    v_message := 'Set FlyTiee bạn chọn đã vào tủ đồ!';
  ELSIF p_milestone = 150 THEN
    SELECT account_tier, subscription_expires_at INTO v_tier, v_end
      FROM public.profiles WHERE id = v_user FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hồ sơ tài khoản.'; END IF;
    IF v_tier <> 'flyinfinity' THEN
      v_start := GREATEST(NOW(), COALESCE(v_end, NOW()));
      v_end := v_start + INTERVAL '365 days';
      UPDATE public.profiles SET account_tier = 'flymax',
        subscription_started_at = CASE WHEN subscription_expires_at IS NULL OR subscription_expires_at <= NOW()
          THEN NOW() ELSE COALESCE(subscription_started_at, NOW()) END,
        subscription_expires_at = v_end WHERE id = v_user;
      INSERT INTO public.subscriptions
        (user_id, plan_code, source, status, starts_at, expires_at, metadata)
        VALUES (v_user, 'flymax_yearly', 'admin', 'active', v_start, v_end,
          jsonb_build_object('source', 'learning_streak', 'milestone', 150));
      v_message := 'Đã cộng thêm 365 ngày FlyMax vào tài khoản!';
    ELSE
      v_message := 'Bạn đã có FlyInfinity trọn đời; mốc 150 đã được ghi nhận.';
    END IF;
  END IF;

  IF p_milestone IN (10, 30, 50, 100) THEN
    UPDATE auth.users SET raw_user_meta_data = jsonb_set(v_metadata, '{flytiee}', v_bird, TRUE)
      WHERE id = v_user;
    -- Nếu đã cài bảng FlyTiee, giữ số dư/kho quà ở đó đồng bộ với metadata.
    IF to_regclass('public.flytiee_profiles') IS NOT NULL THEN
      IF p_milestone = 10 THEN
        UPDATE public.flytiee_profiles SET coins = coins + 50 WHERE user_id = v_user;
      ELSIF p_milestone = 30 THEN
        UPDATE public.flytiee_profiles SET chests = jsonb_set(chests, '{silver}',
          to_jsonb(COALESCE((chests ->> 'silver')::INTEGER, 0) + 5), TRUE) WHERE user_id = v_user;
      ELSIF p_milestone = 50 THEN
        UPDATE public.flytiee_profiles SET chests = jsonb_set(chests, '{gold}',
          to_jsonb(COALESCE((chests ->> 'gold')::INTEGER, 0) + 5), TRUE) WHERE user_id = v_user;
      ELSE
        UPDATE public.flytiee_profiles SET owned_set_ids = array_append(owned_set_ids, p_set_id)
          WHERE user_id = v_user AND NOT p_set_id = ANY(owned_set_ids);
      END IF;
    END IF;
  END IF;

  INSERT INTO public.learning_streak_claims (user_id, milestone, selected_set_id)
    VALUES (v_user, p_milestone, CASE WHEN p_milestone = 100 THEN p_set_id ELSE NULL END);
  RETURN jsonb_build_object('ok', TRUE, 'message', v_message, 'milestone', p_milestone);
END;
$$;

REVOKE ALL ON FUNCTION public.check_in_learning_streak() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_learning_streak_milestone(INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_in_learning_streak() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_learning_streak_milestone(INTEGER, TEXT) TO authenticated;

-- Giá thanh toán luôn tính ở máy chủ. Nếu có cả ưu đãi giới thiệu, dùng mức cao
-- nhất thay vì cộng dồn. Đơn chưa duyệt không tiêu mất voucher streak.
ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS streak_discount_applied BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.create_payment_order(p_plan_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_plan public.subscription_plans%ROWTYPE;
  v_order UUID;
  v_discount INTEGER := 0;
  v_streak_discount BOOLEAN := FALSE;
  v_amount INTEGER;
  v_code TEXT;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Bạn cần đăng nhập để tạo yêu cầu thanh toán.');
  END IF;
  SELECT * INTO v_plan FROM public.subscription_plans
    WHERE code = p_plan_code AND is_active AND is_public AND price_vnd > 0;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Gói đăng ký không hợp lệ.');
  END IF;

  IF v_plan.code IN ('flymax_half_yearly', 'flymax_yearly', 'flyinfinity') THEN
    SELECT LEAST(20, GREATEST(0, COALESCE(referral_discount_percent, 0)))
      INTO v_discount FROM public.profiles WHERE id = v_user;
    IF EXISTS (SELECT 1 FROM public.learning_streak_discounts
      WHERE user_id = v_user AND used_at IS NULL AND expires_at > NOW()) THEN
      v_discount := 50;
      v_streak_discount := TRUE;
    END IF;
  END IF;
  v_discount := COALESCE(v_discount, 0);
  v_amount := v_plan.price_vnd - FLOOR(v_plan.price_vnd * v_discount / 100.0)::INTEGER;
  v_code := 'FLYDO ' || UPPER(SUBSTRING(REPLACE(v_user::TEXT, '-', '') FROM 1 FOR 8));

  INSERT INTO public.payment_orders
    (user_id, plan_code, amount_vnd, list_price_vnd, discount_percent,
     discount_amount_vnd, transfer_code, streak_discount_applied)
    VALUES (v_user, v_plan.code, v_amount, v_plan.price_vnd, v_discount,
      v_plan.price_vnd - v_amount, v_code, v_streak_discount)
    RETURNING id INTO v_order;

  RETURN jsonb_build_object('success', TRUE, 'order_id', v_order,
    'amount_vnd', v_amount, 'list_price_vnd', v_plan.price_vnd,
    'discount_percent', v_discount, 'discount_amount_vnd', v_plan.price_vnd - v_amount,
    'streak_discount_applied', v_streak_discount,
    'transfer_code', v_code, 'message', 'Đã tạo yêu cầu thanh toán.');
END;
$$;

REVOKE ALL ON FUNCTION public.create_payment_order(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_payment_order(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_learning_streak_discount()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved'
     AND NEW.streak_discount_applied THEN
    UPDATE public.learning_streak_discounts SET used_at = NOW()
      WHERE user_id = NEW.user_id AND used_at IS NULL
        AND starts_at <= OLD.created_at AND expires_at > OLD.created_at;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Voucher streak đã dùng hoặc không hợp lệ cho đơn này.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS consume_learning_streak_discount_trigger ON public.payment_orders;
CREATE TRIGGER consume_learning_streak_discount_trigger
  BEFORE UPDATE OF status ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.consume_learning_streak_discount();

COMMIT;
NOTIFY pgrst, 'reload schema';
