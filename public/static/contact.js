(() => {
 'use strict';
 const page=document.querySelector('[data-contact-page]');if(!page)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const options=[...page.querySelectorAll('[data-enquiry]')];
 const title=page.querySelector('[data-enquiry-title]'),description=page.querySelector('[data-enquiry-description]');
 const write=page.querySelector('[data-write-email]'),copy=page.querySelector('[data-copy-email]'),status=page.querySelector('[data-copy-status]');
 const email=page.dataset.email;
 let copyTimer=0,animation=null;
 options.forEach(button=>button.addEventListener('click',()=>{
  if(button.getAttribute('aria-pressed')==='true')return;
  options.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  title.textContent=button.dataset.title;description.textContent=button.dataset.description;
  write.href=`mailto:${email}?subject=${encodeURIComponent(button.dataset.subject)}`;
  animation?.cancel();if(!reduced.matches&&title.parentElement.animate)animation=title.parentElement.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
 }));
 copy.hidden=false;
 copy.addEventListener('click',async()=>{
  clearTimeout(copyTimer);
  try{
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
   await navigator.clipboard.writeText(email);status.textContent='Email copied. Ready when you are.';
  }catch{
   const link=page.querySelector('[data-contact-email]');
   const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(link);selection?.removeAllRanges();selection?.addRange(range);
   status.textContent='Select and copy the email address above.';
  }
  copyTimer=setTimeout(()=>{status.textContent='';},6000);
 });
 const opening=page.querySelector('.ct-opening'),drawing=page.querySelector('.ct-space');
 let frame=0,started=performance.now(),enabled=!document.documentElement.classList.contains('is-loading');
 const clamp=v=>Math.min(1,Math.max(0,v));
 function paint(now){
  frame=0;if(!enabled||document.hidden)return;
  if(reduced.matches){page.style.setProperty('--door-open','.8');page.style.setProperty('--ct-progress','1');page.style.setProperty('--ct-drift','0');return;}
  const entrance=clamp((now-started)/1100),scroll=clamp(-opening.getBoundingClientRect().top/Math.max(1,opening.offsetHeight*.7));
  const inView=clamp((innerHeight-drawing.getBoundingClientRect().top)/(innerHeight*.6));
  page.style.setProperty('--door-open',String(Math.min(.95,.12+entrance*.5+scroll*.33)));
  page.style.setProperty('--ct-progress',String(Math.max(entrance,inView*.5)));
  page.style.setProperty('--ct-drift',String(scroll));if(entrance<1)frame=requestAnimationFrame(paint);
 }
 function schedule(){if(!frame&&enabled&&!document.hidden)frame=requestAnimationFrame(paint);}
 window.addEventListener('portfolio:entered',()=>{enabled=true;started=performance.now();schedule();});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('pageshow',schedule);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});reduced.addEventListener('change',schedule);schedule();
})();
