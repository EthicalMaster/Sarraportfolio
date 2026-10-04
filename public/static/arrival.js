/* Preparation is measured, not timed fiction. The overlay and media have separate
 * lifetimes: entering the site never cancels a healthy video download. */
(() => {
 'use strict';
 function start(){
  const root=document.documentElement,overlay=document.querySelector('[data-arrival]');if(!overlay)return;
  const active=root.classList.contains('is-loading');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video=document.querySelector('[data-hero-video]');
  const limited=reduced||!!navigator.connection?.saveData;
  const number=overlay.querySelector('[data-arrival-number]'),bar=overlay.querySelector('[data-arrival-progress]');
  const status=overlay.querySelector('[data-arrival-status]'),skip=overlay.querySelector('[data-arrival-skip]'),phase=overlay.querySelector('[data-arrival-phase]');
  const stages={app:root.classList.contains('js-ready')?1:0,fonts:0,images:0,video:video&&!limited?0:1};
  let done=false,restored=false,shown=0,target=0,raf=0,last=0,exitTimer=0,timeout=0;
  let controller=null,mediaTimer=0,objectUrl='',mediaState=video&&!limited?'loading':'off',downloadPercent=null;
  const background=active?Array.from(document.body.children).filter(el=>el!==overlay&&!el.inert&&!['SCRIPT','STYLE'].includes(el.tagName)):[];
  background.forEach(el=>{el.inert=true;el.setAttribute('data-loader-inert','');});
  const chip=document.createElement('div');chip.className='hero-preparation';chip.hidden=true;
  const message=document.createElement('span');message.setAttribute('role','status');
  const retry=document.createElement('button');retry.type='button';retry.textContent='Load motion';retry.hidden=true;
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='Dismiss';dismiss.setAttribute('aria-label','Dismiss video preparation status');
  chip.append(message,retry,dismiss);document.body.append(chip);
  let dismissed=false;dismiss.addEventListener('click',()=>{dismissed=true;chip.hidden=true;});
  function showMedia(){
   chip.hidden=!restored||dismissed||mediaState==='off'||mediaState==='ready';
   retry.hidden=mediaState!=='error';
   message.textContent=mediaState==='error'?'Motion could not load. The still view is ready.':downloadPercent===null?'Preparing background motion…':`Preparing background motion · ${downloadPercent}%`;
  }
  function restore(){
   if(restored)return;restored=true;clearTimeout(exitTimer);cancelAnimationFrame(raf);
   const focused=overlay.contains(document.activeElement);root.classList.remove('is-loading');
   background.forEach(el=>{el.inert=false;el.removeAttribute('data-loader-inert');});overlay.remove();
   if(focused){const main=document.getElementById('content');main?.setAttribute('tabindex','-1');main?.focus({preventScroll:true});}
   window.removeEventListener('portfolio:skip',skipEntry);window.removeEventListener('portfolio:app-ready',appReady);
   showMedia();window.dispatchEvent(new Event('portfolio:entered'));
  }
  function finish(fallback=false){
   if(done)return;done=true;clearTimeout(timeout);
   try{sessionStorage.setItem('sarra-entered','1');}catch{}
   if(!active){restore();return;}
   // A slow connection exits at its measured percentage, never a false 100%.
   if(!fallback){target=100;status.textContent=limited?'Ready to explore · still view':'Ready to explore';}
   else status.textContent=mediaState==='loading'?'Enter the space. Motion is still preparing.':'The first view is ready to explore.';
   if(reduced){number.textContent=String(Math.floor(target));bar.setAttribute('aria-valuenow',String(Math.floor(target)));}
   exitTimer=setTimeout(()=>{if(!fallback){shown=100;number.textContent='100';bar.setAttribute('aria-valuenow','100');overlay.style.setProperty('--arrival-progress','1');}overlay.classList.add('arrival--ready');exitTimer=setTimeout(restore,reduced?0:450);},reduced?0:180);
  }
  function update(){
   if(done)return;
   target=Math.max(target,Math.min(99,15*stages.app+5*stages.fonts+10*stages.images+70*stages.video));
   status.textContent=!stages.app?'Preparing the space':!stages.images?'Bringing the first view into focus':stages.video<1?'Preparing the architectural film':'Setting the final details';
   if(Object.values(stages).every(v=>v===1))finish();
  }
  function paint(now){
   const dt=Math.min(64,last?now-last:16);last=now;shown=reduced?target:shown+(target-shown)*(1-Math.exp(-dt/65));if(target-shown<.5)shown=target;
   number.textContent=String(Math.floor(shown)).padStart(2,'0');bar.setAttribute('aria-valuenow',String(Math.floor(shown)));overlay.style.setProperty('--arrival-progress',String(shown/100));
   phase.textContent=shown<34?'01 / Foundation':shown<75?'02 / Form':'03 / Atmosphere';
   if(!restored)raf=requestAnimationFrame(paint);
  }
  function appReady(){stages.app=1;update();}function skipEntry(){finish(true);}
  window.addEventListener('portfolio:app-ready',appReady);window.addEventListener('portfolio:skip',skipEntry);
  skip.addEventListener('click',skipEntry);
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape')skipEntry();if(e.key==='Tab'){e.preventDefault();skip.focus();}});
  if(active)skip.focus({preventScroll:true});
  if(!reduced)overlay.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;overlay.style.setProperty('--look-x',((e.clientX/innerWidth-.5)*10)+'deg');overlay.style.setProperty('--look-y',((.5-e.clientY/innerHeight)*8)+'deg');},{passive:true});
  Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(r=>setTimeout(r,1500))]).then(()=>{stages.fonts=1;update();});
  const images=Array.from(document.images).filter(img=>{const r=img.getBoundingClientRect();return img.loading!=='lazy'&&r.top<innerHeight&&r.bottom>0;});
  Promise.all(images.map(img=>new Promise(resolve=>{const settle=()=>{img.removeEventListener('load',settle);img.removeEventListener('error',settle);(img.decode?img.decode().catch(()=>{}):Promise.resolve()).then(resolve);};if(img.complete)settle();else{img.addEventListener('load',settle);img.addEventListener('error',settle);}}))).then(()=>{stages.images=1;update();});
  function mediaFailed(){clearTimeout(mediaTimer);controller?.abort();mediaState='error';stages.video=0;showMedia();finish(true);}
  function mediaReady(){
   if(mediaState!=='loading'||video.readyState<2)return;
   clearTimeout(mediaTimer);video.pause();video.dataset.prepared='true';mediaState='ready';stages.video=1;
   video.dispatchEvent(new Event('portfolio:video-ready'));showMedia();update();
  }
  async function prepareVideo(){
   controller?.abort();controller=new AbortController();const request=controller;
   mediaState='loading';downloadPercent=null;dismissed=false;stages.video=0;delete video.dataset.prepared;showMedia();
   clearTimeout(mediaTimer);mediaTimer=setTimeout(()=>{if(request===controller)mediaFailed();},45000);
   try{
    // One same-origin transfer. Local blob playback avoids mobile preload limits.
    const response=await fetch(video.dataset.src,{signal:request.signal,credentials:'same-origin'});
    if(!response.ok)throw new Error('Video response failed');
    const total=Number(response.headers.get('content-length'))||0;let blob;
    if(response.body?.getReader){
     const reader=response.body.getReader(),chunks=[];let received=0;
     for(;;){const {done:ended,value}=await reader.read();if(ended)break;chunks.push(value);received+=value.byteLength;
      if(total){stages.video=Math.min(.97,received/total*.97);downloadPercent=Math.min(99,Math.floor(received/total*100));update();showMedia();}
     }
     blob=new Blob(chunks,{type:'video/mp4'});
    }else blob=await response.blob();
    if(request.signal.aborted||request!==controller)return;
    if(!blob.size)throw new Error('Empty video');
    if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(blob);
    downloadPercent=100;stages.video=.98;video.preload='auto';video.src=objectUrl;video.load();showMedia();update();
   }catch(error){if(request===controller&&!request.signal.aborted)mediaFailed();}
  }
  if(video&&!limited){video.addEventListener('loadeddata',mediaReady);video.addEventListener('canplay',mediaReady);video.addEventListener('error',mediaFailed);retry.addEventListener('click',prepareVideo);prepareVideo();}
  // Longer downloads continue behind the page; the opening never traps a visitor.
  timeout=setTimeout(()=>finish(true),6500);if(active)raf=requestAnimationFrame(paint);update();
  window.addEventListener('pagehide',e=>{finish(true);restore();if(!e.persisted){controller?.abort();clearTimeout(mediaTimer);if(objectUrl)URL.revokeObjectURL(objectUrl);}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
