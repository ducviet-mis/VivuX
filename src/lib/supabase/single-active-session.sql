-- =============================================
-- FlyDo: mỗi tài khoản chỉ có một phiên đăng nhập hoạt động
-- Chạy toàn bộ file này một lần trong Supabase SQL Editor.
-- =============================================

CREATE TABLE IF NOT EXISTS public.active_account_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.active_account_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own active session" ON public.active_account_sessions;
CREATE POLICY "Users can read own active session"
ON public.active_account_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Bật tín hiệu thời gian thực để thiết bị cũ nhận ra phiên đã bị thay thế ngay.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'active_account_sessions'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.active_account_sessions;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_current_session(
  p_session_id TEXT,
  p_replace BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_active_session_id TEXT;
BEGIN
  IF v_user_id IS NULL OR NULLIF(BTRIM(p_session_id), '') IS NULL THEN
    RETURN jsonb_build_object('active', FALSE);
  END IF;

  INSERT INTO public.active_account_sessions (user_id, session_id)
  VALUES (v_user_id, p_session_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT session_id
  INTO v_active_session_id
  FROM public.active_account_sessions
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF p_replace THEN
    UPDATE public.active_account_sessions
    SET session_id = p_session_id,
        updated_at = NOW()
    WHERE user_id = v_user_id;
    v_active_session_id := p_session_id;
  END IF;

  RETURN jsonb_build_object('active', v_active_session_id = p_session_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_current_session(p_session_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count BIGINT;
BEGIN
  DELETE FROM public.active_account_sessions
  WHERE user_id = auth.uid()
    AND session_id = p_session_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_my_active_session()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.active_account_sessions WHERE user_id = auth.uid();
$$;

REVOKE ALL ON TABLE public.active_account_sessions FROM anon, authenticated;
GRANT SELECT ON TABLE public.active_account_sessions TO authenticated;
REVOKE ALL ON FUNCTION public.register_current_session(TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_current_session(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_my_active_session() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_current_session(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_current_session(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_my_active_session() TO authenticated;
