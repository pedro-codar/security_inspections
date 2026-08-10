-- Run once in Supabase SQL Editor (needed for the race-condition demo).
-- Each successful claim does: credits = credits + 10 (atomic per statement).

create or replace function public.increment_profile_credits(
  p_user_id uuid,
  p_amount numeric
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profile
  set credits = coalesce(credits, 0) + p_amount
  where id = p_user_id;
$$;

grant execute on function public.increment_profile_credits(uuid, numeric) to authenticated;
grant execute on function public.increment_profile_credits(uuid, numeric) to service_role;
