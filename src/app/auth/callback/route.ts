import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionIdFromAccessToken } from '@/lib/auth/single-session';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') ?? '/home';

  // Chỉ cho phép đường dẫn nội bộ để tránh chuyển hướng ra website lạ.
  if (!next.startsWith('/') || next.startsWith('//')) next = '/home';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const sessionId = getSessionIdFromAccessToken(data.session.access_token);
      if (sessionId) {
        await supabase.rpc('register_current_session', {
          p_session_id: sessionId,
          p_replace: true,
        });
      }
      await supabase.auth.signOut({ scope: 'others' });
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?oauth_error=1', requestUrl.origin));
}
