// Runs in the head so internal navigation never flashes the arrival overlay.
export const navigationBootstrap = String.raw`(() => {
 const root=document.documentElement, key='sarra-internal-navigation';
 const navigation=performance.getEntriesByType?.('navigation')[0]?.type || 'navigate';
 let marker=null;
 try { marker=JSON.parse(sessionStorage.getItem(key)||'null');sessionStorage.removeItem(key); } catch {}
 const internal=marker && marker.to===location.href && Date.now()-marker.at>=0 && Date.now()-marker.at<15000 && document.referrer===marker.from;
 const skip=navigation==='back_forward' || (navigation!=='reload' && internal);
 window.addEventListener('click',event=>{
  if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
  const link=event.target.closest?.('a[href]');
  if(!link || link.hasAttribute('download') || (link.target && link.target!=='_self'))return;
  const destination=new URL(link.href,location.href);
  if(destination.origin!==location.origin || !/^https?:$/.test(destination.protocol))return;
  if(destination.pathname==='/' && location.pathname==='/' && destination.search===location.search && !destination.hash){
   event.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;
  }
  if(destination.pathname===location.pathname && destination.search===location.search && destination.hash)return;
  const source=new URL(location.href);source.hash='';
  try {sessionStorage.setItem(key,JSON.stringify({to:destination.href,from:source.href,at:Date.now()}));}catch{}
 });
 if(skip)return;
 root.classList.add('is-loading');
 window.setTimeout(()=>{
  if(!root.classList.contains('is-loading'))return;
  window.dispatchEvent(new Event('portfolio:skip'));root.classList.remove('is-loading');
  document.querySelectorAll('[data-loader-inert]').forEach(e=>{e.inert=false;});
  window.dispatchEvent(new Event('portfolio:entered'));
 },8000);
})();`;
