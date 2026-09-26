-- Ambesh.dev online backend for GitHub Pages + Supabase
-- 1) Run this whole file in Supabase SQL Editor.
-- 2) Create an Admin user in Authentication > Users.
-- 3) Copy that user's UUID into the admins insert at the bottom.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'Website',
  description text default '',
  tags text[] not null default '{}',
  theme text default 'blue',
  link text default '',
  featured boolean not null default false,
  image text default '',
  gallery text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text not null,
  description text default '',
  features text[] not null default '{}',
  popular boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  brand text default 'Ambesh.dev',
  tagline text default 'Ideas to Digital Reality',
  email text default 'ambesh@example.com',
  phone text default '+91 XXXXX XXXXX',
  location text default 'Uttar Pradesh, India',
  response text default 'Usually within 24 hours',
  projects_completed text default '50+',
  clients text default '30+',
  rating text default '4.9',
  experience text default '2+',
  hero_title text default 'Turning Ideas Into Digital Reality.',
  hero_text text default 'I design and develop modern websites, mobile apps, dashboards and UI/UX experiences that help ideas become real products.',
  about text default 'I''m Ambesh Shukla, a BCA student and aspiring designer/developer who enjoys turning ideas into clean, useful digital experiences.',
  linkedin text default '#', instagram text default '#', youtube text default '#', github text default '#',
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values (1) on conflict (id) do nothing;

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  type text default 'Website',
  message text not null,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.projects enable row level security;
alter table public.pricing enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

-- Public read access
create policy "public read projects" on public.projects for select using (true);
create policy "public read active pricing" on public.pricing for select using (active = true or public.is_admin());
create policy "public read site settings" on public.site_settings for select using (true);

-- Admin full access
create policy "admins manage projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage pricing" on public.pricing for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read enquiries" on public.enquiries for select using (public.is_admin());
create policy "admins update enquiries" on public.enquiries for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete enquiries" on public.enquiries for delete using (public.is_admin());
create policy "public submit enquiries" on public.enquiries for insert with check (true);

-- Storage: public bucket for project screenshots.
insert into storage.buckets (id, name, public) values ('project-images','project-images',true) on conflict (id) do update set public = true;
create policy "public view project images" on storage.objects for select using (bucket_id = 'project-images');
create policy "admins upload project images" on storage.objects for insert with check (bucket_id = 'project-images' and public.is_admin());
create policy "admins update project images" on storage.objects for update using (bucket_id = 'project-images' and public.is_admin()) with check (bucket_id = 'project-images' and public.is_admin());
create policy "admins delete project images" on storage.objects for delete using (bucket_id = 'project-images' and public.is_admin());

-- AFTER creating your admin user, run this with their Auth user UUID:
-- insert into public.admins(user_id) values ('PASTE-ADMIN-USER-UUID-HERE');
