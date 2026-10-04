import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../public/static/app.js',import.meta.url),'utf8');
const start=source.indexOf('  function initHeroVideo() {'),end=source.indexOf('\n  // Featured scenes:',start);
class Node extends EventTarget {constructor(){super();const classes=new Set();this.classList={add:s=>classes.add(s),remove:s=>classes.delete(s),contains:s=>classes.has(s)};}pause(){}}
const video=new Node(),hero=new Node(),wrap=new Node(),window=new EventTarget(),document=new EventTarget();
Object.assign(video,{dataset:{prepared:'true'},readyState:2,duration:10,currentTime:0});hero.offsetHeight=800;wrap.classList.add('hero-video-wrap--static');
let top=-1200;wrap.getBoundingClientRect=()=>({top,height:4000});wrap.querySelector=()=>hero;
document.querySelector=s=>s==='[data-hero-video]'?video:wrap;
vm.runInNewContext(source.slice(start,end)+'\ninitHeroVideo();',{document,window,REDUCED:false,requestAnimationFrame:()=>1,cancelAnimationFrame(){},Number,Math});
assert.equal(wrap.classList.contains('hero-video-wrap--static'),true);
window.dispatchEvent(new Event('scroll'));assert.equal(wrap.classList.contains('hero-video-wrap--static'),true);
top=0;window.dispatchEvent(new Event('scroll'));assert.equal(wrap.classList.contains('hero-video-wrap--static'),false);assert.equal(hero.classList.contains('hero--video-ready'),true);
console.log('Late video waits until return to hero before expanding its scroll range.');
