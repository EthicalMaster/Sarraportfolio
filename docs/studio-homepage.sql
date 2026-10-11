create table public.studio_homepage (
 id boolean primary key default true check(id),
 selected_slugs text[] check(cardinality(selected_slugs)<=4),
 hero_id uuid references public.studio_assets(id),
 poster_id uuid references public.studio_assets(id),
 check ((hero_id is null)=(poster_id is null))
);
insert into public.studio_homepage(id) values(true);
alter table public.studio_homepage enable row level security;
grant select on public.studio_homepage to anon,authenticated;
grant update on public.studio_homepage to authenticated;
create policy "Public reads homepage settings" on public.studio_homepage for select to anon,authenticated using(true);
create policy "Editors update homepage" on public.studio_homepage for update to authenticated using(exists(select 1 from public.studio_editors where user_id=auth.uid())) with check(exists(select 1 from public.studio_editors where user_id=auth.uid()));
create policy "Public reads active hero metadata" on public.studio_assets for select to anon using(ready and exists(select 1 from public.studio_homepage h where studio_assets.id in(h.hero_id,h.poster_id)));
create policy "Public reads active hero objects" on storage.objects for select to anon using(bucket_id='studio-drafts' and exists(select 1 from public.studio_assets a join public.studio_homepage h on a.id in(h.hero_id,h.poster_id) where a.object_path=name and a.ready));
update storage.buckets set file_size_limit=41943040,allowed_mime_types=array['image/webp','image/jpeg','image/png','video/mp4'] where id='studio-drafts';
create function public.studio_set_hero(video uuid,poster uuid) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 perform pg_advisory_xact_lock(741632);
 if (video is null)<>(poster is null) then raise exception 'Video and poster required'; end if;
 if video is not null then
  if not exists(select 1 from public.studio_assets where id=video and ready and object_path like '%.mp4') then raise exception 'Video not ready'; end if;
  if not exists(select 1 from public.studio_assets where id=poster and ready and object_path ~ '\.(jpg|png|webp)$') then raise exception 'Poster not ready'; end if;
 end if;
 update public.studio_homepage set hero_id=video,poster_id=poster where id=true;
 return true;
end $$;
revoke all on function public.studio_set_hero(uuid,uuid) from public,anon;
grant execute on function public.studio_set_hero(uuid,uuid) to authenticated;
create or replace function public.studio_claim_unused_assets() returns setof public.studio_assets
language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 perform pg_advisory_xact_lock(741632);
 return query update public.studio_assets a set ready=false
 where a.id in (select x.id from public.studio_assets x
 where x.created_at<now()-interval '2 hours'
 and not exists(select 1 from public.studio_projects d where x.id=any(d.asset_ids))
 and not exists(select 1 from public.studio_publications p where p.active and x.id=any(p.asset_ids))
 and not exists(select 1 from public.studio_homepage h where x.id in(h.hero_id,h.poster_id))
 limit 100) returning a.*;
end $$;
