-- NOTE: 온보딩 필수 입력 필드 추가
alter table public.profiles
add column if not exists is_busan_district boolean;

alter table public.profiles
add column if not exists school text;

-- NOTE: role 선택지에 "기타"를 허용하도록 제약을 갱신
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_role_check;
  end if;

  alter table public.profiles
  add constraint profiles_role_check
  check (role in ('간사', '순장', '순원', '기타'));
end $$;
