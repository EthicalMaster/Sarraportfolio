import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom',esbuild:{jsx:'automatic',jsxImportSource:'hono/jsx'}});
try{
 const {default:app}=await server.ssrLoadModule('/src/index.tsx');
 const response=await app.request('http://test/contact'),html=await response.text();assert.equal(response.status,200);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/data-enquiry=/g)||[]).length,3);
 for(const phrase of ['/static/contact.css','/static/contact.js','mailto:sarraburhanuddinsaifee@gmail.com','https://www.linkedin.com/in/sarra-saifee-21809a22b','https://www.instagram.com/arven_architects/'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('tel:'));assert.ok(!html.includes('9893697462'));assert.ok(!html.includes('by appointment'));
 const home=await (await app.request('http://test/')).text();assert.ok(!home.includes('/static/contact.js'));
 console.log('Contact renders with three enquiry choices, real email/social links, no phone; script is route-scoped.');
}finally{await server.close();}
const source=readFileSync(new URL('../public/static/contact.js',import.meta.url),'utf8');
class Element {
 constructor(){this.listeners={};this.dataset={};this.attrs={};this.style={setProperty(){}};this.parentElement={animate:()=>({cancel(){}})};}
 addEventListener(n,fn){this.listeners[n]=fn;}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}
 getBoundingClientRect(){return {top:0};}
}
async function interaction(clipboardWorks){
 const options=['opportunity','collaboration','project'].map((id,i)=>{const e=new Element();e.dataset={title:id+' title',description:id+' description',subject:id+' & Sarra'};e.attrs['aria-pressed']=String(i===0);return e;});
 const title=new Element(),description=new Element(),write=new Element(),copy=new Element(),status=new Element(),link=new Element();
 const nodes={'[data-enquiry-title]':title,'[data-enquiry-description]':description,'[data-write-email]':write,'[data-copy-email]':copy,'[data-copy-status]':status,'[data-contact-email]':link,'.ct-opening':new Element(),'.ct-space':new Element()};
 const page=new Element();page.dataset.email='sarraburhanuddinsaifee@gmail.com';page.querySelector=s=>nodes[s];page.querySelectorAll=()=>options;
 let copied='',selected=false;const document={querySelector:()=>page,documentElement:{classList:{contains:()=>true}},addEventListener(){},createRange:()=>({selectNodeContents:e=>{selected=e===link;}})};
 const window={addEventListener(){},getSelection:()=>({removeAllRanges(){},addRange(){}})};
 vm.runInNewContext(source,{document,window,matchMedia:()=>({matches:true,addEventListener(){}}),performance:{now:()=>0},navigator:{clipboard:{writeText:async text=>{if(!clipboardWorks)throw Error('denied');copied=text;}}},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},encodeURIComponent,Math});
 options[2].listeners.click();assert.equal(options[0].attrs['aria-pressed'],'false');assert.equal(options[2].attrs['aria-pressed'],'true');assert.equal(title.textContent,'project title');assert.equal(description.textContent,'project description');assert.equal(write.href,'mailto:sarraburhanuddinsaifee@gmail.com?subject=project%20%26%20Sarra');
 await copy.listeners.click();if(clipboardWorks){assert.equal(copied,page.dataset.email);assert.match(status.textContent,/copied/);}else{assert.ok(selected);assert.match(status.textContent,/Select and copy/);assert.ok(!status.textContent.includes('copied'));}
}
await interaction(true);await interaction(false);console.log('Enquiry changes update selection, copy, and encoded mail subject; copy success and denial paths pass.');
