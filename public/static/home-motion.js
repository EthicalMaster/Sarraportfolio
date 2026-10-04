/* Scroll choreography for the homepage below the hero.
 * Native scrolling, one event-driven animation loop, no perpetual ticker.
 * All content remains readable when scripts or motion are disabled.
 */
(function () {
  'use strict';
  const root = document.querySelector('[data-home-story]');
  if (!root) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stackQuery = window.matchMedia('(min-width: 900px) and (min-height: 650px)');
  const lines = Array.from(root.querySelectorAll('[data-type-line]'));
  const intro = root.querySelector('[data-motion-intro]');
  const ribbon = root.querySelector('[data-motion-ribbon]');
  const chapters = Array.from(root.querySelectorAll('[data-project-chapter]'));
  const process = root.querySelector('[data-motion-process]');
  const steps = Array.from(root.querySelectorAll('[data-process-step]'));
  const phase = root.querySelector('[data-study-phase]');
  const facts = Array.from(root.querySelectorAll('[data-practice-fact]'));
  const contact = root.querySelector('[data-motion-contact]');
  const phaseNames = ['01 / Observe', '02 / Explore', '03 / Develop', '04 / Communicate'];
  const state = new Map();
  let frame = 0;
  let lastTime = 0;
  let enabled = false;
  let running = false;
  let observer;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  function schedule() {
    if (enabled && !document.hidden && !frame) frame = requestAnimationFrame(render);
  }

  function set(el, name, target, suffix, blend) {
    if (!el) return;
    let values = state.get(el);
    if (!values) { values = new Map(); state.set(el, values); }
    const previous = values.has(name) ? values.get(name) : target;
    const value = Math.abs(target - previous) < 0.015 ? target : previous + (target - previous) * blend;
    if (Math.abs(target - value) > 0.015) running = true;
    if (!values.has(name) || Math.abs(value - previous) > 0.0001) {
      el.style.setProperty(name, value.toFixed(4) + suffix);
      values.set(name, value);
    }
  }

  function render(time) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const h = window.innerHeight || 800;
    const w = window.innerWidth || 1280;
    const bounds = root.getBoundingClientRect();
    if (bounds.top > h + 100 || bounds.bottom < -100) { lastTime = 0; return; }
    const blend = lastTime ? 1 - Math.exp(-Math.min(64, time - lastTime) / 65) : 1;
    lastTime = time;
    running = false;
    // Read geometry together before changing any styles.
    const lineRects = lines.map(el => el.getBoundingClientRect());
    const introRect = intro.getBoundingClientRect();
    const ribbonRect = ribbon.parentElement.getBoundingClientRect();
    const cardRects = chapters.map(el => el.getBoundingClientRect());
    const processRect = process.getBoundingClientRect();
    const stepRects = steps.map(el => el.getBoundingClientRect());
    const factRects = facts.map(el => el.getBoundingClientRect());
    const contactRect = contact.getBoundingClientRect();
    const stack = stackQuery.matches;
    const amplitude = w < 600 ? 0.4 : 1;

    lines.forEach((el, i) => {
      const p = clamp((h * 0.92 - lineRects[i].top) / (h * 0.55));
      set(el, '--ink-progress', p * 100, '%', blend);
      set(el, '--line-x', (1 - p) * (i === 1 ? 45 : -20) * amplitude, 'px', blend);
    });
    set(intro, '--cross-turn', clamp((h - introRect.top) / (h + introRect.height)) * 90, 'deg', blend);
    set(ribbon, '--ribbon-x', -clamp((h - ribbonRect.top) / (h + ribbonRect.height)) * Math.min(w * 0.28, 400), 'px', blend);

    chapters.forEach((el, i) => {
      const r = cardRects[i];
      const next = cardRects[i + 1];
      const depth = stack && next ? clamp((h * 0.92 - next.top) / (h * 0.92 - 106)) : 0;
      set(el, '--panel-scale', 1 - depth * 0.055, '', blend);
      set(el, '--panel-y', -depth * 12, 'px', blend);
      set(el, '--panel-shade', depth * 0.18, '', blend);
      const travel = clamp((h - r.top) / (h + r.height));
      set(el, '--picture-y', (travel - 0.5) * 58 * amplitude, 'px', blend);
      set(el, '--picture-scale', 1.04 - travel * 0.04, '', blend);
    });

    // Four textual chapters drive one continuous, clearly decorative spatial model.
    let progress = 0;
    steps.forEach((el, i) => {
      const r = stepRects[i];
      const p = clamp((h * 0.65 - r.top) / Math.max(1, r.height));
      progress += p / steps.length;
      set(el, '--step-progress', p, '', blend);
    });
    if (processRect.top < h && processRect.bottom > 0) {
      set(process, '--process-progress', progress, '', blend);
      set(process, '--form-turn', -28 + progress * 100, 'deg', blend);
      set(process, '--plane-one', 8 + progress * 18, 'px', blend);
      set(process, '--plane-two', 12 + progress * 57, 'px', blend);
      set(process, '--plane-three', 16 + progress * 96, 'px', blend);
      const label = phaseNames[Math.min(3, Math.floor(progress * 4))];
      if (phase.textContent !== label) phase.textContent = label;
    }
    facts.forEach((el, i) => {
      // Subtract our transform so movement cannot feed back into its own target.
      const offset = state.get(el)?.get('--fact-y') || 0;
      const p = clamp((h * 0.94 - (factRects[i].top - offset)) / (h * 0.48));
      set(el, '--fact-y', (1 - p) * (26 + i * 24) * amplitude, 'px', blend);
    });
    const end = clamp((h - contactRect.top) / Math.max(1, h * 0.8));
    set(contact, '--contact-x', (1 - end) * -35 * amplitude, 'px', blend);
    set(contact, '--contact-turn', (1 - end) * -35, 'deg', blend);
    if (running) schedule();
  }

  function configure() {
    enabled = !preference.matches;
    root.classList.toggle('home-motion', enabled);
    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      state.forEach((values, el) => values.forEach((_, name) => el.style.removeProperty(name)));
      state.clear();
      phase.textContent = phaseNames[0];
    }
    lastTime = 0;
    schedule();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('portfolio:entered', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else schedule();
  });
  preference.addEventListener('change', configure);
  stackQuery.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    observer = new ResizeObserver(schedule);
    // Includes changes above this section, such as the hero becoming ready.
    observer.observe(document.body);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  configure();
})();
