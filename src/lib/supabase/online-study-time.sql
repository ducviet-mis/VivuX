-- Run once in the Supabase SQL Editor before deploying the online study timer.
-- A study day follows Vietnam time (Asia/Ho_Chi_Minh).

create table if not exists public.user_daily_online_time (
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  seconds numeric(12, 2) not null default 0 check (seconds >= 0),
  primary key (user_id, study_date)
);

create table if not exists public.user_online_time_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_ping timestamptz not null
);

alter table public.user_daily_online_time enable row level security;
alter table public.user_online_time_state enable row level security;

drop policy if exists "Read own daily online time" on public.user_daily_online_time;
create policy "Read own daily online time"
  on public.user_daily_online_time for select to authenticated
  using (auth.uid() = user_id);

revoke all on public.user_daily_online_time from anon, authenticated;
revoke all on public.user_online_time_state from anon, authenticated;
grant select on public.user_daily_online_time to authenticated;

create or replace function public.record_online_study_time(p_elapsed_seconds numeric default 0)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_previous timestamptz;
  v_credit numeric;
  v_start timestamptz;
  v_end timestamptz;
  v_boundary timestamptz;
  v_day date;
  v_today date;
  v_total numeric;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  -- Serialize heartbeats for the account, so multiple tabs/devices never add
  -- the same wall-clock interval twice. Client-reported time is capped at 15s.
  insert into public.user_online_time_state (user_id, last_ping)
  values (v_user, v_now)
  on conflict (user_id) do nothing;

  select last_ping into v_previous
  from public.user_online_time_state
  where user_id = v_user
  for update;

  -- Take the timestamp after acquiring the row lock; another tab may have
  -- updated last_ping while this request was waiting.
  v_now := clock_timestamp();

  v_credit := least(
    greatest(coalesce(p_elapsed_seconds, 0), 0),
    15,
    greatest(extract(epoch from (v_now - v_previous)), 0)
  );

  update public.user_online_time_state set last_ping = v_now where user_id = v_user;

  -- Split a heartbeat that crosses midnight into the correct Vietnam days.
  v_start := v_now - make_interval(secs => v_credit::double precision);
  while v_start < v_now loop
    v_day := (v_start at time zone 'Asia/Ho_Chi_Minh')::date;
    v_boundary := ((v_day + 1)::timestamp at time zone 'Asia/Ho_Chi_Minh');
    v_end := least(v_now, v_boundary);

    insert into public.user_daily_online_time (user_id, study_date, seconds)
    values (v_user, v_day, extract(epoch from (v_end - v_start)))
    on conflict (user_id, study_date) do update
      set seconds = public.user_daily_online_time.seconds + excluded.seconds;

    v_start := v_end;
  end loop;

  v_today := (v_now at time zone 'Asia/Ho_Chi_Minh')::date;
  select seconds into v_total
  from public.user_daily_online_time
  where user_id = v_user and study_date = v_today;

  return jsonb_build_object('date', v_today, 'seconds', coalesce(v_total, 0));
end;
$$;

revoke all on function public.record_online_study_time(numeric) from public, anon;
grant execute on function public.record_online_study_time(numeric) to authenticated;
