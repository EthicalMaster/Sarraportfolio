create function public.studio_claim_unused_assets() returns setof public.studio_assets
language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 perform pg_advisory_xact_lock(741632);
 return query update public.studio_assets a set ready=false
 where a.id in (select x.id from public.studio_assets x
 where x.created_at<now()-interval '2 hours'
 and not exists(select 1 from public.studio_projects d where x.id=any(d.asset_ids))
 and not exists(select 1 from public.studio_publications p where p.active and x.id=any(p.asset_ids))
 limit 100) returning a.*;
end $$;
revoke all on function public.studio_claim_unused_assets() from public,anon;
grant execute on function public.studio_claim_unused_assets() to authenticated;
create function public.studio_delete_draft(p_id text,p_revision bigint) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 perform pg_advisory_xact_lock(741632);
 if exists(select 1 from public.studio_publications where project_id=p_id and active) then raise exception 'Archive first'; end if;
 delete from public.studio_projects where id=p_id and revision=p_revision;
 if not found then raise exception 'Draft conflict'; end if;
 return true;
end $$;
revoke all on function public.studio_delete_draft(text,bigint) from public,anon;
grant execute on function public.studio_delete_draft(text,bigint) to authenticated;

