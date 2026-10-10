/* ==========================================================================
   SARRA SAIFEE — client runtime
   Progressive enhancement only. The site is fully readable without JS.
   Modules:
     1. Generative placeholder imagery (lightweight SVG "architectural" renders)
     2. Reveal / scroll-driven motion (IntersectionObserver + rAF parallax)
     3. Navigation (hide-on-scroll, mobile menu)
     4. Work filtering
     5. Lightbox gallery
   ========================================================================== */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * 1. GENERATIVE PLACEHOLDER IMAGERY
   * ------------------------------------------------------------------ *
   * Instead of shipping heavy JPGs, each placeholder is an inline SVG
   * data-URI that suggests an architectural photograph/render: layered
   * planes, an implied light source, a horizon, and soft grain. This is
   * a few hundred bytes, loads instantly, and never causes layout shift.
   * Real imagery can later replace these by swapping the `src` in data.
   * ------------------------------------------------------------------ */

  // deterministic hash so the same seed always yields the same image
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }
  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Warm architectural palettes keyed loosely by seed.
  // [0]=deep shadow  [1]=mid-dark  [2]=mid  [3]=warm light  [4]=highlight
  const PALETTES = [
    ['#17140f', '#2c261d', '#5a4e3c', '#a8906c', '#e9dcc4'], // warm stone / travertine
    ['#12141a', '#23292f', '#48525c', '#8792a0', '#d3dae2'], // cool concrete / dusk
    ['#1a130c', '#3b2b1a', '#77593a', '#bb8f5e', '#eed7ac'], // timber / golden hour
    ['#141310', '#2a2721', '#575043', '#9a8f78', '#e2d7c1'], // neutral plaster
    ['#0f1412', '#1f2a26', '#415049', '#7d9184', '#cfdad1'], // sage / patina
  ];

  const F = (n) => n.toFixed(2);

  /**
   * svgFor — generates a cinematic architectural scene as an inline SVG.
   * Two archetypes chosen by seed:
   *   'interior' — one-point perspective room: receding floor grid, side walls,
   *                a bright back opening (window/door) as the light source.
   *   'exterior' — layered building masses with atmospheric perspective,
   *                a low sun, long shadows and a horizon.
   * Both share: soft graded sky/ground, volumetric light wash, fine grain,
   * and a subtle vignette for depth. Deterministic per seed+variant.
   */
  function svgFor(seed, variant, w, h) {
    const rnd = mulberry(hash(seed + '|' + variant));
    const pal = PALETTES[hash(seed) % PALETTES.length];
    const interior = rnd() > 0.42;
    const uid = (hash(seed + variant) % 100000).toString(36);
    // vanishing point / light origin
    const vpx = 34 + rnd() * 32;
    const vpy = 40 + rnd() * 18;

    const defs =
`<linearGradient id='sky${uid}' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='${pal[4]}'/><stop offset='0.6' stop-color='${pal[3]}'/><stop offset='1' stop-color='${pal[2]}'/>
</linearGradient>
<linearGradient id='grd${uid}' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='${pal[2]}'/><stop offset='1' stop-color='${pal[0]}'/>
</linearGradient>
<radialGradient id='sun${uid}' cx='${F(vpx)}%' cy='${F(vpy)}%' r='75%'>
<stop offset='0' stop-color='${pal[4]}' stop-opacity='0.95'/>
<stop offset='0.4' stop-color='${pal[3]}' stop-opacity='0.28'/>
<stop offset='1' stop-color='${pal[0]}' stop-opacity='0'/>
</radialGradient>
<radialGradient id='vig${uid}' cx='50%' cy='46%' r='72%'>
<stop offset='0.55' stop-color='#000' stop-opacity='0'/>
<stop offset='1' stop-color='#000' stop-opacity='0.5'/>
</radialGradient>`;

    let body = '';

    if (interior) {
      // ---- ONE-POINT PERSPECTIVE ROOM ----
      const openW = 16 + rnd() * 16;       // back opening (light) half-width
      const openTop = 20 + rnd() * 14;
      const openBot = 66 + rnd() * 8;
      const ox1 = vpx - openW / 2, ox2 = vpx + openW / 2;
      // back wall + bright opening
      body += `<rect width='100' height='100' fill='${pal[1]}'/>`;
      body += `<rect x='${F(ox1)}' y='${F(openTop)}' width='${F(openW)}' height='${F(openBot - openTop)}' fill='url(#sky${uid})'/>`;
      // side walls (converging quads to vanishing point)
      body += `<polygon points='0,0 ${F(ox1)},${F(openTop)} ${F(ox1)},${F(openBot)} 0,100' fill='${pal[0]}' opacity='0.9'/>`;
      body += `<polygon points='100,0 ${F(ox2)},${F(openTop)} ${F(ox2)},${F(openBot)} 100,100' fill='${pal[0]}' opacity='0.78'/>`;
      // ceiling + floor planes
      body += `<polygon points='0,0 100,0 ${F(ox2)},${F(openTop)} ${F(ox1)},${F(openTop)}' fill='${pal[1]}' opacity='0.85'/>`;
      body += `<polygon points='0,100 100,100 ${F(ox2)},${F(openBot)} ${F(ox1)},${F(openBot)}' fill='url(#grd${uid})'/>`;
      // receding floor grid lines (toward VP)
      for (let i = 1; i <= 5; i++) {
        const t = i / 6;
        const xl = 0 + (ox1 - 0) * t, xr = 100 + (ox2 - 100) * t;
        const y = 100 + (openBot - 100) * t;
        body += `<line x1='${F(xl)}' y1='${F(y)}' x2='${F(xr)}' y2='${F(y)}' stroke='${pal[3]}' stroke-width='0.18' opacity='${F(0.28 - i * 0.03)}'/>`;
      }
      for (let i = 0; i <= 6; i++) {
        const fx = i / 6;
        const bx = ox1 + openW * fx;
        const px = fx * 100;
        body += `<line x1='${F(px)}' y1='100' x2='${F(bx)}' y2='${F(openBot)}' stroke='${pal[3]}' stroke-width='0.15' opacity='0.14'/>`;
      }
      // window mullions across the opening
      const mull = 2 + Math.floor(rnd() * 3);
      for (let m = 1; m < mull; m++) {
        const mx = ox1 + (openW * m) / mull;
        body += `<line x1='${F(mx)}' y1='${F(openTop)}' x2='${F(mx)}' y2='${F(openBot)}' stroke='${pal[0]}' stroke-width='0.4' opacity='0.6'/>`;
      }
      body += `<line x1='${F(ox1)}' y1='${F(openTop + (openBot - openTop) * 0.5)}' x2='${F(ox2)}' y2='${F(openTop + (openBot - openTop) * 0.5)}' stroke='${pal[0]}' stroke-width='0.4' opacity='0.5'/>`;
      // light spill onto floor
      body += `<polygon points='${F(ox1)},${F(openBot)} ${F(ox2)},${F(openBot)} ${F(vpx + openW * 0.9)},100 ${F(vpx - openW * 0.9)},100' fill='${pal[4]}' opacity='0.10'/>`;
    } else {
      // ---- EXTERIOR: LAYERED MASSES + ATMOSPHERE ----
      const horizon = 52 + rnd() * 16;
      body += `<rect width='100' height='100' fill='${pal[1]}'/>`;
      body += `<rect width='100' height='${F(horizon)}' fill='url(#sky${uid})'/>`;
      body += `<rect y='${F(horizon)}' width='100' height='${F(100 - horizon)}' fill='url(#grd${uid})'/>`;
      // 3 receding tonal bands (atmospheric perspective) behind masses
      for (let b = 0; b < 3; b++) {
        const by = horizon - 4 - b * 5;
        body += `<rect y='${F(by)}' width='100' height='6' fill='${pal[2]}' opacity='${F(0.1 + b * 0.05)}'/>`;
      }
      // building volumes, larger toward foreground
      const masses = 4 + Math.floor(rnd() * 3);
      for (let i = 0; i < masses; i++) {
        const depth = i / masses;               // 0 far → 1 near
        const bw = 10 + rnd() * 22 + depth * 12;
        const x = rnd() * (100 - bw);
        const top = horizon - (10 + rnd() * 34 + depth * 18);
        const shade = pal[1 + Math.floor(rnd() * 2 + depth)];
        const op = F(0.55 + depth * 0.4);
        body += `<rect x='${F(x)}' y='${F(top)}' width='${F(bw)}' height='${F(horizon - top + 4)}' fill='${shade}' opacity='${op}'/>`;
        // window grid on facade
        const cols = 2 + Math.floor(rnd() * 3), rows = 2 + Math.floor(rnd() * 4);
        for (let cx = 1; cx < cols; cx++) {
          const lx = x + (bw * cx) / cols;
          body += `<line x1='${F(lx)}' y1='${F(top)}' x2='${F(lx)}' y2='${F(horizon)}' stroke='${pal[0]}' stroke-width='0.2' opacity='0.45'/>`;
        }
        for (let ry = 1; ry < rows; ry++) {
          const ly = top + ((horizon - top) * ry) / rows;
          body += `<line x1='${F(x)}' y1='${F(ly)}' x2='${F(x + bw)}' y2='${F(ly)}' stroke='${pal[0]}' stroke-width='0.2' opacity='0.35'/>`;
        }
        // lit edge facing the sun
        body += `<rect x='${F(x)}' y='${F(top)}' width='0.6' height='${F(horizon - top + 4)}' fill='${pal[4]}' opacity='${F(0.2 + depth * 0.3)}'/>`;
      }
      // long ground reflection of the light
      body += `<ellipse cx='${F(vpx)}' cy='${F(horizon + (100 - horizon) * 0.4)}' rx='${F(30)}' ry='${F(8)}' fill='${pal[4]}' opacity='0.08'/>`;
    }

    // shared: volumetric light wash + vignette + grain
    body += `<rect width='100' height='100' fill='url(#sun${uid})'/>`;
    body += `<rect width='100' height='100' fill='url(#vig${uid})'/>`;

    return (
`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid slice' width='${w}' height='${h}'>
<defs>${defs}</defs>
${body}
</svg>`
    );
  }

  function resolvePlaceholder(el) {
    // data-ph="seed|variant"
    const key = el.getAttribute('data-ph');
    if (!key) return;
    const [seed, variant] = key.split('|');
    const w = 20, h = 20; // tiny intrinsic; CSS scales it — crisp because vector
    const svg = svgFor(seed || 'x', variant || 'a', w, h);
    el.style.backgroundImage = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(svg) + "\")";
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.classList.add('ph--ready');
  }

  // Lazy-generate placeholders as they approach viewport
  const phObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { resolvePlaceholder(e.target); obs.unobserve(e.target); }
        });
      }, { rootMargin: '300px 0px' })
    : null;

  function initPlaceholders() {
    document.querySelectorAll('.ph').forEach((el) => {
      // Eager for the hero / above-the-fold; lazy for the rest
      if (el.hasAttribute('data-eager') || !phObserver) resolvePlaceholder(el);
      else phObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. REVEAL + SCROLL MOTION
   * ------------------------------------------------------------------ */
  function initReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal], [data-clip], .line'));
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    items.forEach((el) => io.observe(el));

    // Resilience: if anything hasn't revealed after being scrolled past
    // (e.g. observer edge-cases with absolutely-positioned/clipped frames),
    // force-reveal on scroll once its top passes 85% of the viewport.
    function sweep() {
      const h = window.innerHeight;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = items[i];
        if (el.classList.contains('is-in')) { items.splice(i, 1); continue; }
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.9 && r.bottom > 0) el.classList.add('is-in');
      }
      if (!items.length) window.removeEventListener('scroll', onScroll);
    }
    let ticking = false;
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; sweep(); }); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial sweep after layout settles (covers above-the-fold clipped frames)
    requestAnimationFrame(() => requestAnimationFrame(sweep));
    setTimeout(sweep, 400);
  }

  // rAF-driven parallax — depth without scroll hijacking
  function initParallax() {
    if (REDUCED) return;
    const layers = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!layers.length) return;
    let ticking = false;
    const vh = () => window.innerHeight;

    function update() {
      ticking = false;
      const center = window.scrollY + vh() / 2;
      for (const el of layers) {
        const rect = el.getBoundingClientRect();
        const mid = window.scrollY + rect.top + rect.height / 2;
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        const delta = (center - mid) * speed;
        el.style.transform = 'translate3d(0,' + delta.toFixed(2) + 'px,0)';
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Hero: cinematic forward-drift on scroll — light and material emerge as
  // you enter the space; the headline drifts up and fades; the technical
  // strip and scroll hint fade out. Normal scroll, no hijack.
  // Updated to calculate progress relative to the hero-video-wrap.
  function initHeroDrift() {
    if (REDUCED) return;
    const media = document.querySelector('[data-hero-media]');
    const title = document.querySelector('[data-hero-title]');
    const fades = Array.from(document.querySelectorAll('[data-hero-fade]'));
    const wrap = document.querySelector('[data-hero-video-wrap]');
    const hero = media ? media.closest('.hero') : null;
    if (!media || !hero) return;
    let ticking = false;
    function update() {
      ticking = false;
      // Use scroll position relative to the wrapper top for consistent behaviour
      const wrapTop = wrap ? wrap.getBoundingClientRect().top : 0;
      const y = wrap ? Math.max(0, -wrapTop) : window.scrollY;
      const vh = window.innerHeight || 800;
      const p = Math.min(1, y / vh);
      // ease the progress for a filmic feel
      const e = p * p * (3 - 2 * p);
      media.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0) scale(' + (1 + e * 0.16).toFixed(3) + ')';
      const runway = wrap ? Math.max(1, wrap.offsetHeight - hero.offsetHeight) : vh;
      const sequence = Math.min(1, y / runway);
      const exit = wrap && !wrap.classList.contains("hero-video-wrap--static") ? Math.max(0, Math.min(1, (sequence - 0.82) / 0.18)) : 0;
      const framed = exit * exit * (3 - 2 * exit);
      hero.style.clipPath = "inset(" + (framed * 3).toFixed(2) + "% " + (1 + framed * 4).toFixed(2) + "% round " + (12 + framed * 12).toFixed(1) + "px)";
      // Most exposure opens as the text leaves; the final lift follows the
      // building sequence. Reverse scrolling restores the exact opening state.
      hero.style.setProperty('--hero-brightness', (0.82 + e * 0.13 + sequence * 0.05).toFixed(3));
      hero.style.setProperty('--hero-saturation', (0.96 + e * 0.04).toFixed(3));
      hero.style.setProperty('--hero-scrim-opacity', (1 - e * 0.68).toFixed(3));
      if (title) {
        title.style.transform = 'translate3d(0,' + (y * -0.06).toFixed(1) + 'px,0)';
        title.style.opacity = String(Math.max(0, 1 - e * 1.15));
      }
      const fadeOpacity = String(Math.max(0, 1 - p * 2.2));
      for (const f of fades) f.style.opacity = fadeOpacity;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ *
   * HERO VIDEO SCROLL-SCRUB
   * Maps the hero wrapper's scroll range to video.currentTime.
   * Completely isolated — only operates within [data-hero-video-wrap].
   * Does NOT affect any other scroll interaction on the page.
   * ------------------------------------------------------------------ */
  function initHeroVideo() {
    const video = document.querySelector('[data-hero-video]');
    const wrap = document.querySelector('[data-hero-video-wrap]');
    const hero = wrap ? wrap.querySelector('.hero') : null;
    if (!video || !wrap || !hero) return;

    video.pause();
    video.muted = true;
    let ready = false;
    let target = 0;
    let frame = 0;
    let lastTick = 0;
    // Match the 24 fps source; avoid requesting invisible sub-frame seeks.
    const frameDuration = 1 / 24;
    const settleThreshold = frameDuration / 4;

    function schedule() {
      if (!frame && ready && !REDUCED && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    }

    function measure() {
      if (!ready || REDUCED) return;
      const rect = wrap.getBoundingClientRect();
      const range = Math.max(1, rect.height - hero.offsetHeight);
      // Complete the film before the final framing transition.
      const progress = Math.min(1, Math.max(0, -rect.top / (range * 0.82)));
      target = progress * Math.max(0, video.duration - frameDuration);
      schedule();
    }

    function tick(now) {
      frame = 0;
      // Wait for the decoder before requesting another frame. Never queue
      // competing seeks, including when the user reverses direction.
      if (video.seeking) return;
      const delta = target - video.currentTime;
      if (Math.abs(delta) <= settleThreshold) {
        lastTick = 0;
        return;
      }
      const dt = lastTick ? Math.min(64, now - lastTick) : 1000 / 60;
      lastTick = now;
      // Time-based easing turns discrete wheel steps into a short glide.
      // It keeps settling after scrolling stops and works in both directions.
      const next = Math.abs(delta) < frameDuration
        ? target
        : video.currentTime + delta * (1 - Math.exp(-dt / 110));
      video.currentTime = next;
    }

    video.addEventListener('seeked', schedule);
    function markReady() {
      // Metadata alone does not mean a frame is available to display.
      if (ready || video.dataset.prepared !== 'true' || video.readyState < 2 || !Number.isFinite(video.duration) || video.duration <= 0) return;
      // A background download must not expand the hero above someone reading below it.
      // Activate the long scroll sequence when they return to the top.
      if (wrap.getBoundingClientRect().top < -32) return;
      ready = true;
      hero.classList.add('hero--video-ready');
      wrap.classList.remove('hero-video-wrap--static');
      measure();
    }
    video.addEventListener('portfolio:video-ready', markReady);
    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('error', () => {
      ready = false;
      cancelAnimationFrame(frame);
      frame = 0;
      hero.classList.remove('hero--video-ready');
      wrap.classList.add('hero-video-wrap--static');
    });
    function refreshVideo() { markReady(); measure(); }
    window.addEventListener('scroll', refreshVideo, { passive: true });
    window.addEventListener('resize', refreshVideo, { passive: true });
    window.addEventListener('pageshow', refreshVideo);
    window.addEventListener('portfolio:entered', refreshVideo);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
      if (!document.hidden) measure();
    });
    markReady();
  }

  // Featured scenes: each project image scales subtly as it travels through
  // the viewport (spatial "moving through the work"). GPU transform only.
  function initScenes() {
    if (REDUCED) return;
    const imgs = Array.from(document.querySelectorAll('[data-scene-media]'));
    if (!imgs.length) return;
    let ticking = false;
    const vh = () => window.innerHeight || 800;
    function update() {
      ticking = false;
      const h = vh();
      for (const el of imgs) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) continue;
        // progress: -1 (entering below) → 0 (centered) → 1 (leaving above)
        const center = r.top + r.height / 2;
        const prog = (center - h / 2) / h; // ~ -0.8..0.8
        const scale = 1.06 + Math.max(0, 0.06 - Math.abs(prog) * 0.06);
        const shift = (prog * -3).toFixed(2);
        const inner = el.querySelector('.ph, img');
        if (inner) inner.style.transform = 'translate3d(0,' + shift + '%,0) scale(' + scale.toFixed(3) + ')';
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------ *
   * SIGNATURE INTERACTION — pinned horizontal index
   * The section is tall; an inner sticky viewport pins while the track
   * pans horizontally in proportion to vertical scroll progress. Below
   * the desktop breakpoint (or reduced-motion) it falls back to a native
   * horizontal scroll-snap strip — no pin, fully usable by touch.
   * ------------------------------------------------------------------ */
  function initIndex() {
    const section = document.querySelector('[data-index]');
    const track = document.querySelector('[data-index-track]');
    const bar = document.querySelector('[data-index-bar]');
    if (!section || !track) return;

    const mq = window.matchMedia('(min-width: 900px)');
    let enabled = false;
    let travel = 0;

    function measure() {
      // total horizontal overflow to pan through
      travel = Math.max(0, track.scrollWidth - track.clientWidth);
      // Set the section height so the pin lasts long enough to pan fully.
      // Height = one viewport (the pinned frame) + the horizontal travel.
      if (enabled) {
        section.style.height = (window.innerHeight + travel) + 'px';
      } else {
        section.style.height = '';
      }
    }

    let ticking = false;
    function update() {
      ticking = false;
      if (!enabled) { track.style.transform = ''; return; }
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // progress 0..1 while the section is pinned
      const p = Math.min(1, Math.max(0, -rect.top / (total || 1)));
      const x = -(p * travel);
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    function setMode() {
      enabled = mq.matches && !REDUCED;
      section.classList.toggle('is-pinned', enabled);
      track.style.transform = '';
      measure();
      update();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', setMode);
    // Re-measure once placeholders/fonts settle
    setTimeout(() => { measure(); update(); }, 500);
    setMode();
  }

  /* ------------------------------------------------------------------ *
   * 3. NAVIGATION
   * ------------------------------------------------------------------ */
  function updateNavigationState() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    const detail = path.startsWith('/work/');
    const current = detail ? '/work' : path;
    document.querySelectorAll('.nav__links a, [data-mnav] a').forEach((link) => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', detail ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function initNav() {
    updateNavigationState();
    window.addEventListener('popstate', updateNavigationState);
    const nav = document.querySelector('[data-nav]');
    if (nav && !REDUCED) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('is-compact', y > 80);
      }, { passive: true });
      nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
    }
    const toggle = document.querySelector('[data-mnav-toggle]');
    const mnav = document.querySelector('[data-mnav]');
    if (!toggle || !mnav) return;
    const mobile = window.matchMedia('(max-width: 860px)');
    const links = Array.from(mnav.querySelectorAll('a'));
    const background = Array.from(document.querySelectorAll('main, footer, .nav__brand, .nav__links'));
    let open = false;
    let previousOverflow = '';
    let previousInert = [];

    function setOpen(next, restoreFocus = true) {
      if (next === open) return;
      open = next;
      if (open) {
        previousOverflow = document.documentElement.style.overflow;
        previousInert = background.map((element) => element.inert);
        background.forEach((element) => { element.inert = true; });
      } else {
        background.forEach((element, index) => { element.inert = previousInert[index]; });
      }
      mnav.inert = !open;
      document.body.classList.toggle('mnav-open', open);
      mnav.classList.toggle('is-open', open);
      nav?.classList.remove('is-hidden');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.documentElement.style.overflow = open ? 'hidden' : previousOverflow;
      if (open) links[0]?.focus();
      else if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => setOpen(!open));
    links.forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === 'Tab') {
        const controls = [toggle, ...links];
        const index = controls.indexOf(document.activeElement);
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          controls[controls.length - 1].focus();
        } else if (!event.shiftKey && (index === controls.length - 1 || index === -1)) {
          event.preventDefault();
          toggle.focus();
        }
      }
    });
    mobile.addEventListener('change', () => {
      if (!mobile.matches && open) {
        setOpen(false, false);
        nav?.querySelector('.nav__brand')?.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. WORK FILTERING
   * ------------------------------------------------------------------ */
  function initFilters() {
    const bar = document.querySelector('[data-filters]');
    const grid = document.querySelector('[data-grid]');
    if (!bar || !grid) return;
    const cards = Array.from(grid.querySelectorAll('.card'));

    const buttons = Array.from(bar.querySelectorAll('button[data-filter-type]'));
    const count = document.querySelector('[data-results-count]');
    const empty = document.querySelector('[data-filter-empty]');
    const reset = document.querySelector('[data-filter-reset]');
    let selected = { discipline: 'all', track: 'all' };

    function apply(filters) {
      // Unknown URL values fall back to the corresponding unfiltered group.
      for (const type of ['discipline', 'track']) {
        selected[type] = buttons.some((button) =>
          button.dataset.filterType === type && button.dataset.filterValue === filters[type]
        ) ? filters[type] : 'all';
      }
      let visible = 0;
      cards.forEach((card) => {
        const matches = (selected.discipline === 'all' || card.dataset.discipline === selected.discipline)
          && (selected.track === 'all' || card.dataset.track === selected.track);
        card.classList.toggle('is-filtered', !matches);
        if (matches) visible += 1;
      });
      buttons.forEach((button) => {
        const active = selected[button.dataset.filterType] === button.dataset.filterValue;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (count) count.textContent = visible === cards.length
        ? `${visible} projects` : `${visible} of ${cards.length} projects`;
      if (empty) empty.hidden = visible !== 0;
      const url = new URL(location.href);
      for (const type of ['discipline', 'track']) {
        if (selected[type] === 'all') url.searchParams.delete(type);
        else url.searchParams.set(type, selected[type]);
      }
      history.replaceState(null, '', url);
      updateNavigationState();
    }

    buttons.forEach((button) => button.addEventListener('click', () => {
      apply({ ...selected, [button.dataset.filterType]: button.dataset.filterValue });
    }));
    reset?.addEventListener('click', () => {
      apply({ discipline: 'all', track: 'all' });
      // The reset button is now hidden; return focus to a visible control.
      buttons[0]?.focus();
    });
    function applyUrl() {
      const params = new URLSearchParams(location.search);
      apply({ discipline: params.get('discipline'), track: params.get('track') });
    }
    window.addEventListener('popstate', applyUrl);
    applyUrl();
  }

  /* ------------------------------------------------------------------ *
   * 5. LIGHTBOX — native dialog supplies modal focus containment and Escape.
   * ------------------------------------------------------------------ */
  function initLightbox() {
    const items = [...document.querySelectorAll('[data-lightbox]')];
    if (!items.length) return;
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Project image viewer');
    box.innerHTML = '<button type="button" class="lightbox__close" aria-label="Close image viewer">Close ✕</button><div class="lightbox__stage"></div><div class="lightbox__toolbar"><button type="button" data-previous aria-label="Previous image">←</button><div class="lightbox__info" aria-live="polite"><span data-count></span><span class="lightbox__caption"></span></div><button type="button" data-next aria-label="Next image">→</button></div>';
    document.body.appendChild(box);
    const stage = box.querySelector('.lightbox__stage');
    const closeButton = box.querySelector('.lightbox__close');
    let opener = null, previousOverflow = '', current = 0;
    function render(index) {
      current = (index + items.length) % items.length;
      const item = items[current], image = document.createElement('div');
      image.className = 'ph';
      const parts = (item.getAttribute('data-ratio') || '3 / 2').split('/').map(Number);
      const ratio = parts.length === 2 ? parts[0] / parts[1] : parts[0];
      image.style.setProperty('--image-ratio', String(Number.isFinite(ratio) && ratio > 0 ? ratio : 1.5));
      image.setAttribute('data-ph', item.getAttribute('data-ph'));
      image.setAttribute('role', 'img');
      image.setAttribute('aria-label', item.getAttribute('data-image-alt') || 'Project image');
      stage.replaceChildren(image);
      resolvePlaceholder(image);
      box.querySelector('[data-count]').textContent = `${current + 1} / ${items.length}`;
      box.querySelector('.lightbox__caption').textContent = item.getAttribute('data-image-alt') || 'Project image';
    }
    box.addEventListener('close', () => {
      box.classList.remove('is-open');
      document.documentElement.style.overflow = previousOverflow;
      stage.replaceChildren();
      opener?.focus({ preventScroll: true });
      opener = null;
    });
    closeButton.addEventListener('click', () => box.close());
    box.addEventListener('click', event => { if(event.target === box) box.close(); });
    box.querySelector('[data-previous]').addEventListener('click', () => render(current - 1));
    box.querySelector('[data-next]').addEventListener('click', () => render(current + 1));
    box.addEventListener('keydown', event => {if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){event.preventDefault();render(current + (event.key === 'ArrowLeft' ? -1 : 1));}});
    let touch = null;
    stage.addEventListener('touchstart', event => {touch=event.touches.length===1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;},{passive:true});
    stage.addEventListener('touchend', event => {if(!touch)return;const dx=event.changedTouches[0].clientX-touch.x,dy=event.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5)render(current+(dx<0?1:-1));touch=null;},{passive:true});
    stage.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
    items.forEach((item,index) => item.addEventListener('click', () => {
      if (box.open) return;
      opener = item;
      previousOverflow = document.documentElement.style.overflow;
      render(index);
      box.classList.add('is-open');box.showModal();
      document.documentElement.style.overflow = 'hidden';closeButton.focus();
    }));
  }

  /* ------------------------------------------------------------------ *
   * BACK TO TOP — smooth (respects reduced-motion)
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    const link = document.querySelector('[data-backtotop]');
    if (!link) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ */
  function boot() {
    initPlaceholders();
    if (document.documentElement.classList.contains('is-loading')) {
      window.addEventListener('portfolio:entered', initReveal, { once: true });
    } else initReveal();
    initParallax();
    initHeroDrift();
    initHeroVideo();
    initScenes();
    initIndex();
    initNav();
    initFilters();
    initLightbox();
    initBackToTop();
    document.documentElement.classList.add('js-ready');
    window.dispatchEvent(new Event('portfolio:app-ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
