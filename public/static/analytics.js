/* Small, first-party counters. No URL parameters, identity, IP or full referrer is sent. */
(()=>{
 'use strict';
 if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true||!/^\/(?:about|contact|work(?:\/[a-z0-9-]{1,150})?)?\/?$/.test(location.pathname))return;
 try{if(localStorage.getItem('sarra-analytics-exclude')==='1')return}catch{}
 const path=location.pathname.replace(/\/$/,'')||'/',key='sarra-analytics-visit';let visit;
 function source(){try{const h=new URL(document.referrer).hostname;if(h===location.hostname)return 'direct';if(/(^|\.)google\.[a-z.]+$/.test(h))return 'google';if(/(^|\.)linkedin\.com$/.test(h))return 'linkedin';if(/(^|\.)instagram\.com$/.test(h))return 'instagram';return 'other'}catch{return 'direct'}}
 function session(){const now=Date.now();try{visit=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}if(!visit||typeof visit.id!=='string'||now-visit.at>1800000)visit={id:crypto.randomUUID(),at:now,source:source()};visit.at=now;try{sessionStorage.setItem(key,JSON.stringify(visit))}catch{}return visit;}
 const sent=new Set();
 function send(event){if(sent.has(event))return;sent.add(event);try{const v=session();fetch('/_portfolio/event',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),session:v.id,path,event,source:v.source,device:/ipad|tablet/i.test(navigator.userAgent)?'tablet':/mobi/i.test(navigator.userAgent)?'mobile':'desktop'})}).catch(()=>{})}catch{}}
 function viewed(){if(document.visibilityState==='visible')send('pageview')}
 if(document.readyState!=='loading')viewed();else document.addEventListener('DOMContentLoaded',viewed,{once:true});document.addEventListener('visibilitychange',viewed);
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;let u;try{u=new URL(a.href,location.origin)}catch{return}if(a.hasAttribute('data-analytics-booklet'))return send('booklet');if(u.protocol==='mailto:')return send('email');if(/(^|\.)linkedin\.com$/.test(u.hostname))return send('linkedin');if(/(^|\.)instagram\.com$/.test(u.hostname))return send('instagram');});
})();
