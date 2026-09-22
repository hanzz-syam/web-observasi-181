-- =====================================================================
-- SI-OBSERVASI 181: skema database Supabase
-- Cara pakai: Supabase -> SQL Editor -> New query -> tempel seluruh isi
-- file ini -> Run. Aman dijalankan ulang.
-- =====================================================================

-- 1. TABEL ------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  nama        text not null default '',
  role        text not null default 'guru' check (role in ('kepsek', 'guru')),
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.observations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  guru_id     uuid references public.profiles(id) on delete set null,
  guru        text not null,
  kelas       text not null,
  mapel       text not null,
  topik       text not null default '',
  tanggal     date not null,
  scores      smallint[] not null check (scores <@ array[1,2,3,4]::smallint[]),
  total       integer not null,
  avg         numeric(4,2) not null,
  nilai       integer not null,
  murid       jsonb not null default '{}'::jsonb,
  guru_ref    jsonb not null default '{}'::jsonb,
  catatan     text not null default ''
);

create index if not exists observations_guru_id_idx on public.observations (guru_id);
create index if not exists observations_tanggal_idx on public.observations (tanggal desc);

-- 2. FUNGSI BANTU -----------------------------------------------------

create or replace function public.is_approved()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved)
$$;

create or replace function public.is_kepsek()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'kepsek' and p.approved
  )
$$;

-- 3. AKUN BARU: buat profil otomatis ---------------------------------
-- Akun pertama yang mendaftar menjadi kepala sekolah (langsung aktif).
-- Akun berikutnya menjadi guru dan menunggu persetujuan kepala sekolah.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.profiles) into is_first;
  insert into public.profiles (id, email, nama, role, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    case when is_first then 'kepsek' else 'guru' end,
    is_first
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. KEAMANAN PER BARIS (Row Level Security) --------------------------

alter table public.profiles     enable row level security;
alter table public.observations enable row level security;

-- profiles: pengguna melihat profilnya sendiri; kepala sekolah melihat dan mengubah semua
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_kepsek());

drop policy if exists "profiles_update_kepsek" on public.profiles;
create policy "profiles_update_kepsek" on public.profiles
  for update to authenticated
  using (public.is_kepsek()) with check (public.is_kepsek());

-- observations: kepala sekolah penuh; guru hanya membaca miliknya
drop policy if exists "obs_kepsek_all" on public.observations;
create policy "obs_kepsek_all" on public.observations
  for all to authenticated
  using (public.is_kepsek()) with check (public.is_kepsek());

drop policy if exists "obs_guru_select_own" on public.observations;
create policy "obs_guru_select_own" on public.observations
  for select to authenticated
  using (public.is_approved() and guru_id = auth.uid());

-- 5. GURU MENGISI REFLEKSINYA SENDIRI --------------------------------
-- Guru tidak boleh mengubah kolom lain (skor, catatan), jadi hanya lewat fungsi ini.

create or replace function public.simpan_refleksi_guru(p_id uuid, p_ref jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_approved() then
    raise exception 'Akun belum disetujui';
  end if;
  update public.observations
     set guru_ref = coalesce(p_ref, '{}'::jsonb)
   where id = p_id and guru_id = auth.uid();
  if not found then
    raise exception 'Observasi tidak ditemukan atau bukan milik Anda';
  end if;
end;
$$;

revoke all on function public.simpan_refleksi_guru(uuid, jsonb) from public, anon;
grant execute on function public.simpan_refleksi_guru(uuid, jsonb) to authenticated;
