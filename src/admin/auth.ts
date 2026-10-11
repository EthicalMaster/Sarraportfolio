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
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:new URL(c.req.url).protocol==='https:',path:'/'},
  cookies:{getAll:()=>parseCookieHeader(c.req.header('Cookie')||''),
   setAll(cookies,headers){cookies.forEach(({name,value,options})=>setCookie(c,name,value,{...options,httpOnly:true,sameSite:'lax',secure:new URL(c.req.url).protocol==='https:',path:'/'}));Object.entries(headers||{}).forEach(([key,value])=>c.header(key,value));}
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
export function sameOrigin(c:Context){return c.req.header('Origin')===new URL(c.req.url).origin}
