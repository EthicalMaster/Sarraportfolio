/* Delegated feedback also covers dynamically created media controls. */
(() => {
 'use strict';
 const fine=matchMedia('(any-hover: hover) and (any-pointer: fine)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const selector='a[href],button:not(:disabled),[role="button"],summary';
 const ring=document.createElement('div');ring.className='pointer-ring';ring.setAttribute('aria-hidden','true');document.body.append(ring);
 let x=0,y=0,tx=0,ty=0,frame=0,visible=false,pressed=null;
 function hide(){visible=false;ring.classList.remove('is-visible','is-down');cancelAnimationFrame(frame);frame=0;}
 function clearPress(){pressed?.classList.remove('is-pressing');pressed=null;ring.classList.remove('is-down');}
 function tick(){frame=0;x+=(tx-x)*.3;y+=(ty-y)*.3;ring.style.transform=`translate3d(${x-16}px,${y-16}px,0)`;if(visible&&(Math.abs(tx-x)>.1||Math.abs(ty-y)>.1))frame=requestAnimationFrame(tick);}
 document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!fine.matches||reduced.matches||e.target.closest('input,textarea,select,[contenteditable="true"]')){hide();return;}
  tx=e.clientX;ty=e.clientY;if(!visible){x=tx;y=ty;visible=true;ring.classList.add('is-visible');}
  ring.classList.toggle('is-link',!!e.target.closest(selector));if(!frame)frame=requestAnimationFrame(tick);
 },{passive:true});
 document.addEventListener('pointerdown',e=>{clearPress();pressed=e.target.closest(selector);pressed?.classList.add('is-pressing');ring.classList.add('is-down');},{passive:true});
 document.addEventListener('pointerup',clearPress,{passive:true});document.addEventListener('pointercancel',clearPress,{passive:true});
 document.addEventListener('click',e=>{
  const el=e.target.closest(selector);if(!el||reduced.matches)return;
  const r=el.getBoundingClientRect(),halo=document.createElement('span');halo.className='press-halo';halo.setAttribute('aria-hidden','true');
  halo.style.left=(e.detail?e.clientX:r.left+r.width/2)+'px';halo.style.top=(e.detail?e.clientY:r.top+r.height/2)+'px';document.body.append(halo);setTimeout(()=>halo.remove(),450);
 });
 document.documentElement.addEventListener('pointerleave',hide);window.addEventListener('blur',()=>{clearPress();hide();});
 document.addEventListener('keydown',e=>{if(e.key==='Tab')hide();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPress();hide();}});
 reduced.addEventListener('change',hide);fine.addEventListener('change',hide);
})();
