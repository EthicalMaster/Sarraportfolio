import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
try {
 const {authorisedUser}=await server.ssrLoadModule('/src/admin/auth.ts');
 const allowed='a1234567-1234-1234-1234-123456789abc';
 const user={id:allowed,email_confirmed_at:'2026-10-10',is_anonymous:false};
 const client=(u,error=null)=>({auth:{getUser:async()=>({data:{user:u},error})}});
 assert.equal((await authorisedUser(client(user),[allowed])).id,allowed);
 assert.equal(await authorisedUser(client({...user,id:'other',user_metadata:{admin:true}}),[allowed]),null);
 assert.equal(await authorisedUser(client({...user,email_confirmed_at:null}),[allowed]),null);
 assert.equal(await authorisedUser(client({...user,is_anonymous:true}),[allowed]),null);
 assert.equal(await authorisedUser(client(user,Error('expired')),[allowed]),null);
 assert.equal(await authorisedUser(client(null),[allowed]),null);
 const {default:app}=await server.ssrLoadModule('/src/index.tsx');
 const login=await app.request('http://test/admin/login',{method:'POST',headers:{Origin:'http://test','Content-Type':'application/x-www-form-urlencoded'},body:'email=a%40b.com&password=test'});
 assert.equal(login.status,503);assert.ok(!(await login.text()).includes('password=test'));
 assert.equal((await app.request('http://test/admin/logout',{method:'POST'})).status,403);
 assert.equal((await app.request('http://test/admin/login',{method:'POST',headers:{Origin:'http://test'},body:'x'.repeat(9000)})).status,413);
 console.log('Auth: verified allowlist, unconfirmed/anonymous/expired denial, no metadata trust, CSRF and body bounds pass.');
}finally{await server.close()}
