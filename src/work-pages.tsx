import { Ph } from './components'
import { allProjects, adjacentProjects, type Project } from './data/projects'
const pad=(n:number)=>String(n).padStart(2,'0')

export function WorkPage(){
 const projects=allProjects()
 return <article class="wk" data-work-index>
  <header class="wk-opening wrap"><p class="marker">Work / A collection in progress</p><div class="wk-opening__row"><h1>Selected<br /><span>work.</span></h1><div><p>Ideas explored through<br />space, material, and light.</p><span class="wk-count">{pad(projects.length)} <small>perspectives to explore</small></span></div></div><p class="wk-preview">Preview collection · sample projects and illustrative imagery. Actual project information will replace this content.</p></header>
  <section class="wk-collection wrap" aria-label="Project collection">
   <div class="wk-filterbar"><div class="wk-filtergroups">{[['discipline','Discipline',['all','architecture','interior']],['track','Experience',['all','academic','professional']]].map(([type,label,values])=><div class="wk-filter" role="group" aria-label={label as string}><span class="mono">{label}</span>{(values as string[]).map(v=><button type="button" data-wk-type={type as string} data-wk-value={v} aria-pressed={v==='all'?'true':'false'}>{v==='all'?'All':v==='interior'?'Interiors':v[0].toUpperCase()+v.slice(1)}</button>)}</div>)}</div><div class="wk-results"><span role="status" aria-live="polite" data-wk-count>{projects.length} projects</span><button type="button" data-wk-reset hidden>Reset ↺</button></div></div>
   <div class="wk-grid" data-wk-grid>{projects.map((p,i)=><article class="wk-card" data-wk-card data-discipline={p.discipline} data-track={p.track} style={`--position:${i}`}><a href={`/work/${p.slug}`} data-wk-link aria-label={`Explore ${p.title}`}><div class="wk-card__media"><Ph src={p.coverImage} alt={`Illustrative preview for ${p.title}`} ratio="4 / 3" eager={i<2}/><div class="wk-card__top"><span>{pad(p.order)}</span><span>{p.category}</span></div><span class="wk-card__open">View project <span aria-hidden="true">↗</span></span></div><div class="wk-card__caption"><div><h2>{p.title}</h2><p>{p.subtitle}</p></div><span class="wk-card__year">{p.year}</span></div><p class="wk-card__meta">{p.track} <span aria-hidden="true">/</span> {p.discipline==='interior'?'Interiors':'Architecture'}</p></a></article>)}</div>
   <div class="wk-empty" data-wk-empty hidden><h2>A different perspective?</h2><p>No projects match this combination. Try another filter or reset the collection.</p><button type="button" data-wk-reset>Show all projects ↗</button></div>
  </section>
  <section class="wk-outro wrap"><p class="marker">Beyond the collection</p><h2>Curious about<br />the person behind it?</h2><a class="text-link" href="/about">Meet Sarra <span aria-hidden="true">↗</span></a></section>
 </article>
}

export function previewGallery(p:Project){
 const images=[...p.gallery]
 while(images.length<6)images.push({src:`/img/${p.slug}/study-${images.length+1}`,alt:`${p.title} — illustrative study ${images.length+1}`,ratio:images.length===3?'2 / 1':'4 / 3',caption:'Illustrative study · placeholder image'})
 return images
}
export function ProjectPage({project:p}:{project:Project}){
 const {next}=adjacentProjects(p.slug),images=previewGallery(p)
 const role=p.facts?.find(f=>f.label.toLowerCase()==='role')?.value||'To be confirmed'
 return <article class="pj" data-project-story>
  <header class="pj-opening wrap"><div class="pj-eyebrow"><a class="pj-back" data-collection-back href="/work">← Back to collection</a><span class="mono">Project {pad(p.order)} / {pad(allProjects().length)}</span></div><p class="marker">{p.category} · {p.track}</p><h1>{p.title}</h1><p class="pj-subtitle">{p.subtitle}</p><p class="wk-preview">Sample project · illustrative imagery and demonstration project information.</p></header>
  <div class="pj-cover wrap"><div class="pj-cover__frame"><Ph src={p.coverImage} alt={`Illustrative cover for ${p.title}`} eager ratio="16 / 9"/><span class="pj-cover__label">A spatial study / {pad(p.order)}</span></div><div class="pj-cover__caption"><span>{p.location}</span><span>{p.year} / {p.discipline}</span></div></div>
  <nav class="pj-chapters" aria-label="Project chapters"><div class="wrap"><a data-collection-back href="/work">← Collection</a><div><a href="#overview" data-pj-chapter="overview">Overview</a><a href="#approach" data-pj-chapter="approach">Approach</a><a href="#gallery" data-pj-chapter="gallery">Gallery <small>{pad(images.length)}</small></a></div><span class="pj-progress" aria-hidden="true"><span></span></span></div></nav>
  <section class="pj-overview wrap" id="overview" data-pj-section><div class="pj-section-label"><p class="marker">01 / The intention</p><h2>{p.subtitle||'An idea, given space.'}</h2></div><div class="pj-overview__body"><p class="pj-lead">{p.description}</p><dl class="pj-facts">{[{label:'Year',value:String(p.year)},{label:'Location',value:p.location},{label:'Context',value:p.track},{label:'Contribution',value:role},...(p.facts||[]).filter(f=>f.label.toLowerCase()!=='role')].map(f=><div><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></div></section>
  <section class="pj-approach" id="approach" data-pj-section><div class="wrap pj-approach__grid"><div class="pj-section-label"><p class="marker">02 / Design approach</p><h2>From intention<br />to experience.</h2><p class="pj-approach__note">Reading the relationships between light, material and the way a space is used.</p></div><div><p class="pj-lead">{p.statement||p.description}</p><div class="pj-principles"><span>01 / Context</span><span>02 / Material</span><span>03 / Atmosphere</span></div></div></div></section>
  <section class="pj-gallery wrap" id="gallery" data-pj-section aria-labelledby="gallery-title"><div class="pj-gallery__heading"><div><p class="marker">03 / A closer look</p><h2 id="gallery-title">Through the space.</h2></div><p>{pad(images.length)} views<br /><span>Open any image to explore</span></p></div><div class="pj-gallery__grid">{images.map((g,i)=><figure class={`pj-image pj-image--${i%6}`}><Ph src={g.src} alt={g.alt} ratio={g.ratio||'4 / 3'} lightbox/><figcaption><span>{pad(i+1)} / {g.caption||g.alt}</span><span aria-hidden="true">Expand ↗</span></figcaption></figure>)}</div></section>
  {next&&<nav class="pj-next wrap" aria-label="Continue exploring"><p class="marker">Another perspective</p><a href={`/work/${next.slug}`} class="pj-next__link"><div><span class="mono">Next project / {pad(next.order)}</span><h2>{next.title}</h2><p>{next.subtitle}</p></div><div class="pj-next__image"><Ph src={next.coverImage} alt={`Illustrative preview for ${next.title}`} ratio="4 / 3"/></div><span class="pj-next__arrow" aria-hidden="true">↗</span></a><a class="text-link" data-collection-back href="/work">Return to the collection <span aria-hidden="true">↗</span></a></nav>}
 </article>
}
