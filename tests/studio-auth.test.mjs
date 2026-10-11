import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
try {
 const {authorisedUser,sameOrigin,secureCookies}=await server.ssrLoadModule('/src/admin/auth.ts');
 const old={VERCEL:process.env.VERCEL,VERCEL_URL:process.env.VERCEL_URL,VERCEL_PROJECT_PRODUCTION_URL:process.env.VERCEL_PROJECT_PRODUCTION_URL,STUDIO_PUBLIC_ORIGIN:process.env.STUDIO_PUBLIC_ORIGIN};
 const ctx=origin=>({req:{url:'http://internal-function/admin/login',header:name=>name==='Origin'?origin:name==='X-Forwarded-Host'?'evil.test':undefined}});
 try{
 process.env.VERCEL='1';process.env.VERCEL_PROJECT_PRODUCTION_URL='sarraportfolio-eight.vercel.app';process.env.VERCEL_URL='sarra-deployment.vercel.app';delete process.env.STUDIO_PUBLIC_ORIGIN;
 assert.ok(sameOrigin(ctx('https://sarraportfolio-eight.vercel.app')));assert.ok(secureCookies(ctx('https://sarraportfolio-eight.vercel.app')));
 assert.ok(!sameOrigin(ctx('https://evil.test')));assert.ok(!sameOrigin(ctx('http://internal-function')));assert.ok(!sameOrigin(ctx(undefined)));assert.ok(!sameOrigin(ctx('null')));
 process.env.STUDIO_PUBLIC_ORIGIN='https://sarraportfolio-eight.vercel.app';assert.ok(sameOrigin(ctx(process.env.STUDIO_PUBLIC_ORIGIN)));assert.ok(!sameOrigin(ctx('https://sarra-deployment.vercel.app')));
 process.env.STUDIO_PUBLIC_ORIGIN='invalid';assert.ok(!sameOrigin(ctx('https://sarraportfolio-eight.vercel.app')));
 }finally{for(const [key,value] of Object.entries(old)){if(value===undefined)delete process.env[key];else process.env[key]=value}}
 const allowed='a1234567-1234-1234-1234-123456789abc';
 const user={id:allowed,email_confirmed_at:'2026-10-10',is_anonymous:false};
 const client=(u,error=null,member=true)=>({auth:{getUser:async()=>({data:{user:u},error})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:member?{user_id:u?.id}:null,error:null})})})})});
 assert.equal((await authorisedUser(client(user),[allowed])).id,allowed);
 assert.equal(await authorisedUser(client({...user,id:'other',user_metadata:{admin:true}}),[allowed]),null);
 assert.equal(await authorisedUser(client({...user,email_confirmed_at:null}),[allowed]),null);
 assert.equal(await authorisedUser(client({...user,is_anonymous:true}),[allowed]),null);
 assert.equal(await authorisedUser(client(user,Error('expired')),[allowed]),null);
 assert.equal(await authorisedUser(client(null),[allowed]),null);
 assert.equal(await authorisedUser(client(user,null,false),[allowed]),null);
 const {default:app}=await server.ssrLoadModule('/src/index.tsx');
 const login=await app.request('http://test/admin/login',{method:'POST',headers:{Origin:'http://test','Content-Type':'application/x-www-form-urlencoded'},body:'email=a%40b.com&password=test'});
 assert.equal(login.status,503);assert.ok(!(await login.text()).includes('password=test'));
 assert.equal((await app.request('http://test/admin/logout',{method:'POST'})).status,403);
 assert.equal((await app.request('http://test/admin/login',{method:'POST',headers:{Origin:'http://test'},body:'x'.repeat(9000)})).status,413);
 console.log('Auth: verified allowlist, unconfirmed/anonymous/expired denial, no metadata trust, CSRF and body bounds pass.');
}finally{await server.close()}
