import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/navigation-bootstrap.ts',import.meta.url),'utf8').split('String.raw`')[1].split('`;')[0];
const key='sarra-internal-navigation', origin='https://portfolio.test';
function page({path='/',type='navigate',marker=null,referrer='',denied=false}={}){
 const saved={[key]:JSON.stringify(marker)},listeners={},classes=new Set();let scrolled=false;
 const location=new URL(path,origin);
 const sessionStorage={getItem:k=>{if(denied)throw Error();return saved[k]},removeItem:k=>delete saved[k],setItem:(k,v)=>saved[k]=v};
 vm.runInNewContext(source,{document:{documentElement:{classList:{add:c=>classes.add(c)}},referrer},location,sessionStorage,performance:{getEntriesByType:()=>[{type}]},window:{addEventListener:(k,fn)=>listeners[k]=fn,setTimeout(){},scrollTo(){scrolled=true}},URL,Date,matchMedia:()=>({matches:false})});
 const click=(href,options={})=>{const link={href:new URL(href,origin).href,target:options.target||'',hasAttribute:()=>false};const e={button:0,target:{closest:()=>link},preventDefault(){this.defaultPrevented=true},...options};listeners.click(e);return e};
 return {saved,classes,click,scrolled:()=>scrolled};
}
const mark={to:origin+'/',from:origin+'/work',at:Date.now()};
assert.ok(page().classes.has('is-loading'));
assert.ok(page({path:'/about'}).classes.has('is-loading'));
assert.ok(!page({marker:mark,referrer:mark.from}).classes.has('is-loading'));
assert.ok(page({type:'reload',marker:mark,referrer:mark.from}).classes.has('is-loading'));
assert.ok(!page({type:'back_forward'}).classes.has('is-loading'));
assert.ok(page({marker:{...mark,at:Date.now()-20000},referrer:mark.from}).classes.has('is-loading'));
assert.ok(page({marker:mark}).classes.has('is-loading'));
assert.ok(page({denied:true}).classes.has('is-loading'));
const from=page({path:'/work'});from.click('/');const marker=JSON.parse(from.saved[key]);assert.equal(marker.to,origin+'/');const home=page({marker,referrer:origin+'/work'});assert.ok(!home.classes.has('is-loading'));assert.equal(home.saved[key],undefined);
assert.ok(home.click('/').defaultPrevented);assert.ok(home.scrolled());
for(const options of [{ctrlKey:true},{target:'_blank'},{defaultPrevented:true}]){const p=page({path:'/about'});p.click('/',options);assert.equal(p.saved[key],undefined)}
console.log('Fresh arrivals, reload, internal return, back/forward, expired markers, blocked storage, modified clicks and Home-to-top pass.');

const chapter=page({path:'/work/project#gallery'});chapter.click('/');assert.equal(JSON.parse(chapter.saved[key]).from,origin+'/work/project');
