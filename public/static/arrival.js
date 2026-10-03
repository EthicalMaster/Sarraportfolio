/* Entry preparation, not a download-percentage estimate for the entire site.
 * Only the opening viewport is gated; offscreen images remain lazy.
 * Native media buffering avoids a second fetch and a large in-memory blob.
 */
(function () {
  'use strict';
  function start() {
    const root = document.documentElement;
    const overlay = document.querySelector('[data-arrival]');
    if (!overlay) return;
    const active = root.classList.contains('is-loading');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const video = document.querySelector('[data-hero-video]');
    const limited = reduced || navigator.connection?.saveData || (!active && !!video);
    const number = overlay.querySelector('[data-arrival-number]');
    const bar = overlay.querySelector('[data-arrival-progress]');
    const status = overlay.querySelector('[data-arrival-status]');
    const skip = overlay.querySelector('[data-arrival-skip]');
    const stages = { app: 0, fonts: 0, images: 0, video: video && !limited ? 0 : 1 };
    let restored = false;
    let done = false, shown = 0, target = 0, raf = 0, previous = 0;
    let timeout, poll, leaveTimer;
    const disposers = [];
    const background = active ? Array.from(document.body.children).filter(el => el !== overlay && !el.inert && !['SCRIPT', 'STYLE'].includes(el.tagName)) : [];
    background.forEach(el => { el.inert = true; el.setAttribute('data-loader-inert', ''); });
    if (active) skip.focus({ preventScroll: true });
    function listen(el, name, fn) {
      el.addEventListener(name, fn);
      disposers.push(() => el.removeEventListener(name, fn));
    }
    function restore() {
      if (restored) return;
      restored = true;
      clearTimeout(leaveTimer);
      cancelAnimationFrame(raf);
      const focused = overlay.contains(document.activeElement);
      root.classList.remove('is-loading');
      background.forEach(el => { el.inert = false; el.removeAttribute('data-loader-inert'); });
      overlay.remove();
      if (focused) {
        const main = document.getElementById('content');
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
      window.dispatchEvent(new Event('portfolio:entered'));
    }
    function staticHero() {
      if (!video || video.dataset.prepared === 'true') return;
      video.pause();
      video.removeAttribute('src');
      video.load(); // Cancel remaining media transfer; retain the lightweight poster.
    }
    function finish(fallback) {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      clearInterval(poll);
      disposers.forEach(dispose => dispose());
      if (fallback) staticHero();
      try { sessionStorage.setItem('sarra-entered', '1'); } catch (_) { /* Storage can be unavailable. */ }
      if (!active) { restore(); return; }
      status.textContent = fallback && video && video.dataset.prepared !== 'true'
        ? 'Opening with a still image' : 'Ready to explore';
      // 100 means preparation is resolved, including an intentional fallback.
      target = 100;
      leaveTimer = setTimeout(restore, reduced ? 0 : 650);
    }
    function paint(now) {
      const dt = Math.min(64, previous ? now - previous : 16);
      previous = now;
      shown = reduced ? target : shown + (target - shown) * (1 - Math.exp(-dt / 80));
      if (target - shown < 0.5) shown = target;
      const value = Math.floor(shown);
      number.textContent = String(value);
      bar.setAttribute('aria-valuenow', String(value));
      overlay.style.setProperty('--arrival-progress', String(shown / 100));
      if (done && value === 100) overlay.classList.add('arrival--ready');
      raf = requestAnimationFrame(paint);
    }
    function update() {
      if (done) return;
      // Deliberate preparation weights, not fabricated elapsed-time progress.
      target = Math.max(target, Math.min(99, 10 * stages.app + 10 * stages.fonts + 10 * stages.images + 70 * stages.video));
      status.textContent = !stages.app ? 'Preparing the space'
        : !stages.fonts ? 'Setting the typography'
        : !stages.images ? 'Bringing the first view into focus'
        : stages.video < 1 ? 'Preparing light and motion' : 'Ready to explore';
      if (Object.values(stages).every(value => value === 1)) finish(false);
    }
    function mediaProgress() {
      if (done || !video || limited || !Number.isFinite(video.duration) || video.duration <= 0) return;
      let buffered = 0;
      for (let i = 0; i < video.buffered.length; i++) buffered += video.buffered.end(i) - video.buffered.start(i);
      stages.video = Math.min(0.99, buffered / video.duration);
      // Seeking anywhere in the sequence needs the full contiguous timeline.
      if (video.readyState >= 2 && video.buffered.length === 1 && video.buffered.start(0) < 0.05 && video.buffered.end(0) >= video.duration - 0.05) {
        stages.video = 1;
        video.dataset.prepared = 'true';
        video.dispatchEvent(new Event('portfolio:video-ready'));
      }
      update();
    }
    listen(window, 'portfolio:app-ready', () => { stages.app = 1; update(); });
    listen(window, 'portfolio:skip', () => finish(true));
    listen(window, 'pagehide', () => { finish(true); restore(); });
    listen(skip, 'click', () => finish(true));
    listen(overlay, 'keydown', event => {
      if (event.key === 'Escape') finish(true);
      if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
    });
    if (root.classList.contains('js-ready')) stages.app = 1;
    // Fallback fonts are acceptable after 1.5s; never gate on Google indefinitely.
    Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1500))])
      .then(() => { stages.fonts = 1; update(); });
    const images = Array.from(document.images).filter(img => {
      const rect = img.getBoundingClientRect();
      return img.loading !== 'lazy' && rect.top < innerHeight && rect.bottom > 0;
    });
    Promise.all(images.map(img => new Promise(resolve => {
      const decode = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(resolve);
      if (img.complete) decode();
      else { listen(img, 'load', decode); listen(img, 'error', resolve); }
    }))).then(() => { stages.images = 1; update(); });
    timeout = setTimeout(() => finish(true), 6000);
    if (active) raf = requestAnimationFrame(paint);
    if (video && !limited) {
      ['progress', 'loadeddata', 'canplaythrough', 'durationchange'].forEach(name => listen(video, name, mediaProgress));
      listen(video, 'error', () => { staticHero(); stages.video = 1; update(); });
      video.preload = 'auto';
      video.src = video.dataset.src;
      video.load();
      poll = setInterval(mediaProgress, 200);
      mediaProgress();
    }
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
