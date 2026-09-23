-- FlyTiee · Kỳ thú: một chuyến phiêu lưu/ngày, 5 câu Tự luyện, một lần quay.
-- Chạy toàn bộ tệp này trong Supabase SQL Editor trước khi dùng giao diện.
-- Mọi lần bắt đầu, trả lời và trao quà đều được xác thực ở database.

BEGIN;

CREATE TABLE IF NOT EXISTS public.flytiee_adventure_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  play_date DATE NOT NULL,
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),
  lesson_id TEXT NOT NULL,
  question_ids TEXT[] NOT NULL CHECK (array_length(question_ids, 1) = 5),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(answers) = 'array'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'failed', 'won', 'claimed')),
  reward_kind TEXT CHECK (reward_kind IN ('coins', 'chest')),
  reward_amount INTEGER,
  reward_chest_tier TEXT CHECK (reward_chest_tier IN ('bronze', 'silver', 'gold')),
  reward_index SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, play_date)
);

CREATE INDEX IF NOT EXISTS flytiee_adventure_runs_user_date_idx
  ON public.flytiee_adventure_runs (user_id, play_date DESC);

ALTER TABLE public.flytiee_adventure_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own FlyTiee adventures" ON public.flytiee_adventure_runs;
CREATE POLICY "Read own FlyTiee adventures" ON public.flytiee_adventure_runs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE ALL ON public.flytiee_adventure_runs FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.flytiee_adventure_runs TO authenticated;

