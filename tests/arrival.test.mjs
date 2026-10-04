import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('../public/static/arrival.js',import.meta.url),'utf8');
class Element extends EventTarget {
 constructor(tag='DIV'){super();this.tagName=tag;this.children=[];this.dataset={};this.attrs={};this.inert=false;this.hidden=false;this.style={setProperty(){}};const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)};}
 setAttribute(k,v){this.attrs[k]=v;} removeAttribute(k){delete this.attrs[k];}append(...els){this.children.push(...els);}contains(el){return this.children.includes(el);}focus(){}remove(){this.removed=true;}pause(){}getBoundingClientRect(){return {top:0,bottom:200};}
}
async function setup({reduced=false,saveData=false,hasVideo=true,contentLength=true}={}){
 const root=new Element(),overlay=new Element(),body=new Element(),main=new Element(),window=new EventTarget();root.classList.add('is-loading');root.classList.add('js-ready');
 const parts=Object.fromEntries(['number','progress','status','skip','phase'].map(k=>[k,new Element()]));overlay.children=Object.values(parts);overlay.querySelector=s=>parts[s.match(/data-arrival-(.+)\]/)[1]];
 const video=hasVideo?new Element('VIDEO'):null;if(video){video.dataset.src='/film.mp4';video.readyState=0;video.load=()=>{};}
 body.append(overlay,main);const image=new Element('IMG');image.complete=true;image.decode=()=>Promise.resolve();
 const document=new EventTarget();Object.assign(document,{readyState:'complete',documentElement:root,body,images:[image],fonts:{ready:Promise.resolve()},createElement:t=>new Element(t.toUpperCase()),querySelector:s=>s==='[data-arrival]'?overlay:video,getElementById:()=>main});
 let now=0,id=0,requests=[];const timers=new Map(),frames=new Map();
 const context={document,window,navigator:{connection:{saveData}},matchMedia:()=>({matches:reduced}),innerHeight:800,innerWidth:1200,sessionStorage:{setItem(){}},AbortController,Blob,Event,URL:{createObjectURL:()=> 'blob:film',revokeObjectURL(){}},setTimeout:(fn,delay)=>{timers.set(++id,{at:now+delay,fn});return id;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),fetch:(url,options)=>new Promise((resolve,reject)=>requests.push({url,options,resolve,reject}))};
 vm.runInNewContext(code,context);
 async function flush(){for(let i=0;i<20;i++)await Promise.resolve();}
 async function advance(ms){const end=now+ms;for(;;){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();await flush();}now=end;const current=[...frames.values()];frames.clear();current.forEach(fn=>fn(now));await flush();}
 async function deliver(){let n=0;requests.at(-1).resolve({ok:true,headers:{get:()=>contentLength?'8':null},body:{getReader:()=>({read:async()=>n++<2?{done:false,value:new Uint8Array(4)}:{done:true}})}});await flush();}
 async function decode(){video.readyState=2;video.dispatchEvent(new Event('loadeddata'));await flush();}
 await flush();return {root,overlay,body,main,parts,video,requests,advance,deliver,decode,flush,chip:()=>body.children.find(e=>e.className==='hero-preparation')};
}
{
 const t=await setup();await t.deliver();assert.equal(t.video.src,'blob:film');assert.notEqual(t.video.dataset.prepared,'true');await t.decode();await t.advance(700);assert.equal(t.video.dataset.prepared,'true');assert.equal(t.parts.number.textContent,'100');assert.equal(t.main.inert,false);assert.ok(t.overlay.removed);assert.equal(t.requests.length,1);console.log('Normal completion: one transfer, decoded readiness, 100%, focus unlock.');
}
for(const method of ['skip','deadline']){
 const t=await setup();if(method==='skip')t.parts.skip.dispatchEvent(new Event('click'));await t.advance(method==='skip'?700:7200);
 assert.ok(t.overlay.removed);assert.equal(t.requests[0].options.signal.aborted,false);assert.notEqual(t.parts.number.textContent,'100');assert.equal(t.chip().hidden,false);
 await t.deliver();await t.decode();assert.equal(t.video.dataset.prepared,'true');assert.equal(t.chip().hidden,true);console.log(`${method}: entry does not abort media; late readiness works.`);
}
{
 const t=await setup();t.requests[0].reject(new Error('Offline'));await t.flush();await t.advance(700);assert.ok(t.overlay.removed);const retry=t.chip().children[1];assert.equal(retry.hidden,false);retry.dispatchEvent(new Event('click'));assert.equal(t.requests.length,2);await t.deliver();await t.decode();assert.equal(t.video.dataset.prepared,'true');console.log('Failure: still view, accessible retry, successful recovery.');
}
for(const options of [{reduced:true},{saveData:true},{hasVideo:false}]){const t=await setup(options);await t.advance(700);assert.equal(t.requests.length,0);assert.ok(t.overlay.removed);console.log('Reduced motion / data saving / non-home: no video download.');}
{
 const t=await setup();await t.advance(45001);assert.equal(t.requests[0].options.signal.aborted,true);assert.equal(t.chip().children[1].hidden,false);console.log('Stalled transfer: bounded timeout and retry, no locked page.');
}
{
 const t=await setup({contentLength:false});await t.deliver();await t.decode();await t.advance(700);assert.equal(t.video.dataset.prepared,'true');console.log('Missing Content-Length: completion works without inventing download percentages.');
}
