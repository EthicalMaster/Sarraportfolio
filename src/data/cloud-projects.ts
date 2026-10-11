import { createClient } from '@supabase/supabase-js'
import { env } from 'hono/adapter'
import type { Context } from 'hono'
import { allProjects, type Project } from './projects'
export type PublishedProject=Project & {studio?:any}
export function publicClient(c:Context){const e=env<{SUPABASE_URL?:string;SUPABASE_PUBLISHABLE_KEY?:string}>(c);return e.SUPABASE_URL&&e.SUPABASE_PUBLISHABLE_KEY?createClient(e.SUPABASE_URL,e.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null}
export function mergePublications(rows:any[],base=allProjects()):PublishedProject[]{
 const replaced=new Set(rows.map(r=>r.source_slug).filter(Boolean))
 const live=rows.filter(r=>r.active&&r.document).map(r=>{const d=r.document;return {id:d.id,slug:r.slug,title:d.title,subtitle:d.subtitle,year:d.year,discipline:d.discipline,track:d.track,category:d.category,location:d.location,description:d.overview,statement:d.approach,facts:[{label:'Role',value:d.role},...(d.facts||[])],coverImage:d.cover.src,featured:d.featured,order:d.order+1,tone:0,gallery:d.sections.flatMap((s:any)=>s.images.map((im:any)=>({src:im.src,alt:im.alt,caption:im.caption,ratio:`${im.width} / ${im.height}`}))),studio:d} as PublishedProject})
 // A published URL takes precedence over a sample URL as well as its assigned source slot.
 const occupied=new Set(live.map(p=>p.slug));return [...base.filter(p=>!replaced.has(p.slug)&&!occupied.has(p.slug)),...live].sort((a,b)=>a.order-b.order)
}
export async function portfolio(c:Context){const client=publicClient(c);if(!client)return {projects:allProjects() as PublishedProject[],publications:[] as any[]};const {data,error}=await client.from('studio_publications').select('*');if(error)throw Error('Published content temporarily unavailable');return {projects:mergePublications(data),publications:data}}
export async function publicMedia(c:Context){const id=c.req.param('id');if(!/^[0-9a-f-]{36}$/i.test(id))return c.notFound();const db=publicClient(c);if(!db)return c.notFound();const asset=await db.from('studio_assets').select('object_path').eq('id',id).eq('ready',true).single();if(asset.error)return c.notFound();const signed=await db.storage.from('studio-drafts').createSignedUrl(asset.data.object_path,300);if(signed.error)return c.notFound();c.header('Cache-Control','public, max-age=60');return c.redirect(signed.data.signedUrl,302)}
