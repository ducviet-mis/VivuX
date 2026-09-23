-- Run once in Supabase SQL Editor after learning-streak-rewards.sql.
-- Keeps existing claims and rewards; enables the exclusive 200-day set.
BEGIN;

ALTER TABLE public.learning_streak_claims
  DROP CONSTRAINT IF EXISTS learning_streak_claims_milestone_check;
ALTER TABLE public.learning_streak_claims
  ADD CONSTRAINT learning_streak_claims_milestone_check
  CHECK (milestone IN (10, 30, 50, 80, 100, 150, 200));

DO $block$
BEGIN
  IF to_regclass('public.flytiee_gift_codes') IS NOT NULL THEN
    ALTER TABLE public.flytiee_gift_codes DROP CONSTRAINT IF EXISTS flytiee_gift_codes_no_phoenix_check;
    ALTER TABLE public.flytiee_gift_codes ADD CONSTRAINT flytiee_gift_codes_no_phoenix_check
      CHECK (reward_kind <> 'set' OR (reward_value ->> 'item_id') IS DISTINCT FROM 'phoenix-dawn');
  END IF;
END;
$block$;

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
  IF p_milestone IS NULL OR p_milestone NOT IN (10, 30, 50, 80, 100, 150, 200) THEN
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
  ELSIF p_milestone = 200 THEN
    v_owned := COALESCE(v_bird -> 'ownedSetIds', '[]'::JSONB);
    IF NOT (v_owned ? 'phoenix-dawn') THEN
      v_owned := v_owned || to_jsonb('phoenix-dawn'::TEXT);
    END IF;
    v_bird := jsonb_set(v_bird, '{ownedSetIds}', v_owned, TRUE);
    v_message := 'Phượng Hoàng Bình Minh đã được mở khóa trong tủ đồ FlyTiee!';
  END IF;

  IF p_milestone IN (10, 30, 50, 100, 200) THEN
    UPDATE auth.users SET raw_user_meta_data = jsonb_set(v_metadata, '{flytiee}', v_bird, TRUE)
      WHERE id = v_user;
    IF to_regclass('public.flytiee_profiles') IS NOT NULL THEN
      IF p_milestone = 10 THEN
        UPDATE public.flytiee_profiles SET coins = coins + 50 WHERE user_id = v_user;
      ELSIF p_milestone = 30 THEN
        UPDATE public.flytiee_profiles SET chests = jsonb_set(chests, '{silver}',
          to_jsonb(COALESCE((chests ->> 'silver')::INTEGER, 0) + 5), TRUE) WHERE user_id = v_user;
      ELSIF p_milestone = 50 THEN
        UPDATE public.flytiee_profiles SET chests = jsonb_set(chests, '{gold}',
          to_jsonb(COALESCE((chests ->> 'gold')::INTEGER, 0) + 5), TRUE) WHERE user_id = v_user;
      ELSIF p_milestone = 100 THEN
        UPDATE public.flytiee_profiles SET owned_set_ids = array_append(owned_set_ids, p_set_id)
          WHERE user_id = v_user AND NOT p_set_id = ANY(owned_set_ids);
      ELSE
        UPDATE public.flytiee_profiles SET owned_set_ids = array_append(owned_set_ids, 'phoenix-dawn')
          WHERE user_id = v_user AND NOT 'phoenix-dawn' = ANY(owned_set_ids);
      END IF;
    END IF;
  END IF;

  INSERT INTO public.learning_streak_claims (user_id, milestone, selected_set_id)
    VALUES (v_user, p_milestone, CASE WHEN p_milestone = 100 THEN p_set_id WHEN p_milestone = 200 THEN 'phoenix-dawn' ELSE NULL END);
  RETURN jsonb_build_object('ok', TRUE, 'message', v_message, 'milestone', p_milestone);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_learning_streak_milestone(INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_learning_streak_milestone(INTEGER, TEXT) TO authenticated;

COMMIT;
NOTIFY pgrst, 'reload schema';