CREATE OR REPLACE FUNCTION public.flytiee_adventure_catalog(p_level INTEGER)
RETURNS TABLE (id TEXT, grade INTEGER, chapter TEXT, title TEXT, question_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT l.id, l.grade::INTEGER, l.chapter, l.title, count(q.id)
  FROM public.practice_lessons AS l
  JOIN public.practice_questions AS q ON q.lesson_id = l.id
  WHERE auth.uid() IS NOT NULL
    AND p_level BETWEEN 1 AND 3
    AND coalesce(nullif(q.difficulty_level, 0), 1) = p_level
    AND q.correct_answer BETWEEN 0 AND 3
    AND CASE WHEN jsonb_typeof(q.options) = 'array' THEN jsonb_array_length(q.options) = 4 ELSE false END
    AND nullif(btrim(q.content), '') IS NOT NULL
    AND jsonb_typeof(q.options -> 0) = 'string'
    AND jsonb_typeof(q.options -> 1) = 'string'
    AND jsonb_typeof(q.options -> 2) = 'string'
    AND jsonb_typeof(q.options -> 3) = 'string'
    AND nullif(btrim(q.options ->> 0), '') IS NOT NULL
    AND nullif(btrim(q.options ->> 1), '') IS NOT NULL
    AND nullif(btrim(q.options ->> 2), '') IS NOT NULL
    AND nullif(btrim(q.options ->> 3), '') IS NOT NULL
  GROUP BY l.id, l.grade, l.chapter, l.title
  HAVING count(q.id) >= 5
  ORDER BY l.grade, l.chapter, l.title;
$$;

CREATE OR REPLACE FUNCTION public.flytiee_adventure_start(p_level INTEGER, p_lesson_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_date DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  v_ids TEXT[];
  v_run public.flytiee_adventure_runs;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Hãy đăng nhập để chơi Kỳ thú.'; END IF;
  IF p_level IS NULL OR p_level NOT BETWEEN 1 AND 3 THEN RAISE EXCEPTION 'Level không hợp lệ.'; END IF;
  IF p_lesson_id IS NULL OR length(p_lesson_id) > 200 THEN RAISE EXCEPTION 'Bài học không hợp lệ.'; END IF;

  SELECT * INTO v_run FROM public.flytiee_adventure_runs
    WHERE user_id = v_user AND play_date = v_date;
  IF FOUND THEN RETURN to_jsonb(v_run); END IF;

  SELECT array_agg(picked.id) INTO v_ids FROM (
    SELECT q.id FROM public.practice_questions AS q
    JOIN public.practice_lessons AS l ON l.id = q.lesson_id
    WHERE q.lesson_id = p_lesson_id
      AND coalesce(nullif(q.difficulty_level, 0), 1) = p_level
      AND q.correct_answer BETWEEN 0 AND 3
      AND CASE WHEN jsonb_typeof(q.options) = 'array' THEN jsonb_array_length(q.options) = 4 ELSE false END
      AND nullif(btrim(q.content), '') IS NOT NULL
      AND jsonb_typeof(q.options -> 0) = 'string'
      AND jsonb_typeof(q.options -> 1) = 'string'
      AND jsonb_typeof(q.options -> 2) = 'string'
      AND jsonb_typeof(q.options -> 3) = 'string'
      AND nullif(btrim(q.options ->> 0), '') IS NOT NULL
      AND nullif(btrim(q.options ->> 1), '') IS NOT NULL
      AND nullif(btrim(q.options ->> 2), '') IS NOT NULL
      AND nullif(btrim(q.options ->> 3), '') IS NOT NULL
    ORDER BY random() LIMIT 5
  ) AS picked;
  IF coalesce(array_length(v_ids, 1), 0) <> 5 THEN
    RAISE EXCEPTION 'Bài này chưa đủ 5 câu hợp lệ ở Level đã chọn.';
  END IF;

  INSERT INTO public.flytiee_adventure_runs (user_id, play_date, level, lesson_id, question_ids)
  VALUES (v_user, v_date, p_level, p_lesson_id, v_ids)
  RETURNING * INTO v_run;
  RETURN to_jsonb(v_run);
END;
$$;

CREATE OR REPLACE FUNCTION public.flytiee_adventure_answer(p_selected INTEGER)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_run public.flytiee_adventure_runs;
  v_index INTEGER;
  v_question public.practice_questions;
  v_correct BOOLEAN;
  v_answers JSONB;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Hãy đăng nhập để tiếp tục.'; END IF;
  IF p_selected IS NULL OR p_selected NOT BETWEEN 0 AND 3 THEN RAISE EXCEPTION 'Đáp án không hợp lệ.'; END IF;

  SELECT * INTO v_run FROM public.flytiee_adventure_runs
    WHERE user_id = v_user AND play_date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    FOR UPDATE;
  IF NOT FOUND OR v_run.status <> 'active' THEN
    RAISE EXCEPTION 'Lượt Kỳ thú hôm nay không còn ở trạng thái trả lời.';
  END IF;
  v_index := jsonb_array_length(v_run.answers) + 1;
  IF v_index > 5 THEN RAISE EXCEPTION 'Đã trả lời đủ 5 câu.'; END IF;

  SELECT * INTO v_question FROM public.practice_questions
    WHERE id = v_run.question_ids[v_index];
  IF NOT FOUND THEN RAISE EXCEPTION 'Một câu hỏi đã thay đổi. Vui lòng liên hệ hỗ trợ để khôi phục lượt chơi.'; END IF;
  v_correct := p_selected = v_question.correct_answer;
  v_answers := v_run.answers || jsonb_build_array(jsonb_build_object(
    'question_id', v_question.id,
    'selected', p_selected,
    'correct', v_correct,
    'correct_answer', v_question.correct_answer,
    'solution', coalesce(v_question.solution, '')
  ));

  UPDATE public.flytiee_adventure_runs
  SET answers = v_answers,
      status = CASE WHEN v_index < 5 THEN 'active'
                    WHEN NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v_answers) AS answer(value) WHERE (answer.value ->> 'correct')::BOOLEAN = false) THEN 'won'
                    ELSE 'failed' END,
      updated_at = now()
  WHERE id = v_run.id RETURNING * INTO v_run;
  RETURN to_jsonb(v_run);
END;
$$;

