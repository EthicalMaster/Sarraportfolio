(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const allowed = {discipline:['all','architecture','interior'],track:['all','academic','professional']};
  const normalize = value => Object.fromEntries(Object.entries(allowed).map(([key, values]) => [key, values.includes(value[key]) ? value[key] : 'all']));
  const query = state => { const p = new URLSearchParams(); Object.entries(state).forEach(([k,v]) => {if(v !== 'all') p.set(k,v)}); return p.size ? `?${p}` : ''; };
  const save = state => {try {sessionStorage.setItem('sarra-work-filters',JSON.stringify(state))} catch {}};
  const root = document.querySelector('[data-work-index]');
  if (root) {
    const cards = [...root.querySelectorAll('[data-wk-card]')];
    let state = normalize(Object.fromEntries(new URLSearchParams(location.search)));
    function apply(animate = false) {
      cards.forEach(c => c.getAnimations().forEach(a => a.cancel()));
      const before = new Map(cards.filter(c => !c.hidden).map(c => [c,c.getBoundingClientRect()]));
      let count = 0;
      cards.forEach(c => {c.hidden = !Object.entries(state).every(([k,v]) => v === 'all' || c.dataset[k] === v); if(!c.hidden)c.dataset.layout=String(count++ % 4)});
      root.querySelectorAll('[data-wk-type]').forEach(b => b.setAttribute('aria-pressed',String(state[b.dataset.wkType] === b.dataset.wkValue)));
      root.querySelector('[data-wk-count]').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
      root.querySelector('[data-wk-empty]').hidden = count !== 0;
      root.querySelector('.wk-results [data-wk-reset]').hidden = Object.values(state).every(v => v === 'all');
      if(animate && !reduced.matches) cards.filter(c => !c.hidden).forEach(c => {
        const old = before.get(c), next = c.getBoundingClientRect();
        c.animate(old ? [{transform:`translate(${old.left-next.left}px,${old.top-next.top}px)`,opacity:.7},{transform:'none',opacity:1}] : [{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});
      });
      save(state);
    }
    root.querySelectorAll('[data-wk-type]').forEach(b => b.addEventListener('click',() => {state[b.dataset.wkType]=b.dataset.wkValue;history.replaceState(null,'',`${location.pathname}${query(state)}`);apply(true)}));
    root.querySelectorAll('[data-wk-reset]').forEach(b => b.addEventListener('click',() => {state=normalize({});history.replaceState(null,'',location.pathname);apply(true);if(b.closest('[data-wk-empty]'))root.querySelector('[data-wk-type]').focus({preventScroll:true})}));
    addEventListener('popstate',() => {state=normalize(Object.fromEntries(new URLSearchParams(location.search)));apply()});
    apply();
  }
  const story = document.querySelector('[data-project-story]');
  if (!story) return;
  try { const state=normalize(JSON.parse(sessionStorage.getItem('sarra-work-filters') || '{}'));story.querySelectorAll('[data-collection-back]').forEach(a => a.href=`/work${query(state)}`) } catch {}
  const sections=[...story.querySelectorAll('[data-pj-section]')], links=[...story.querySelectorAll('[data-pj-chapter]')];
  const progress=story.querySelector('.pj-progress>span');
  let scheduled=false;
  function update(){scheduled=false;let active=sections[0]?.id;sections.forEach(s => {if(s.getBoundingClientRect().top<innerHeight*.4)active=s.id});links.forEach(a => {if(a.dataset.pjChapter===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});const r=story.getBoundingClientRect();progress.style.transform=`scaleX(${Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight)))})`}
  addEventListener('scroll',() => {if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
  if(!reduced.matches && 'IntersectionObserver' in window){const observer=new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.remove('is-pending');observer.unobserve(e.target)}}),{rootMargin:'0px 0px 40px 0px',threshold:.05});story.querySelectorAll('.pj-image').forEach(el => {if(el.getBoundingClientRect().top>innerHeight){el.classList.add('is-pending');observer.observe(el)}});story.classList.add('pj-motion-ready');reduced.addEventListener('change',()=>{if(reduced.matches){story.querySelectorAll('.is-pending').forEach(el=>el.classList.remove('is-pending'));observer.disconnect()}},{once:true})}
})();
