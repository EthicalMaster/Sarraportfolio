import {portfolio,homepageSettings,homepageSelection} from '../data/cloud-projects'
import { Hono } from 'hono'
import { createAuth, authConfig } from './auth'
import { validateDraft, imageList, publicationErrors } from './cloud-model'
const bucket='studio-drafts'
export function uploadMatches(info:any,bytes:number,video=false){
 const size=info?.size??info?.metadata?.size;
 const type=info?.contentType??info?.metadata?.mimetype;
 return Number.isSafeInteger(size)&&size===bytes&&(video?['video/mp4']:['image/webp','image/jpeg','image/png']).includes(type);
}
const uuid=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
export const cloud=new Hono()
// Mounted behind the verified studio auth middleware. Always uses the editor's JWT.
const client=(c:any)=>createAuth(c,authConfig(c)!)
cloud.get('/projects',async c=>{
 const db=client(c),drafts=await db.from('studio_projects').select('*'),pub=await db.from('studio_publications').select('project_id,active,published_at')
 if(drafts.error||pub.error)return c.json({error:'Could not load cloud projects'},503)
 return c.json({projects:drafts.data.map(r=>({...r.document,cloudRevision:r.revision,published:pub.data.find(p=>p.project_id===r.id)?.active||false})),publications:pub.data})
})
cloud.post('/projects',async c=>{
 try{
 const body=await c.req.json();if(!Array.isArray(body.projects)||body.projects.length>100)return c.json({error:'Invalid project batch'},400)
 const docs=body.projects.map((p:any)=>{if(p.cloudRevision!=null&&(!Number.isSafeInteger(p.cloudRevision)||p.cloudRevision<1))throw Error('Invalid draft revision');const document=validateDraft(p);return {id:document.id,document,revision:p.cloudRevision??null,asset_ids:[...new Set(imageList(document).map((i:any)=>i.id))]}})
 const {data,error}=await client(c).rpc('studio_save_drafts',{items:docs})
 if(error)return c.json({error:error.code==='23505'||error.message.includes('conflict')?'This project changed elsewhere. Reload the studio before saving; copy any unsaved text first.':'Save failed. Check that all images finished uploading.'},409)
 return c.json({projects:data.map((r:any)=>({...r.document,cloudRevision:r.revision}))})
 }catch{return c.json({error:'Invalid project content. Check the fields and image uploads.'},400)}
})
cloud.post('/upload',async c=>{
 const p=await c.req.json();if(!['image/webp','image/jpeg','image/png'].includes(p.type)||!Number.isInteger(p.bytes)||p.bytes<1||p.bytes>20971520||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||p.width*p.height>80000000)return c.json({error:'Invalid image'},400)
 const id=crypto.randomUUID(),path=`${id}.${p.type==='image/webp'?'webp':p.type==='image/png'?'png':'jpg'}`,db=client(c)
 const record=await db.from('studio_assets').insert({id,object_path:path,width:p.width,height:p.height,byte_size:p.bytes})
 if(record.error)return c.json({error:'Could not prepare upload'},503)
 const {data,error}=await db.storage.from(bucket).createSignedUploadUrl(path,{upsert:false})
 if(error)return c.json({error:'Could not prepare secure upload'},503)
 return c.json({id,url:data.signedUrl})
})
cloud.post('/upload/:id/complete',async c=>{
 const id=c.req.param('id');if(!uuid.test(id))return c.json({error:'Invalid image'},400)
 const db=client(c),asset=await db.from('studio_assets').select('*').eq('id',id).single()
 if(asset.error)return c.json({error:'Upload not found'},404)
 const info=await db.storage.from(bucket).info(asset.data.object_path)
 if(info.error||!uploadMatches(info.data,asset.data.byte_size,asset.data.object_path.endsWith('.mp4')))return c.json({error:'Upload is incomplete or its format is invalid'},409)
 const changed=await db.from('studio_assets').update({ready:true}).eq('id',id)
 if(changed.error)return c.json({error:'Could not finish upload'},503)
 return c.json({src:`/media/${id}`,id})
})
cloud.post('/publish',async c=>{
 const {id,revision,archive=false}=await c.req.json();if(typeof id!=='string'||!Number.isSafeInteger(revision)||typeof archive!=='boolean')return c.json({error:'Invalid request'},400)
 const db=client(c),draft=await db.from('studio_projects').select('*').eq('id',id).single()
 if(draft.error)return c.json({error:'Save the draft before publishing'},404)
 if(!archive){const errors=publicationErrors(draft.data.document);if(errors.length)return c.json({error:errors.join('. ')},400)}
 const result=await db.rpc('studio_publish',{p_id:id,p_revision:revision,archive})
 if(result.error)return c.json({error:'Could not publish. Reload if this draft changed in another tab, and check the project URL is unique.'},409)
 return c.json({publication:result.data})
})
cloud.delete('/projects/:id',async c=>{
 const db=client(c),id=c.req.param('id'),body=await c.req.json()
 const pub=await db.from('studio_publications').select('active').eq('project_id',id).maybeSingle()
 if(pub.error)return c.json({error:'Could not check publication'},503)
 if(pub.data?.active)return c.json({error:'Archive the published project before deleting it'},409)
 // Assets are immutable, shared by copies and may be referenced in published snapshots.
 // Keep their objects until the explicit unused-media cleanup checks references.
 const result=await db.rpc('studio_delete_draft',{p_id:id,p_revision:body.revision})
 if(result.error)return c.json({error:'Archive first, or reload if this draft changed.'},409)
 return c.json({ok:true})
})
cloud.post('/cleanup',async c=>{
 const db=client(c),claimed=await db.rpc('studio_claim_unused_assets')
 if(claimed.error)return c.json({error:'Could not check unused images'},503)
 if(!claimed.data.length)return c.json({removed:0})
 const deleted=await db.storage.from(bucket).remove(claimed.data.map((a:any)=>a.object_path))
 if(deleted.error)return c.json({error:'Image cleanup failed. It is safe to retry.'},503)
 const records=await db.from('studio_assets').delete().in('id',claimed.data.map((a:any)=>a.id)).eq('ready',false)
 if(records.error)return c.json({error:'Cleanup needs another pass. Please retry.'},503)
 return c.json({removed:claimed.data.length})
})
export async function privateMedia(c:any){
 const id=c.req.param('id');if(!uuid.test(id))return c.notFound()
 const db=client(c),asset=await db.from('studio_assets').select('object_path').eq('id',id).eq('ready',true).single()
 if(asset.error)return c.notFound()
 const signed=await db.storage.from(bucket).createSignedUrl(asset.data.object_path,300)
 return signed.error?c.notFound():c.redirect(signed.data.signedUrl,302)
}

