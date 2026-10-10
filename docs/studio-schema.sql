create table public.studio_editors (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.studio_editors enable row level security;
revoke all on public.studio_editors from anon, authenticated;
grant select on public.studio_editors to authenticated;
create policy "Editors can inspect their own membership" on public.studio_editors
 for select to authenticated using (user_id = (select auth.uid()));

create table public.studio_projects (
 id text primary key check (length(id) between 1 and 150),
 document jsonb not null check (jsonb_typeof(document) = 'object'),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.studio_projects enable row level security;
revoke all on public.studio_projects from anon, authenticated;
grant select, insert, update, delete on public.studio_projects to authenticated;
create policy "Approved editors manage drafts" on public.studio_projects
 for all to authenticated
 using (exists (select 1 from public.studio_editors where user_id = (select auth.uid())))
 with check (exists (select 1 from public.studio_editors where user_id = (select auth.uid())));

create table public.studio_assets (
 id uuid primary key default gen_random_uuid(),
 project_id text not null references public.studio_projects(id) on delete restrict,
 object_path text unique not null,
 width integer not null check (width > 0),
 height integer not null check (height > 0),
 byte_size bigint not null check (byte_size > 0),
 created_at timestamptz not null default now()
);
create index studio_assets_project_id_idx on public.studio_assets(project_id);
alter table public.studio_assets enable row level security;
revoke all on public.studio_assets from anon, authenticated;
grant select, insert, update, delete on public.studio_assets to authenticated;
create policy "Approved editors manage asset records" on public.studio_assets
 for all to authenticated
 using (exists (select 1 from public.studio_editors where user_id = (select auth.uid())))
 with check (exists (select 1 from public.studio_editors where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 values ('studio-drafts', 'studio-drafts', false, 20971520, ARRAY['image/webp','image/jpeg','image/png']);
create policy "Approved editors manage private images" on storage.objects
 for all to authenticated
 using (bucket_id = 'studio-drafts' and exists (select 1 from public.studio_editors where user_id = (select auth.uid())))
 with check (bucket_id = 'studio-drafts' and exists (select 1 from public.studio_editors where user_id = (select auth.uid())));


-- Restrict the provider-created automatic RLS event trigger helper.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
