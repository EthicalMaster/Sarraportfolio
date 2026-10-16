import {Hono} from 'hono'
import {bodyLimit} from 'hono/body-limit'
import {env} from 'hono/adapter'
import {createHmac} from 'node:crypto'
import {sameOrigin,authConfig,createAuth} from './admin/auth'
import {publicClient} from './data/cloud-projects'
export const events=['pageview','email','linkedin','instagram','booklet']
export function validEvent(p:any){return !!p&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(p.id||'')&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(p.session||'')&&typeof p.path==='string'&&/^\/(?:about|contact|work(?:\/[a-z0-9-]{1,150})?)?$/.test(p.path)&&events.includes(p.event)&&['direct','google','linkedin','instagram','other'].includes(p.source)&&['mobile','tablet','desktop'].includes(p.device)}
export function trackingConfig(c:any){const e=env<{STUDIO_ANALYTICS_KEY?:string;VERCEL_ENV?:string}>(c);return {key:e.STUDIO_ANALYTICS_KEY||'',production:e.VERCEL_ENV==='production'}}
export const analytics=new Hono()
analytics.use('*',bodyLimit({maxSize:2048,onError:c=>c.body(null,413)}))
analytics.post('/',async c=>{
 c.header('Cache-Control','no-store')
 const {key,production}=trackingConfig(c)
 if(!production||key.length!==64)return c.body(null,204)
 if(!sameOrigin(c))return c.body(null,403)
 if(c.req.header('DNT')==='1'||c.req.header('Sec-GPC')==='1'||/(?:^|;\s*)sb-[^=]+=/.test(c.req.header('Cookie')||'')||/bot|crawler|spider|headless/i.test(c.req.header('User-Agent')||''))return c.body(null,204)
 try{
 const p=await c.req.json();if(!validEvent(p))return c.body(null,400)
 const db=publicClient(c);if(!db)return c.body(null,204)
 const {error}=await db.rpc('studio_record_analytics',{write_key:key,event_id:p.id,visit_hash:createHmac('sha256',key).update(p.session).digest('hex'),page_path:p.path,event_name:p.event,ref_source:p.source,device_type:p.device})
 return c.body(null,error?503:204)
 }catch{return c.body(null,400)}
})
export async function analyticsReport(c:any){
 const days=Number(c.req.query('days')||7);if(![7,30].includes(days))return c.json({error:'Choose 7 or 30 days'},400)
 const config=authConfig(c);if(!config)return c.json({error:'Sign-in required'},401)
 const {data,error}=await createAuth(c,config).rpc('studio_analytics_report',{period_days:days})
 if(error)return c.json({error:'Analytics could not load. Please try again.'},503)
 const {key,production}=trackingConfig(c)
 return c.json({...data,configured:key.length===64,production})
}