cloud.get('/homepage',async c=>{
 const [content,settings]=await Promise.all([portfolio(c),homepageSettings(c)]);
 return c.json({settings,selected:homepageSelection(content.projects,settings.selected_slugs).map(p=>p.slug),projects:content.projects.map(p=>({slug:p.slug,title:p.title,cover:p.coverImage,sample:!p.studio}))});
});
cloud.post('/homepage/selection',async c=>{
 const {slugs}=await c.req.json();
 if(!Array.isArray(slugs)||slugs.length>4||slugs.some(s=>typeof s!=='string')||new Set(slugs).size!==slugs.length)return c.json({error:'Choose up to four different projects.'},400);
 const {projects}=await portfolio(c);
 if(slugs.some(s=>!projects.some(p=>p.slug===s)))return c.json({error:'A selected project is no longer published. Reload this page.'},409);
 const result=await client(c).from('studio_homepage').update({selected_slugs:slugs}).eq('id',true);
 return result.error?c.json({error:'Could not save homepage selection'},503):c.json({ok:true});
});
cloud.post('/hero/upload',async c=>{
 const p=await c.req.json();
 if(p.type!=='video/mp4'||!Number.isSafeInteger(p.bytes)||p.bytes<1||p.bytes>41943040||!Number.isFinite(p.duration)||p.duration<2||p.duration>30||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||p.width>1920||p.height>1920)return c.json({error:'Use an MP4, 2–30 seconds, up to 40 MB and 1920 pixels on either edge.'},400);
 const id=crypto.randomUUID(),path=id+'.mp4',db=client(c);
 const record=await db.from('studio_assets').insert({id,object_path:path,width:p.width,height:p.height,byte_size:p.bytes});
 if(record.error)return c.json({error:'Could not prepare video upload'},503);
 const {data,error}=await db.storage.from(bucket).createSignedUploadUrl(path,{upsert:false});
 return error?c.json({error:'Could not prepare video upload'},503):c.json({id,url:data.signedUrl});
});
cloud.post('/homepage/hero',async c=>{
 const {video,poster}=await c.req.json();
 if(!((video===null&&poster===null)||(typeof video==='string'&&uuid.test(video)&&typeof poster==='string'&&uuid.test(poster))))return c.json({error:'Invalid video selection'},400);
 const {error}=await client(c).rpc('studio_set_hero',{video,poster});
 return error?c.json({error:'Video could not be applied. Upload it again and retry.'},409):c.json({ok:true});
});
