alter table public.studio_projects add column asset_ids uuid[] not null default '{}';
alter table public.studio_assets alter column project_id drop not null;
alter table public.studio_assets add column ready boolean not null default false;
create table public.studio_publications (
 project_id text primary key,
 slug text unique not null,
 source_slug text unique,
 aliases text[] not null default '{}',
 document jsonb,
 asset_ids uuid[] not null default '{}',
 active boolean not null default true,
 published_at timestamptz not null default now(),
 check ((active and document is not null) or (not active and document is null))
);
alter table public.studio_publications enable row level security;
revoke all on public.studio_publications from public, anon, authenticated;
grant select on public.studio_publications to anon, authenticated;
grant insert,update,delete on public.studio_publications to authenticated;
create policy "Public can read published snapshots and archive markers" on public.studio_publications for select to anon,authenticated using(true);
create policy "Approved editors publish" on public.studio_publications for all to authenticated
 using(exists(select 1 from public.studio_editors where user_id=(select auth.uid())))
 with check(exists(select 1 from public.studio_editors where user_id=(select auth.uid())));
grant select on public.studio_assets to anon;
create policy "Public reads published asset metadata" on public.studio_assets for select to anon
 using(ready and exists(select 1 from public.studio_publications p where p.active and studio_assets.id=any(p.asset_ids)));
create policy "Public reads only published images" on storage.objects for select to anon
 using(bucket_id='studio-drafts' and exists(select 1 from public.studio_assets a where a.object_path=name and a.ready and exists(select 1 from public.studio_publications p where p.active and a.id=any(p.asset_ids))));
create index studio_publications_assets_idx on public.studio_publications using gin(asset_ids);
create index studio_projects_assets_idx on public.studio_projects using gin(asset_ids);

create function public.studio_save_drafts(items jsonb) returns setof public.studio_projects
language plpgsql security invoker set search_path='' as $$
declare item jsonb; changed public.studio_projects; ids uuid[];
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 if jsonb_typeof(items)<>'array' or jsonb_array_length(items)>100 then raise exception 'Invalid batch'; end if;
 perform pg_advisory_xact_lock(741632);
 for item in select value from jsonb_array_elements(items) loop
  select coalesce(array_agg(value::uuid),'{}') into ids from jsonb_array_elements_text(item->'asset_ids');
  if exists(select 1 from unnest(ids) x where not exists(select 1 from public.studio_assets a where a.id=x and a.ready)) then raise exception 'Image is not ready'; end if;
  if (item->>'revision') is null then
   insert into public.studio_projects(id,document,asset_ids) values(item->>'id',item->'document',ids) returning * into changed;
  else
   update public.studio_projects set document=item->'document',asset_ids=ids,revision=revision+1,updated_at=now()
   where id=item->>'id' and revision=(item->>'revision')::bigint returning * into changed;
   if not found then raise exception 'Draft conflict: reload before saving'; end if;
  end if;
  return next changed;
 end loop;
end $$;
revoke all on function public.studio_save_drafts(jsonb) from public,anon;
grant execute on function public.studio_save_drafts(jsonb) to authenticated;

create function public.studio_publish(p_id text,p_revision bigint,archive boolean default false) returns public.studio_publications
language plpgsql security invoker set search_path='' as $$
declare d public.studio_projects; old public.studio_publications; result public.studio_publications; history text[]; name text;
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 perform pg_advisory_xact_lock(741632);
 select * into d from public.studio_projects where id=p_id for update;
 if not found or d.revision<>p_revision then raise exception 'Draft conflict: reload before publishing'; end if;
 select * into old from public.studio_publications where project_id=p_id;
 name:=coalesce(nullif(d.document->>'slug',''),old.slug,d.document->>'sourceSlug');
 if name is null or name !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'A valid project URL is required'; end if;
 if not archive and (coalesce((d.document->>'sample')::boolean,true) or d.document->'cover' is null or d.document->'cover'='null'::jsonb or coalesce(d.document->>'title','')='') then raise exception 'Replace sample content and add a cover before publishing'; end if;
 if not archive and exists(select 1 from unnest(d.asset_ids) x where not exists(select 1 from public.studio_assets a where a.id=x and a.ready)) then raise exception 'Image is not ready'; end if;
 select coalesce(array_agg(distinct x) filter(where x is not null and x<>name),'{}') into history
 from unnest(coalesce(old.aliases,'{}')||array[old.slug,d.document->>'sourceSlug']) x;
 insert into public.studio_publications(project_id,slug,source_slug,aliases,document,asset_ids,active)
 values(p_id,name,nullif(d.document->>'sourceSlug',''),history,case when archive then null else d.document end,case when archive then '{}'::uuid[] else d.asset_ids end,not archive)
 on conflict(project_id) do update set slug=excluded.slug,source_slug=excluded.source_slug,aliases=excluded.aliases,document=excluded.document,asset_ids=excluded.asset_ids,active=excluded.active,published_at=now()
 returning * into result;
 return result;
end $$;
revoke all on function public.studio_publish(text,bigint,boolean) from public,anon;
grant execute on function public.studio_publish(text,bigint,boolean) to authenticated;

