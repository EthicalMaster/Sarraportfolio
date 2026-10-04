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
 const skills=[...root.querySelectorAll('[data-about-skill]')];
 const controls=[...root.querySelectorAll('[data-study-control]')];
 const number=root.querySelector('[data-study-number]');
 const journeyNumber=root.querySelector('[data-journey-number]');
 const journeyLabel=root.querySelector('[data-journey-label]');
 const journeyStage=root.querySelector('.ap-journey-stage');
 const connect=root.querySelector('.ap-connect');
 const values=new Map();
 let settling=false,lastTime=0,lastChapter=-1;
 function paint(el,key,target,unit,blend){let data=values.get(el);if(!data){data=new Map();values.set(el,data);}const old=data.has(key)?data.get(key):target;const next=Math.abs(target-old)<.02?target:old+(target-old)*blend;if(Math.abs(target-next)>.02)settling=true;el.style.setProperty(key,next.toFixed(3)+unit);data.set(key,next);}
 const clamp=v=>Math.max(0,Math.min(1,v));
 let frame=0;
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
 function update(time){
  const blend=lastTime?1-Math.exp(-Math.min(64,time-lastTime)/70):1;lastTime=time;settling=false;
  frame=0;const h=innerHeight;const mobile=innerWidth<=650;
  const bounds=root.getBoundingClientRect();
  const sectionsRect=sections.map(el=>el.getBoundingClientRect());
  const thoughtRects=thoughts.map(el=>el.getBoundingClientRect());
  const milestoneRects=milestones.map(el=>el.getBoundingClientRect());
  // Read offsets from the unmoving container, avoiding transform feedback.
  const interestRect=root.querySelector('.ap-interests').getBoundingClientRect();
  const introRect=sectionsRect[0];
  const skillRect=root.querySelector('.ap-skills__grid').getBoundingClientRect();
  const connectRect=connect.getBoundingClientRect();
  let current=sections[0].id;sections.forEach((s,i)=>{if(sectionsRect[i].top<190)current=s.id;});
  links.forEach(a=>{if(a.dataset.aboutLink===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  root.style.setProperty('--ap-progress',String(clamp(-bounds.top/Math.max(1,bounds.height-h))));
  let chapter=0;milestoneRects.forEach((r,i)=>{if(r.top<h*.62)chapter=i;});
  if(chapter!==lastChapter){journeyNumber.textContent='0'+(chapter+1);journeyLabel.textContent=['Learning the foundations','Growing through practice','Expanding the perspective'][chapter];if(!reduced.matches&&journeyNumber.animate)journeyNumber.animate([{opacity:.25,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});lastChapter=chapter;}
  const progress=thoughtRects.reduce((total,r)=>total+clamp((h*.6-r.top)/Math.max(1,r.height)),0)/thoughts.length;
  const level=Math.min(2,Math.floor(progress*3));
  const label=['01 / Context','02 / Material','03 / Atmosphere'][level];
  if(phase.textContent!==label)phase.textContent=label;
  number.textContent='0'+(level+1);
  controls.forEach((a,i)=>{if(i===level)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  if(reduced.matches)return;
  const opening=clamp(-introRect.top/h);
  paint(root,'--heading-x',opening*(mobile?-8:-24),'px',blend);
  paint(root,'--portrait-radius',180-opening*100,'px',blend);
  paint(root,'--portrait-turn',opening*90,'deg',blend);
  paint(journeyStage,'--journey-turn',chapter*60,'deg',blend);
  skills.forEach((el,i)=>{const p=clamp((h*.9-skillRect.top)/(h*.55));paint(el,'--skill-y',(1-p)*(30+i*35)*(mobile?.3:1),'px',blend);paint(el,'--skill-progress',clamp(p*1.4-i*.1),'',blend);});
  paint(connect,'--connect-x',(1-clamp((h-connectRect.top)/h))*(mobile?-12:-50),'px',blend);
  portrait.style.setProperty('--portrait-y',`${clamp(-introRect.top/h)*(mobile?12:45)}px`);
  paint(study,'--sun-opacity',clamp((progress-.45)*2),'',blend);
  paint(study,'--sun-x',-progress*130,'px',blend);
  paint(study,'--sun-position',80-progress*50,'%',blend);
  paint(study,'--drawing-offset',(1-clamp(progress*3))*1200,'',blend);
  thoughts.forEach((el,i)=>{const p=clamp((h*.85-thoughtRects[i].top)/(h*.6));paint(el,'--thought-x',(1-p)*(mobile?10:40),'px',blend);paint(el,'--thought-progress',p,'',blend);});
  plan.style.opacity=String(1-clamp((progress-.4)*2));
  plan.style.transform=`rotate(${progress*-12}deg) scale(${1-progress*.07})`;
  volume.style.opacity=String(clamp((progress-.32)*2));
  volume.style.transform=`translateY(${(1-progress)*35}px)`;
  site.style.opacity=String(.45-progress*.25);
  milestones.forEach((el,i)=>{const p=clamp((h*.8-milestoneRects[i].top)/(h*.5));paint(el,'--milestone-x',(1-p)*(mobile?12:45),'px',blend);paint(el,'--milestone-progress',clamp((h*.7-milestoneRects[i].top)/Math.max(1,milestoneRects[i].height)),'',blend);});
  const p=clamp((h-interestRect.top)/(h+interestRect.height));
  interests.forEach((el,i)=>el.style.setProperty('--interest-y',`${(p-.5)*(i%2? -35:35)*(mobile?.4:1)}px`));
  if(settling)schedule();
 }
 function configure(){
  lastTime=0;
  if(reduced.matches){values.forEach((data,el)=>data.forEach((_,key)=>el.style.removeProperty(key)));values.clear();}
  if(reduced.matches){portrait.style.removeProperty('--portrait-y');[plan,volume,site].forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('transform');});interests.forEach(el=>el.style.removeProperty('--interest-y'));milestones.forEach(el=>el.style.removeProperty('--milestone-progress'));}
  schedule();
 }
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('portfolio:entered',schedule);window.addEventListener('pageshow',schedule);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
 reduced.addEventListener('change',configure);
 if(document.fonts)document.fonts.ready.then(schedule);
 if('ResizeObserver'in window)new ResizeObserver(schedule).observe(root);
 interests.forEach(card=>{
  const button=card.querySelector('[data-interest-toggle]');
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;schedule();});
  button.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType!=='mouse')return;const r=button.getBoundingClientRect();button.style.setProperty('--tilt-x',`${-(event.clientY-r.top-r.height/2)/r.height*8}deg`);button.style.setProperty('--tilt-y',`${(event.clientX-r.left-r.width/2)/r.width*8}deg`);});
  button.addEventListener('pointerleave',()=>{button.style.removeProperty('--tilt-x');button.style.removeProperty('--tilt-y');});
 });
 configure();
})();
