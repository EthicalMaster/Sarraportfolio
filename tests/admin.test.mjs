import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createServer as createVite} from 'vite';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
let starterProjects;
const vite=await createVite({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
try{const {default:app}=await vite.ssrLoadModule('/src/index.tsx');const r=await app.request('http://test/admin');assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/admin/login');const login=await app.request('http://test/admin/login');const html=await login.text();assert.ok(html.includes('Account setup is pending'));assert.ok(!html.includes('/static/admin.js'));assert.ok(r.headers.get('cache-control').includes('no-store'));const source=await app.request('http://test/admin/starter-projects');assert.equal(source.status,503);starterProjects=(await vite.ssrLoadModule('/src/admin/project-import.ts')).existingProjectDrafts();assert.equal(starterProjects.length,8);}finally{await vite.close()}
// Exercise the actual compiled production handler: no editor is served.
const {default:handler}=await import('../.vercel/output/functions/__hono.func/index.js');
const server=createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{const base=`http://127.0.0.1:${server.address().port}`;const r=await fetch(base+'/admin',{redirect:'manual'});assert.equal(r.status,303);const login=await fetch(base+'/admin/login');const html=await login.text();assert.ok(html.includes('Account setup is pending'));assert.ok(!html.includes('/static/admin.js'));const seed=await fetch(base+'/admin/starter-projects');assert.equal(seed.status,503);assert.ok(!(await seed.text()).includes('sourceSlug'));const blocked=await fetch(base+'/admin/login',{method:'POST',headers:{Origin:'https://other.test'}});assert.equal(blocked.status,403);}finally{await new Promise(r=>server.close(r))}
const nodes=new Map(),listeners={};const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',style:{},addEventListener(){},focus(){},showModal(){},value:'full'});return nodes.get(s)};
let failSave=false,written;
const source=readFileSync(new URL('../public/static/admin.js',import.meta.url),'utf8');
const code=source.slice(0,source.lastIndexOf("workspace.innerHTML='<p class="))+"globalThis.studioTest={newProject,save,validateBackup,preview,importExisting,current:()=>current,projects:()=>projects,dirty:()=>dirty};})();";
const context={document:{querySelector:node,addEventListener:(k,fn)=>listeners[k]=fn},window:{addEventListener(){}},fetch:async(url,options={})=>{if(url==='/admin/starter-projects')return {ok:true,json:async()=>({projects:structuredClone(starterProjects)})};if(failSave)return {ok:false,json:async()=>({error:'Connection lost'})};const list=JSON.parse(options.body).projects;written=structuredClone(list[0]);return {ok:true,json:async()=>({projects:list.map(p=>({...p,cloudRevision:(p.cloudRevision||0)+1}))})};},crypto:{randomUUID},structuredClone,setTimeout:()=>1,clearTimeout(){},console};
vm.runInNewContext(code,context);const api=context.studioTest;
api.newProject(true);assert.equal(api.current().sections.length,1);assert.ok(api.dirty());
await api.save();assert.equal(written.title,'Courtyard study');assert.equal(api.projects().length,1);assert.equal(api.dirty(),false);
api.current().title='<img src=x onerror=alert(1)>';api.preview(api.current());assert.ok(node('#preview-content').innerHTML.includes('&lt;img'));assert.ok(!node('#preview-content').innerHTML.includes('<img src=x'));
const good={format:'sarra-studio-preview-v1',projects:[api.current()]};const imported=api.validateBackup(good);assert.equal(imported[0].status,'draft');assert.notEqual(imported[0].id,api.current().id);
const bad=structuredClone(good);bad.projects[0].sections[0].type='<script>';assert.throws(()=>api.validateBackup(bad));
const badImage=structuredClone(good);badImage.projects[0].sections[0].images=[{src:'https://attacker.test/tracking.png'}];assert.throws(()=>api.validateBackup(badImage));
await api.importExisting();assert.equal(api.projects().length,9);const existing=api.projects().find(p=>p.sourceSlug);existing.title='Sarra actual project';await api.importExisting();assert.equal(api.projects().length,9);assert.equal(api.projects().find(p=>p.id===existing.id).title,'Sarra actual project');
const backup={format:'sarra-studio-preview-v1',projects:[existing]};assert.equal(api.validateBackup(backup)[0].sourceSlug,undefined);
api.newProject(true);failSave=true;await assert.rejects(api.save(),/Connection lost/);assert.ok(api.dirty());
console.log('Admin: login gate, unconfigured denial, draft persistence, failed save recovery, escaped preview and safe backup import, existing-slot migration, repeat-import preservation and unique replacement assignments pass.');
