import { allProjects } from '../data/projects'

// Stable sourceSlug identifies the existing public slot even after its draft is renamed.
// Generated placeholder image keys are never treated as uploaded media.
export function existingProjectDrafts() {
 return allProjects().map(p=>({
  id:`site:${p.slug}`, sourceSlug:p.slug, sourceTitle:p.title,
  title:p.title, slug:p.slug, subtitle:p.subtitle||'', category:p.category,
  discipline:p.discipline, track:p.track, year:String(p.year), location:p.location,
  role:p.facts?.find(f=>f.label.toLowerCase()==='role')?.value||'',
  facts:(p.facts||[]).filter(f=>f.label.toLowerCase()!=='role'),
  overview:p.description, approach:p.statement||'', featured:p.featured,
  status:'draft', order:p.order-1, sample:true, cover:null,
  expectedImages:Math.max(6,p.gallery.length),
  sections:[{id:`site:${p.slug}:gallery`,type:'gallery',title:'Through the space',text:'',images:[]}],
  updatedAt:0,
 }))
}
