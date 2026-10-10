import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createServer as createVite} from 'vite';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
const vite=await createVite({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
try{const {default:app}=await vite.ssrLoadModule('/src/index.tsx');const r=await app.request('http://test/admin');const html=await r.text();assert.equal(r.status,200);assert.ok(html.includes('/static/admin.js'));assert.ok(html.includes('Live publishing is not connected'));assert.ok(!html.includes('data-arrival'));assert.equal(r.headers.get('cache-control'),'no-store');}finally{await vite.close()}
// Exercise the actual compiled production handler: no editor is served.
const {default:handler}=await import('../.vercel/output/functions/__hono.func/index.js');
const server=createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{const r=await fetch(`http://127.0.0.1:${server.address().port}/admin`);const html=await r.text();assert.equal(r.status,503);assert.ok(!html.includes('/static/admin.js'));assert.ok(html.includes('Private editing is not enabled'));}finally{await new Promise(r=>server.close(r))}
const nodes=new Map(),listeners={};const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',style:{},addEventListener(){},focus(){},showModal(){},value:'full'});return nodes.get(s)};
const code=readFileSync(new URL('../public/static/admin.js',import.meta.url),'utf8').replace("openDB().then(render).catch(()=>{workspace.innerHTML=shellHeading('Storage unavailable','Your browser could not open the studio.','Enable site storage or try a regular browser window. Nothing has been changed on the live website.');});","globalThis.studioTest={newProject,save,validateBackup,preview,setDB:v=>db=v,current:()=>current,projects:()=>projects,dirty:()=>dirty};");
const context={document:{querySelector:node,addEventListener:(k,fn)=>listeners[k]=fn},window:{addEventListener(){}},crypto:{randomUUID},structuredClone,setTimeout:()=>1,clearTimeout(){},console};
vm.runInNewContext(code,context);const api=context.studioTest;
api.newProject(true);assert.equal(api.current().sections.length,1);assert.ok(api.dirty());
let written;
api.setDB({transaction(){const tx={objectStore:()=>({put(p){written=structuredClone(p);queueMicrotask(()=>tx.oncomplete())}})};return tx;}});
await api.save();assert.equal(written.title,'Courtyard study');assert.equal(api.projects().length,1);assert.equal(api.dirty(),false);
api.current().title='<img src=x onerror=alert(1)>';api.preview(api.current());assert.ok(node('#preview-content').innerHTML.includes('&lt;img'));assert.ok(!node('#preview-content').innerHTML.includes('<img src=x'));
const good={format:'sarra-studio-preview-v1',projects:[api.current()]};const imported=api.validateBackup(good);assert.equal(imported[0].status,'draft');assert.notEqual(imported[0].id,api.current().id);
const bad=structuredClone(good);bad.projects[0].sections[0].type='<script>';assert.throws(()=>api.validateBackup(bad));
const badImage=structuredClone(good);badImage.projects[0].sections[0].images=[{src:'https://attacker.test/tracking.png'}];assert.throws(()=>api.validateBackup(badImage));
api.newProject(true);api.setDB({transaction(){const tx={objectStore:()=>({put(){queueMicrotask(()=>{tx.error=Error('quota');tx.onerror()})}})};return tx;}});await assert.rejects(api.save(),/quota/);assert.ok(api.dirty());
console.log('Admin: local-only route, production denial, draft persistence, failed save recovery, escaped preview and safe backup import pass.');
