import { site } from './data/site'
import { profile } from './data/profile'

function SpatialDrawing() {
  return <svg class="ap-drawing" viewBox="0 0 600 600" fill="none" aria-hidden="true">
    <g class="ap-drawing__site"><path d="M40 405Q160 280 290 420T560 380M30 440Q160 315 290 455T580 415M20 475Q160 350 290 490T590 450M45 340Q140 225 275 345T555 310" /><circle cx="105" cy="200" r="35"/><circle cx="490" cy="185" r="46"/><circle cx="470" cy="500" r="30"/></g>
    <g class="ap-drawing__plan"><path d="M165 175H395V390H165ZM165 310H270V390M270 175V250H395M305 250V390M165 240H220M220 240V310"/><path d="M145 150H415M145 140V160M415 140V160M430 175V390M420 175H440M420 390H440"/><path d="M270 310A60 60 0 0 1 210 250" stroke-dasharray="4 5"/></g>
    <g class="ap-drawing__volume"><path d="M160 265L300 185L440 265V405L300 485L160 405ZM160 265L300 345L440 265M300 345V485M300 185V325"/><path d="M182 298V390L274 443V350ZM322 353V443L415 390V300Z"/><path d="M160 405L300 485L535 407L392 327Z" class="ap-drawing__shadow"/></g>
    <path d="M300 40V560M40 300H560" class="ap-drawing__axis"/>
  </svg>
}

export function AboutPage() {
 return <article class="ap" data-about-story>
  <section class="ap-opening wrap" id="person" data-about-section>
   <div class="ap-opening__head"><p class="marker">About / Sarra Saifee</p><p class="mono">Indore, India · Architecture</p></div>
   <div class="ap-opening__grid">
    <div class="ap-opening__copy"><h1>Sarra,<br /><span>in perspective.</span></h1><p class="ap-lead">{profile.lead}</p><div class="ap-education"><span class="mono">{profile.stage}</span><span>{profile.degree}<br />{profile.college}</span></div><a class="text-link" href="#perspective">A little more about me <span aria-hidden="true">↓</span></a></div>
    <figure class="ap-portrait" data-about-portrait>
     {profile.portrait ? <img src={profile.portrait} alt={profile.portraitAlt} width="800" height="1000" /> : <div class="ap-portrait__placeholder" role="img" aria-label="Portrait placeholder for Sarra Saifee"><span class="ap-portrait__number">01 / A portrait in progress</span><span class="ap-monogram" aria-hidden="true">S<span>S</span></span><div class="ap-portrait__cross" aria-hidden="true">+</div><span class="ap-portrait__label">Sarra Saifee<br /><small>Portrait to be added</small></span></div>}
     <figcaption>Looking closely. Thinking spatially.</figcaption>
    </figure>
   </div>
  </section>
  <nav class="ap-chapters" aria-label="About chapters"><div class="wrap">{[['person','Person'],['perspective','Perspective'],['journey','Journey'],['skills','Skills'],['beyond','Beyond architecture']].map(([id,label])=><a href={`#${id}`} data-about-link={id}>{label}</a>)}<span class="ap-chapters__track" aria-hidden="true"><span data-about-progress></span></span></div></nav>
  <section class="ap-perspective section wrap" id="perspective" data-about-section>
   <div class="ap-perspective__sticky"><p class="marker">01 / A way of seeing</p><h2>Space is more<br />than form.</h2><div class="ap-study" data-about-study><SpatialDrawing/><div class="ap-study__caption"><span>Illustrative spatial study</span><span data-about-phase>01 / Context</span></div></div></div>
   <div class="ap-perspective__steps">{profile.perspectives.map((p,i)=><div class="ap-thought" data-about-thought><span class="mono">0{i+1} / {p.name}</span><h3>{p.title}</h3><p>{p.text}</p></div>)}</div>
  </section>
  <section class="ap-journey section" id="journey" data-about-section><div class="wrap"><div class="ap-section-head"><p class="marker">02 / Learning through doing</p><h2>From the studio.<br />Into practice.</h2></div><div class="ap-timeline">{profile.journey.map((j,i)=><article class="ap-milestone" data-about-milestone><div class="ap-milestone__index" aria-hidden="true">0{i+1}</div><div class="ap-milestone__body"><p class="mono">{j.time}</p><h3>{j.institution}</h3><p class="ap-role">{j.role}</p><p>{j.text}</p>{j.note && <small>{j.note}</small>}</div></article>)}</div></div></section>
  <section class="ap-skills section wrap" id="skills" data-about-section><div class="ap-section-head"><p class="marker">03 / Ideas, made legible</p><h2>From first line<br />to final image.</h2></div><div class="ap-skills__grid">{profile.skills.map((s,i)=><article class="ap-skill" data-reveal><span class="ap-skill__index" aria-hidden="true">0{i+1}</span><h3>{s.title}</h3><p>{s.text}</p><ul aria-label={`Tools for ${s.title}`}>{s.tools.map(t=><li>{t}</li>)}</ul></article>)}</div><p class="ap-skills__note">Across architecture, interiors and landscape-related work, I bring a detail-oriented approach and a strong interest in clear visual communication.</p></section>
  <section class="ap-beyond section" id="beyond" data-about-section><div class="wrap"><div class="ap-section-head"><p class="marker">04 / Beyond architecture</p><h2>Curiosity carries<br />into everything.</h2></div><p class="ap-beyond__intro">Painting, sketching and crafting keep me making things by hand. Editing is another space to experiment, learn by doing and follow an idea.</p><div class="ap-interests">{profile.interests.map((h,i)=><article class={`ap-interest ap-interest--${h.mark}`} data-about-interest><div class="ap-interest__art" aria-hidden="true"><span></span><span></span><span></span><b>0{i+1}</b></div><h3>{h.title}</h3><p>{h.caption}</p></article>)}</div><p class="ap-art-note mono">Graphic studies · personal artwork to follow</p></div></section>
  <section class="ap-connect section wrap" id="connect"><p class="marker">A conversation starts here</p><h2>Let’s exchange<br />perspectives.</h2><div class="ap-connect__grid"><div><a class="ap-email" href={`mailto:${site.email}`}>{site.email} <span aria-hidden="true">↗</span></a><a class="ap-phone" href={`tel:${site.phone.replace(/\s/g,'')}`}>{site.phone}</a><p>{site.location}</p></div><div class="ap-connect__links"><a class="text-link" href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">View portfolio booklet <span aria-hidden="true">↗</span></a><a class="text-link" href="/work">Explore selected work <span aria-hidden="true">↗</span></a><div class="ap-socials" aria-label="Social profiles">{site.social.map(s=>s.href ? <a class="text-link" href={s.href} target="_blank" rel="noopener noreferrer">{s.label} <span aria-hidden="true">↗</span></a> : <span class="ap-social-pending">{s.label}<small>Link to be added</small></span>)}</div></div></div></section>
 </article>
}
