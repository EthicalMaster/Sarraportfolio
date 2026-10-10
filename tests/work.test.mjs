import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
let projects;
try {
 const {default:app}=await server.ssrLoadModule('/src/index.tsx');
 projects=(await server.ssrLoadModule('/src/data/projects.ts')).allProjects();
 const work=await (await app.request('http://test/work')).text();
 assert.equal((work.match(/data-wk-card/g)||[]).length,projects.length);
 for(const p of projects){const response=await app.request(`http://test/work/${p.slug}`);assert.equal(response.status,200);const html=await response.text();assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok((html.match(/data-lightbox/g)||[]).length>=6);for(const id of ['overview','approach','gallery'])assert.ok(html.includes(`id="${id}"`));assert.ok(html.includes('Sample project'));assert.ok(!html.includes('undefined'));}
 for(const path of ['/','/about','/contact']){const html=await(await app.request(`http://test${path}`)).text();assert.ok(!html.includes('/static/work.js'));assert.ok(!html.includes('/static/work.css'));}
 assert.equal((await app.request('http://test/work/missing-project')).status,404);
}finally{await server.close()}
class Element {constructor(dataset={}){this.dataset=dataset;this.listeners={};this.attrs={};this.hidden=false;}addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=v}getAnimations(){return []}getBoundingClientRect(){return {left:0,top:0}}animate(){}focus(){}closest(){return null}}
const cards=projects.map(p=>new Element({discipline:p.discipline,track:p.track}));
const buttons=Object.entries({discipline:['all','architecture','interior'],track:['all','academic','professional']}).flatMap(([wkType,values])=>values.map(wkValue=>new Element({wkType,wkValue})));
const count=new Element(),empty=new Element(),reset=new Element();
const root={querySelectorAll:s=>s==='[data-wk-card]'?cards:s==='[data-wk-type]'?buttons:[reset],querySelector:s=>s==='[data-wk-count]'?count:s==='[data-wk-empty]'?empty:s==='[data-wk-type]'?buttons[0]:reset};
const location={pathname:'/work',search:'?discipline=invalid'},stored={};let url='';
vm.runInNewContext(readFileSync(new URL('../public/static/work.js',import.meta.url),'utf8'),{document:{querySelector:s=>s==='[data-work-index]'?root:null},matchMedia:()=>({matches:true}),URLSearchParams,location,history:{replaceState:(_,__,u)=>{url=u}},sessionStorage:{setItem:(k,v)=>stored[k]=v},addEventListener(){}});
assert.equal(cards.filter(c=>!c.hidden).length,projects.length);
buttons.find(b=>b.dataset.wkValue==='interior').listeners.click();
assert.equal(cards.filter(c=>!c.hidden).length,projects.filter(p=>p.discipline==='interior').length);assert.equal(url,'/work?discipline=interior');assert.equal(reset.hidden,false);
buttons.find(b=>b.dataset.wkValue==='academic').listeners.click();
assert.equal(cards.filter(c=>!c.hidden).length,projects.filter(p=>p.discipline==='interior'&&p.track==='academic').length);
assert.deepEqual(cards.filter(c=>!c.hidden).map(c=>c.dataset.layout),cards.filter(c=>!c.hidden).map((_,i)=>String(i%4)));
reset.listeners.click();assert.equal(cards.filter(c=>!c.hidden).length,projects.length);assert.equal(url,'/work');assert.equal(reset.hidden,true);
console.log('All project routes, six-image galleries, route isolation, invalid filters, combined filters, reset and layout order pass.');
