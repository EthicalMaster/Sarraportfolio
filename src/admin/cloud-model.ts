const uuid=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
export const imageList=(p:any)=>[...(p.cover?[p.cover]:[]),...p.sections.flatMap((s:any)=>s.images)]
export function validateDraft(value:any){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid project')
 const text=(v:any,max=20000)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid text');return v}
 const id=text(value.id,150);if(!/^[a-zA-Z0-9:_-]+$/.test(id))throw Error('Invalid project ID')
 const slug=text(value.slug||'',150);if(slug&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid project URL')
 if(!['academic','professional'].includes(value.track)||!['architecture','interior'].includes(value.discipline))throw Error('Invalid category')
 if(!Array.isArray(value.sections)||value.sections.length>40)throw Error('Invalid sections')
 const media=(im:any)=>{if(!im||!uuid.test(im.id)||im.src!==`/media/${im.id}`)throw Error('Upload images before saving');if(!['photo','drawing'].includes(im.mode)||!['center','top','bottom','left','right'].includes(im.position||'center'))throw Error('Invalid image settings');for(const k of ['width','height','bytes'])if(!Number.isSafeInteger(im[k])||im[k]<1)throw Error('Invalid image dimensions');return {id:im.id,src:im.src,width:im.width,height:im.height,bytes:im.bytes,alt:text(im.alt,1000),caption:text(im.caption,2000),mode:im.mode,position:im.position||'center'}}
 const p:any={id,slug,title:text(value.title,120),subtitle:text(value.subtitle||'',250),category:text(value.category||'',250),discipline:value.discipline,track:value.track,year:text(value.year||'',250),location:text(value.location||'',250),role:text(value.role||'',250),overview:text(value.overview||''),approach:text(value.approach||''),featured:value.featured===true,sample:value.sample!==false,status:value.status==='archived'?'archived':'draft',order:Number.isFinite(value.order)?Math.min(9999,Math.max(0,value.order)):0,updatedAt:Date.now(),cover:value.cover?media(value.cover):null,sections:value.sections.map((s:any)=>{if(!['full','paired','text-image','drawing','gallery'].includes(s.type)||!Array.isArray(s.images))throw Error('Invalid section');if(!/^[a-zA-Z0-9:_-]+$/.test(text(s.id,150)))throw Error('Invalid section ID');return{id:s.id,type:s.type,title:text(s.title,250),text:text(s.text),images:s.images.map(media)}}),facts:[]}
 if(value.sourceSlug){p.sourceSlug=text(value.sourceSlug,150);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.sourceSlug))throw Error('Invalid source slot');p.sourceTitle=text(value.sourceTitle||'',250)}
 if(value.facts){if(!Array.isArray(value.facts)||value.facts.length>20)throw Error('Invalid facts');p.facts=value.facts.map((f:any)=>({label:text(f.label,250),value:text(f.value,250)}))}
 if(imageList(p).length>40)throw Error('Maximum 40 images per project')
 return p
}
export function publicationErrors(p:any){const errors=[];if(!p.title.trim())errors.push('Add a title');if(!p.slug)errors.push('Set the project URL name');if(p.sample)errors.push('Confirm sample details have been replaced');if(!p.cover)errors.push('Add a cover image');if(p.status==='archived')errors.push('Restore this draft before publishing');if(!p.overview.trim())errors.push('Add the project intention');if(imageList(p).some((im:any)=>!im.alt.trim()))errors.push('Describe every image');return errors}
