create schema if not exists studio_private;
revoke all on schema studio_private from public,anon,authenticated;
create table studio_private.analytics_config(id boolean primary key default true check(id),key_hash text not null,started_at timestamptz not null default now());
alter table studio_private.analytics_config enable row level security;
create policy "No client access to analytics key" on studio_private.analytics_config for all to anon,authenticated using(false) with check(false);
create table public.studio_analytics_events(
 id uuid primary key, occurred_at timestamptz not null default now(),
 session_hash text not null check(session_hash ~ '^[a-f0-9]{64}$'),
 path text not null check(path ~ '^(/|/about|/contact|/work|/work/[a-z0-9-]{1,150})$'),
 event text not null check(event in('pageview','email','linkedin','instagram','booklet')),
 source text not null check(source in('direct','google','linkedin','instagram','other')),
 device text not null check(device in('mobile','tablet','desktop'))
);
alter table public.studio_analytics_events enable row level security;
revoke all on public.studio_analytics_events from anon,authenticated;
grant select on public.studio_analytics_events to authenticated;
create policy "Editors read portfolio analytics" on public.studio_analytics_events for select to authenticated using(exists(select 1 from public.studio_editors where user_id=(select auth.uid())));
create index studio_analytics_time on public.studio_analytics_events(occurred_at);
create index studio_analytics_session_time on public.studio_analytics_events(session_hash,occurred_at);
-- Capability-authorised ingestion only: server keeps the key, public clients cannot read or insert rows.
create function public.studio_record_analytics(write_key text,event_id uuid,visit_hash text,page_path text,event_name text,ref_source text,device_type text) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null or write_key is null or length(write_key)<>64 then return false; end if;
 if not exists(select 1 from studio_private.analytics_config where key_hash=encode(sha256(convert_to(write_key,'UTF8')),'hex')) then return false; end if;
 if event_id is null or visit_hash is null or visit_hash !~ '^[a-f0-9]{64}$' or page_path is null or page_path !~ '^(/|/about|/contact|/work|/work/[a-z0-9-]{1,150})$' or event_name is null or event_name not in('pageview','email','linkedin','instagram','booklet') or ref_source is null or ref_source not in('direct','google','linkedin','instagram','other') or device_type is null or device_type not in('mobile','tablet','desktop') then return false; end if;
 perform pg_advisory_xact_lock(741633);
 delete from public.studio_analytics_events where occurred_at<now()-interval '90 days';
 if (select count(*) from public.studio_analytics_events where session_hash=visit_hash and occurred_at>=now()-interval '1 day')>=300 then return false; end if;
 if (select count(*) from public.studio_analytics_events where occurred_at>=date_trunc('day',now()))>=10000 then return false; end if;
 insert into public.studio_analytics_events(id,session_hash,path,event,source,device) values(event_id,visit_hash,page_path,event_name,ref_source,device_type) on conflict(id) do nothing;
 return true;
end $$;
revoke all on function public.studio_record_analytics(text,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.studio_record_analytics(text,uuid,text,text,text,text,text) to anon;
create function public.studio_analytics_report(period_days integer) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result jsonb; start_time timestamptz;
begin
 if not exists(select 1 from public.studio_editors where user_id=auth.uid()) then raise exception 'Not authorised'; end if;
 if period_days not in(7,30) or period_days is null then raise exception 'Invalid period'; end if;
 start_time:=((now() at time zone 'Asia/Kolkata')::date-(period_days-1))::timestamp at time zone 'Asia/Kolkata';
 with events as(select * from public.studio_analytics_events where occurred_at>=start_time),
 days as(select generate_series((start_time at time zone 'Asia/Kolkata')::date,(now() at time zone 'Asia/Kolkata')::date,'1 day')::date as day),
 daily as(select d.day,count(e.id) filter(where e.event='pageview') as views,count(distinct e.session_hash) filter(where e.event='pageview') as visits from days d left join events e on (e.occurred_at at time zone 'Asia/Kolkata')::date=d.day group by d.day order by d.day),
 pages as(select path,count(*) as views from events where event='pageview' group by path order by views desc,path limit 12),
 sources as(select source,count(distinct session_hash) as visits from events where event='pageview' group by source order by visits desc),
 devices as(select device,count(*) as views from events where event='pageview' group by device order by views desc),
 clicks as(select event,count(*) as clicks from events where event<>'pageview' group by event)
 select jsonb_build_object('days',period_days,'timezone','Asia/Kolkata','updatedAt',now(),'views',(select count(*) from events where event='pageview'),'visits',(select count(distinct session_hash) from events where event='pageview'),'clicks',(select count(*) from events where event<>'pageview'),'daily',coalesce((select jsonb_agg(daily) from daily),'[]'::jsonb),'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),'devices',coalesce((select jsonb_agg(devices) from devices),'[]'::jsonb),'actions',coalesce((select jsonb_agg(clicks) from clicks),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.studio_analytics_report(integer) from public,anon;
grant execute on function public.studio_analytics_report(integer) to authenticated;
