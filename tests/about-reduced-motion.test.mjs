import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
class El extends EventTarget {
 constructor(top=0){super();this.top=top;this.dataset={};this.attrs={};this.style={setProperty(){},removeProperty(){}};}
 getBoundingClientRect(){return {top:this.top,height:500};}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}
 querySelector(){return new El();}
}
const root=new El(),sections=[new El(),new El(),new El()],thoughts=[new El(-1200),new El(-600),new El(-100)];
sections.forEach((e,i)=>e.id='section'+i);
const controls=[new El(),new El(),new El()],phase=new El(),number=new El();
const nodes={'[data-about-phase]':phase,'[data-study-number]':number};
root.querySelector=s=>nodes[s]||(nodes[s]=new El());
root.querySelectorAll=s=>({'[data-about-section]':sections,'[data-about-thought]':thoughts,'[data-about-milestone]':sections,'[data-study-control]':controls}[s]||[]);
const window=new EventTarget(),document=new EventTarget();document.querySelector=()=>root;
let pending=null;
vm.runInNewContext(readFileSync(new URL('../public/static/about.js',import.meta.url),'utf8'),{document,window,matchMedia:()=>({matches:true,addEventListener(){}}),requestAnimationFrame:fn=>{pending=fn;return 1;},cancelAnimationFrame(){},innerHeight:800,innerWidth:1200,Map,Math});
pending(16);assert.equal(controls[2].attrs['aria-current'],'step');assert.equal(number.textContent,'03');assert.equal(phase.textContent,'03 / Atmosphere');
thoughts.forEach(e=>e.top=1000);window.dispatchEvent(new Event('scroll'));pending(32);
assert.equal(controls[0].attrs['aria-current'],'step');assert.equal(controls[2].attrs['aria-current'],undefined);assert.equal(phase.textContent,'01 / Context');
console.log('Reduced motion retains accurate study labels and active controls while scrolling.');
