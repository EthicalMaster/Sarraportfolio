/* About-only scroll narrative. Native scroll; no dependency on the hero. */
(() => {
 'use strict';
 const root=document.querySelector('[data-about-story]'); if(!root)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sections=[...root.querySelectorAll('[data-about-section]')];
 const links=[...root.querySelectorAll('[data-about-link]')];
 const thoughts=[...root.querySelectorAll('[data-about-thought]')];
 const milestones=[...root.querySelectorAll('[data-about-milestone]')];
 const interests=[...root.querySelectorAll('[data-about-interest]')];
 const study=root.querySelector('[data-about-study]');
 const phase=root.querySelector('[data-about-phase]');
 const plan=study.querySelector('.ap-drawing__plan');
 const volume=study.querySelector('.ap-drawing__volume');
 const site=study.querySelector('.ap-drawing__site');
 const portrait=root.querySelector('[data-about-portrait]');
 const clamp=v=>Math.max(0,Math.min(1,v));
 let frame=0;
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
 function update(){
  frame=0;const h=innerHeight;const mobile=innerWidth<=650;
  const bounds=root.getBoundingClientRect();
  const sectionsRect=sections.map(el=>el.getBoundingClientRect());
  const thoughtRects=thoughts.map(el=>el.getBoundingClientRect());
  const milestoneRects=milestones.map(el=>el.getBoundingClientRect());
  // Read offsets from the unmoving container, avoiding transform feedback.
  const interestRect=root.querySelector('.ap-interests').getBoundingClientRect();
  const introRect=sectionsRect[0];
  let current=sections[0].id;sections.forEach((s,i)=>{if(sectionsRect[i].top<190)current=s.id;});
  links.forEach(a=>{if(a.dataset.aboutLink===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  root.style.setProperty('--ap-progress',String(clamp(-bounds.top/Math.max(1,bounds.height-h))));
  if(reduced.matches)return;
  portrait.style.setProperty('--portrait-y',`${clamp(-introRect.top/h)*(mobile?12:45)}px`);
  const progress=thoughtRects.reduce((total,r)=>total+clamp((h*.6-r.top)/Math.max(1,r.height)),0)/thoughts.length;
  const level=Math.min(2,Math.floor(progress*3));
  const label=['01 / Context','02 / Material','03 / Atmosphere'][level];
  if(phase.textContent!==label)phase.textContent=label;
  plan.style.opacity=String(1-clamp((progress-.4)*2));
  plan.style.transform=`rotate(${progress*-12}deg) scale(${1-progress*.07})`;
  volume.style.opacity=String(clamp((progress-.32)*2));
  volume.style.transform=`translateY(${(1-progress)*35}px)`;
  site.style.opacity=String(.45-progress*.25);
  milestones.forEach((el,i)=>el.style.setProperty('--milestone-progress',String(clamp((h*.7-milestoneRects[i].top)/Math.max(1,milestoneRects[i].height)))));
  const p=clamp((h-interestRect.top)/(h+interestRect.height));
  interests.forEach((el,i)=>el.style.setProperty('--interest-y',`${(p-.5)*(i%2? -35:35)*(mobile?.4:1)}px`));
 }
 function configure(){
  if(reduced.matches){portrait.style.removeProperty('--portrait-y');[plan,volume,site].forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('transform');});interests.forEach(el=>el.style.removeProperty('--interest-y'));milestones.forEach(el=>el.style.removeProperty('--milestone-progress'));phase.textContent='Spatial study';}
  schedule();
 }
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('portfolio:entered',schedule);window.addEventListener('pageshow',schedule);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
 reduced.addEventListener('change',configure);
 if(document.fonts)document.fonts.ready.then(schedule);
 if('ResizeObserver'in window)new ResizeObserver(schedule).observe(root);
 configure();
})();