CREATE OR REPLACE FUNCTION public.flytiee_adventure_spin()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_run public.flytiee_adventure_runs;
  v_roll INTEGER;
  v_index INTEGER;
  v_kind TEXT := 'coins';
  v_amount INTEGER;
  v_tier TEXT;
  v_metadata JSONB;
  v_profile JSONB;
  v_chests JSONB;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Hãy đăng nhập để quay thưởng.'; END IF;
  SELECT * INTO v_run FROM public.flytiee_adventure_runs
    WHERE user_id = v_user AND play_date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    FOR UPDATE;
  IF NOT FOUND OR v_run.status NOT IN ('won', 'claimed') THEN
    RAISE EXCEPTION 'Cần trả lời đúng cả 5 câu trước khi quay thưởng.';
  END IF;
  IF v_run.status = 'claimed' THEN RETURN to_jsonb(v_run); END IF;

  v_roll := floor(random() * 100)::INTEGER;
  IF v_run.level = 1 THEN
    v_index := CASE WHEN v_roll < 40 THEN 0 WHEN v_roll < 75 THEN 1 WHEN v_roll < 95 THEN 2 ELSE 3 END;
    IF v_index = 3 THEN v_kind := 'chest'; v_tier := 'bronze';
    ELSE v_amount := (ARRAY[10,15,20])[v_index + 1]; END IF;
  ELSIF v_run.level = 2 THEN
    v_index := CASE WHEN v_roll < 35 THEN 0 WHEN v_roll < 65 THEN 1 WHEN v_roll < 85 THEN 2 WHEN v_roll < 97 THEN 3 ELSE 4 END;
    IF v_index >= 3 THEN v_kind := 'chest'; v_tier := CASE WHEN v_index = 3 THEN 'bronze' ELSE 'silver' END;
    ELSE v_amount := (ARRAY[15,25,35])[v_index + 1]; END IF;
  ELSE
    v_index := CASE WHEN v_roll < 30 THEN 0 WHEN v_roll < 60 THEN 1 WHEN v_roll < 80 THEN 2 WHEN v_roll < 92 THEN 3 WHEN v_roll < 99 THEN 4 ELSE 5 END;
    IF v_index >= 3 THEN v_kind := 'chest'; v_tier := (ARRAY['bronze','silver','gold'])[v_index - 2];
    ELSE v_amount := (ARRAY[20,30,45])[v_index + 1]; END IF;
  END IF;

  -- Khóa hồ sơ tài khoản cùng giao dịch với lượt quay để không nhân đôi quà.
  SELECT coalesce(raw_user_meta_data, '{}'::jsonb) INTO v_metadata
    FROM auth.users WHERE id = v_user FOR UPDATE;
  v_profile := coalesce(v_metadata -> 'flytiee', '{"version":1,"name":"FlyTiee","coins":60,"chests":{"bronze":0,"silver":0,"gold":0}}'::jsonb);
  IF v_kind = 'coins' THEN
    v_profile := jsonb_set(v_profile, '{coins}', to_jsonb(coalesce((v_profile ->> 'coins')::INTEGER, 0) + v_amount), true);
  ELSE
    v_chests := coalesce(v_profile -> 'chests', '{"bronze":0,"silver":0,"gold":0}'::jsonb);
    v_chests := jsonb_set(v_chests, ARRAY[v_tier], to_jsonb(coalesce((v_chests ->> v_tier)::INTEGER, 0) + 1), true);
    v_profile := jsonb_set(v_profile, '{chests}', v_chests, true);
  END IF;
  UPDATE auth.users SET raw_user_meta_data = v_metadata || jsonb_build_object('flytiee', v_profile)
    WHERE id = v_user;

  -- Một số bản FlyTiee cũ đã cài bảng kho riêng cho Birdie Mail.
  -- Nếu bảng đó tồn tại, cộng cùng phần thưởng để hai nguồn không lệch nhau.
  IF to_regclass('public.flytiee_profiles') IS NOT NULL THEN
    IF v_kind = 'coins' THEN
      EXECUTE 'UPDATE public.flytiee_profiles SET coins = coins + $1 WHERE user_id = $2'
        USING v_amount, v_user;
    ELSE
      EXECUTE 'UPDATE public.flytiee_profiles SET chests = jsonb_set(chests, ARRAY[$1], to_jsonb(coalesce((chests ->> $1)::INTEGER, 0) + 1), true) WHERE user_id = $2'
        USING v_tier, v_user;
    END IF;
  END IF;

  UPDATE public.flytiee_adventure_runs
  SET status = 'claimed', reward_kind = v_kind, reward_amount = v_amount,
      reward_chest_tier = v_tier, reward_index = v_index, updated_at = now()
  WHERE id = v_run.id RETURNING * INTO v_run;
  RETURN to_jsonb(v_run);
END;
$$;

REVOKE ALL ON FUNCTION public.flytiee_adventure_catalog(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.flytiee_adventure_start(INTEGER, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.flytiee_adventure_answer(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.flytiee_adventure_spin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.flytiee_adventure_catalog(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.flytiee_adventure_start(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.flytiee_adventure_answer(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.flytiee_adventure_spin() TO authenticated;

COMMIT;
