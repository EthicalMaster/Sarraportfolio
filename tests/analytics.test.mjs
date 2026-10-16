import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
try{
 const {validEvent}=await server.ssrLoadModule('/src/analytics.ts');
 const sample={id:randomUUID(),session:randomUUID(),path:'/work/courtyard',event:'pageview',source:'linkedin',device:'mobile'};
 assert.ok(validEvent(sample));for(const path of ['/admin','/admin/login','/work/a?email=private','https://other.test','/work/../admin'])assert.ok(!validEvent({...sample,path}));assert.ok(!validEvent({...sample,event:'password'}));assert.ok(!validEvent({...sample,source:'private.example.com'}));
 const {default:app}=await server.ssrLoadModule('/src/index.tsx');
 const old={STUDIO_ANALYTICS_KEY:process.env.STUDIO_ANALYTICS_KEY,VERCEL_ENV:process.env.VERCEL_ENV};
 try{
 process.env.STUDIO_ANALYTICS_KEY='a'.repeat(64);process.env.VERCEL_ENV='production';
 assert.equal((await app.request('http://test/_portfolio/event',{method:'POST',headers:{Origin:'https://evil.test'},body:JSON.stringify(sample)})).status,403);
 assert.equal((await app.request('http://test/_portfolio/event',{method:'POST',headers:{Origin:'http://test'},body:JSON.stringify({...sample,path:'/admin'})})).status,400);
 assert.equal((await app.request('http://test/_portfolio/event',{method:'POST',headers:{Origin:'http://test',Cookie:'sb-test-auth-token=abc'},body:JSON.stringify(sample)})).status,204);
 assert.equal((await app.request('http://test/_portfolio/event',{method:'POST',headers:{Origin:'http://test'},body:'x'.repeat(3000)})).status,413);
 assert.equal((await app.request('http://test/admin/api/analytics')).status,503);
 }finally{for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v}}
}finally{await server.close()}
const source=readFileSync(new URL('../public/static/analytics.js',import.meta.url),'utf8');
function browser({excluded=false,dnt=false,path='/work/courtyard',storage=true}={}){
 const requests=[],events={},store=new Map();
 const context={navigator:{doNotTrack:dnt?'1':'0',userAgent:'Mobile browser'},location:{pathname:path,hostname:'portfolio.test',origin:'https://portfolio.test'},document:{visibilityState:'visible',readyState:'complete',referrer:'https://www.linkedin.com/feed/?private=secret',addEventListener:(n,f)=>events[n]=f},window:{addEventListener:(n,f)=>events[n]=f},localStorage:{getItem:()=>excluded?'1':null},sessionStorage:{getItem:k=>{if(!storage)throw Error('blocked');return store.get(k)},setItem:(k,v)=>{if(!storage)throw Error('blocked');store.set(k,v)}},crypto:{randomUUID},URL,Date,fetch:async(url,options)=>{requests.push({url,data:JSON.parse(options.body)});return {ok:true}}};
 vm.runInNewContext(source,context);return {requests,events,context};
}
const b=browser();assert.equal(b.requests.length,1);assert.equal(b.requests[0].data.source,'linkedin');assert.ok(!JSON.stringify(b.requests).includes('secret'));b.events.visibilitychange();assert.equal(b.requests.length,1);
b.events.click({target:{closest:()=>({href:'mailto:private@example.com?subject=personal',hasAttribute:()=>false})}});assert.equal(b.requests.length,2);assert.equal(b.requests[1].data.event,'email');assert.ok(!JSON.stringify(b.requests).includes('private@example.com'));
b.events.click({target:{closest:()=>({href:'mailto:private@example.com',hasAttribute:()=>false})}});assert.equal(b.requests.length,2);
for(const options of [{excluded:true},{dnt:true},{path:'/admin'}])assert.equal(browser(options).requests.length,0);
assert.equal(browser({storage:false}).requests.length,1);
console.log('Analytics: public-page validation, admin and privacy exclusions, event deduplication, sanitised payloads, unavailable storage and protected report route passed.');
