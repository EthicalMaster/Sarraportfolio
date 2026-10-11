import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { setCookie } from 'hono/cookie'

export function authConfig(c:Context){
 const values=env<{SUPABASE_URL?:string;SUPABASE_PUBLISHABLE_KEY?:string;STUDIO_ALLOWED_USER_IDS?:string}>(c)
 const url=values.SUPABASE_URL, key=values.SUPABASE_PUBLISHABLE_KEY
 const ids=(values.STUDIO_ALLOWED_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean)
 if(!url||!key||!ids.length)return null
 // Only publishable credentials are accepted; never use a privileged service key.
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)||!key.startsWith('sb_publishable_'))return null
 if(ids.some(id=>!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)))return null
 return {url,key,ids}
}
export function createAuth(c:Context,config:NonNullable<ReturnType<typeof authConfig>>){
 return createServerClient(config.url,config.key,{
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:secureCookies(c),path:'/'},
  cookies:{getAll:()=>parseCookieHeader(c.req.header('Cookie')||''),
   setAll(cookies,headers){cookies.forEach(({name,value,options})=>setCookie(c,name,value,{...options,httpOnly:true,sameSite:'lax',secure:secureCookies(c),path:'/'}));Object.entries(headers||{}).forEach(([key,value])=>c.header(key,value));}
  }
 })
}
export async function authorisedUser(client:ReturnType<typeof createAuth>,ids:string[]){
 // getUser verifies against Auth; cookie contents and editable metadata are not trusted.
 const {data,error}=await client.auth.getUser()
 const user=data?.user
 if(error||!user||!user.email_confirmed_at||user.is_anonymous||!ids.includes(user.id))return null
 const membership=await client.from('studio_editors').select('user_id').eq('user_id',user.id).maybeSingle()
 return !membership.error&&membership.data?.user_id===user.id?user:null
}
export function studioOrigins(c:Context){
 const e=env<{STUDIO_PUBLIC_ORIGIN?:string;VERCEL?:string;VERCEL_URL?:string;VERCEL_PROJECT_PRODUCTION_URL?:string}>(c)
 const origins:string[]=[]
 // Server-controlled configuration only. Never derive trust from Origin/Forwarded headers.
 const add=(value:string)=>{try{const u=new URL(value);if(u.origin===value&&u.protocol==='https:'&&!u.username&&!u.password)origins.push(u.origin)}catch{}}
 if(e.STUDIO_PUBLIC_ORIGIN){add(e.STUDIO_PUBLIC_ORIGIN.trim());return origins}
 if(e.VERCEL==='1'){
  for(const host of [e.VERCEL_PROJECT_PRODUCTION_URL,e.VERCEL_URL])if(host&&/^[a-z0-9.-]+$/i.test(host))add('https://'+host)
  return origins
 }
 return [new URL(c.req.url).origin]
}
export function secureCookies(c:Context){
 const e=env<{VERCEL?:string;STUDIO_PUBLIC_ORIGIN?:string}>(c)
 return e.VERCEL==='1'||!!e.STUDIO_PUBLIC_ORIGIN||new URL(c.req.url).protocol==='https:'
}
export function sameOrigin(c:Context){const origin=c.req.header('Origin');return !!origin&&studioOrigins(c).includes(origin)}
