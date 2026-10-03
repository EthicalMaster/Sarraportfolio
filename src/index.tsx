import { Hono } from 'hono'
import { renderer } from './renderer'
import { Ph, FeaturedRow, WorkCard } from './components'
import { site, about } from './data/site'
import {
  allProjects,
  featuredProjects,
  projectBySlug,
  adjacentProjects,
} from './data/projects'
import type { Project } from './data/projects'

const app = new Hono()

app.use(renderer)

const pad = (n: number) => String(n).padStart(2, '0')

/* ==========================================================================
   HOME
   ========================================================================== */
app.get('/', (c) => {
  const featured = featuredProjects()
  const count = allProjects().length
  return c.render(
    <>
      {/* HERO — scroll-scrubbed architectural video experience.
          The wrapper provides vertical scroll distance for the video timeline.
          The hero pins (sticky) inside the wrapper while the video scrubs. */}
      <div class="hero-video-wrap hero-video-wrap--static" data-hero-video-wrap>
        <section class="hero" aria-label="Introduction">
          {/* Scroll-scrubbed video — the primary hero visual */}
          <div class="hero__video" data-hero-video-container>
            <video
              class="hero__video-el"
              data-hero-video
              data-src="/videos/architectural_hero_scrub.mp4"
              poster="/videos/architectural_hero_poster.jpg"
              muted
              playsinline
              preload="none"
              aria-hidden="true"
            ></video>
          </div>

          {/* Original placeholder image — fallback while video loads */}
          <div class="hero__media" data-hero-media>
            <img src="/videos/architectural_hero_poster.jpg" alt="Architectural site at sunset" width="1280" height="720" fetchpriority="high" decoding="async" />
          </div>
          <div class="hero__scrim" aria-hidden="true"></div>

          {/* Technical strip — coordinate / index line across the top of the frame */}
          <div class="hero__strip" data-hero-fade aria-hidden="true">
            <span>{site.location} · 55.6761°N</span>
            <span>Portfolio — {site.year}</span>
          </div>

          <div class="hero__inner">
            <div class="hero__lead" data-hero-title>
              <p class="hero__eyebrow line" data-reveal-delay="1">
                <span>Selected works in space, light &amp; material</span>
              </p>
              <h1 class="hero__title display">
                <span class="line" data-reveal-delay="1">
                  <span>Architecture</span>
                </span>
                <span class="line" data-reveal-delay="2">
                  <span>as a study of</span>
                </span>
                <span class="line hero__accent" data-reveal-delay="3">
                  <span>light.</span>
                </span>
              </h1>
              <a class="scene__cta hero__work-link" href="/work">Explore projects <span class="arrow" aria-hidden="true">→</span></a>
            </div>
            
          </div>

          <div class="hero__scroll" data-hero-fade aria-hidden="true">
            <span class="bar"></span>
            Scroll to enter
          </div>
        </section>
      </div>

      {/* STATEMENT — a still, generous moment; large editorial type */}
      <section class="statement section" aria-label="Studio statement">
        <div class="wrap">
          <p class="marker" data-reveal>
            <span class="idx">01</span> Practice
          </p>
          <div class="statement__grid">
            <p class="statement__lead" data-reveal data-reveal-delay="1">
              Buildings that are quiet, but precise.
            </p>
            <div class="statement__body" data-reveal data-reveal-delay="2">
              <p>
                A practice organised around a single idea, held clearly through structure, light and material. Each
                project begins in section — testing how a person moves through space, and how daylight changes across a
                day and a year.
              </p>
              <p class="mono statement__count">
                {count} selected works — {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE INTERACTION — a pinned horizontal "index".
          As you scroll vertically, the full portfolio pans horizontally:
          one elegant horizontal moment inside a vertical page. On mobile it
          degrades to a calm horizontal scroll-snap strip. */}
      <section class="index" aria-label="Portfolio index" data-index>
        <div class="index__sticky">
          <div class="wrap index__head">
            <p class="marker"><span class="idx">—</span> The full index</p>
            <div class="index__actions">
              <p class="index__hint mono" aria-hidden="true">Scroll →</p>
              <a class="scene__cta index__skip" href="#selected-work">Selected work <span class="arrow" aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div class="index__track" data-index-track>
            {allProjects().map((p: Project, i: number) => (
              <a class="index__item" href={`/work/${p.slug}`} aria-label={`View ${p.title}`}>
                <div class="index__media">
                  <Ph src={p.coverImage} alt={`${p.title} — ${p.category}`} />
                  <span class="index__no mono" aria-hidden="true">{pad(p.order)}</span>
                </div>
                <div class="index__meta">
                  <span class="index__name">{p.title}</span>
                  <span class="index__cat mono">{p.category}</span>
                </div>
              </a>
            ))}
          </div>
          <div class="index__progress" aria-hidden="true"><span data-index-bar></span></div>
        </div>
      </section>

      {/* FEATURED WORK — the heart: a cinematic scroll sequence */}
      <section class="work" id="selected-work" tabindex="-1" aria-label="Selected work" data-seq>
        <div class="wrap">
          <div class="work__head">
            <p class="marker" data-reveal>
              <span class="idx">02</span> Selected Work
            </p>
            <h2 class="work__title display" data-reveal data-reveal-delay="1">
              A sequence of<br />spaces.
            </h2>
          </div>
        </div>

        {featured.map((p, i) => (
          <FeaturedRow project={p} i={i} total={featured.length} />
        ))}

        <div class="wrap">
          <a class="work__all" href="/work" data-reveal>
            <span>View all {count} projects</span>
            <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>,
    { title: undefined, description: undefined },
  )
})

/* ==========================================================================
   WORK INDEX
   ========================================================================== */
app.get('/work', (c) => {
  const projects = allProjects()
  return c.render(
    <>
      <section class="phead" aria-label="Work index">
        <div class="wrap">
          <p class="marker" data-reveal>
            <span class="idx">—</span>
            <span>Portfolio · <span data-results-count role="status" aria-live="polite" aria-atomic="true">{projects.length} projects</span></span>
          </p>
          <h1 class="display" data-reveal data-reveal-delay="1" style="margin-top:var(--sp-3)">
            Work
          </h1>
          <p class="measure" data-reveal data-reveal-delay="2">
            A selection of architecture and interior projects across academic and professional work. Filter by
            discipline or track.
          </p>

          <div class="filters" data-filters aria-label="Filter projects">
            <button type="button" class="is-active" aria-pressed="true" data-filter-type="discipline" data-filter-value="all">All disciplines</button>
            <button type="button" aria-pressed="false" data-filter-type="discipline" data-filter-value="architecture">Architecture</button>
            <button type="button" aria-pressed="false" data-filter-type="discipline" data-filter-value="interior">Interior</button>
            <span style="width:1px;background:var(--line);margin:0 0.4rem"></span>
            <button type="button" class="is-active" aria-pressed="true" data-filter-type="track" data-filter-value="all">All tracks</button>
            <button type="button" aria-pressed="false" data-filter-type="track" data-filter-value="professional">Professional</button>
            <button type="button" aria-pressed="false" data-filter-type="track" data-filter-value="academic">Academic</button>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0" aria-label="Projects">
        <div class="wrap">
          <div class="work-empty" data-filter-empty hidden>
            <h2>No projects match these filters.</h2>
            <p>Try another discipline or track, or view all projects.</p>
            <button type="button" data-filter-reset>Reset filters</button>
          </div>
          <div class="grid" data-grid>
            {projects.map((p, i) => (
              <WorkCard project={p} wide={i % 5 === 0} />
            ))}
          </div>
        </div>
      </section>
    </>,
    { title: 'Work', description: 'Selected architecture and interior projects.' },
  )
})

/* ==========================================================================
   PROJECT DETAIL
   ========================================================================== */
app.get('/work/:slug', (c) => {
  const slug = c.req.param('slug')
  const project = projectBySlug(slug)
  if (!project) return c.notFound()
  const { prev, next } = adjacentProjects(slug)

  return c.render(
    <>
      <article aria-label={project.title}>
        {/* Persistent return control — always available near the top */}
        <div class="detail__back">
          <div class="wrap">
            <a class="backlink" href="/work">
              <span class="arrow" aria-hidden="true">←</span> Back to Projects
            </a>
          </div>
        </div>

        {/* HERO — spatial, cropping cover with an art-directed title block */}
        <section class="detail__hero">
          <div class="frame" data-hero-media>
            <Ph src={project.coverImage} alt={`${project.title} — cover`} eager ratio="16 / 9" />
          </div>
          <div class="scrim" aria-hidden="true"></div>
          <div class="detail__strip" aria-hidden="true">
            <span>{pad(project.order)} / {pad(allProjects().length)}</span>
            <span>{project.location}</span>
            <span>{project.year}</span>
          </div>
          <div class="detail__heroinfo">
            <div class="wrap" style="padding-inline:0">
              <p class="num line" data-reveal-delay="1">
                <span>{project.category}</span>
              </p>
              <h1 class="display">
                <span class="line" data-reveal-delay="1">
                  <span>{project.title}</span>
                </span>
              </h1>
            </div>
          </div>
        </section>

        <div class="wrap">
          {/* SPECS */}
          <div class="detail__specs">
            <div class="spec" data-reveal>
              <span>Year</span>
              <strong>{project.year}</strong>
            </div>
            <div class="spec" data-reveal data-reveal-delay="1">
              <span>Location</span>
              <strong>{project.location}</strong>
            </div>
            <div class="spec" data-reveal data-reveal-delay="2">
              <span>Discipline</span>
              <strong style="text-transform:capitalize">{project.discipline}</strong>
            </div>
            <div class="spec" data-reveal data-reveal-delay="3">
              <span>Track</span>
              <strong style="text-transform:capitalize">{project.track}</strong>
            </div>
          </div>

          {/* STATEMENT */}
          <div class="detail__statement">
            <p class="lead" data-reveal>
              {project.description}
            </p>
            <div class="body" data-reveal data-reveal-delay="1">
              <p style="margin-bottom:1.4rem">{project.statement}</p>
              {project.facts && (
                <dl style="display:grid;gap:0.6rem;border-top:1px solid var(--line);padding-top:1.4rem">
                  {project.facts.map((f) => (
                    <div style="display:flex;justify-content:space-between;gap:1rem;color:var(--text-lo);font-size:var(--step--1);letter-spacing:0.08em;text-transform:uppercase">
                      <dt>{f.label}</dt>
                      <dd style="color:var(--text-mid)">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>

          {/* GALLERY — editorial, data-driven spans */}
          <div class="gallery" aria-label="Project gallery">
            {project.gallery.map((g) => (
              <figure class="gitem" data-span={g.span || 'full'} data-reveal>
                <Ph
                  src={g.src}
                  alt={g.alt}
                  ratio={g.ratio}
                  clip
                  lightbox
                  parallax={g.span === 'full' ? 0.05 : 0}
                />
                {g.caption && <figcaption class="cap">{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>

        {/* PREV / NEXT — moving to the next space */}
        <nav class="pnav" aria-label="Project navigation">
          <a class="prev" href={`/work/${prev?.slug}`}>
            <p class="dir mono"><span class="arrow" aria-hidden="true">←</span> Previous</p>
            <p class="pnum mono">{prev ? pad(prev.order) : ''}</p>
            <p class="name display">{prev?.title}</p>
          </a>
          <a class="next" href={`/work/${next?.slug}`}>
            <p class="dir mono">Next <span class="arrow" aria-hidden="true">→</span></p>
            <p class="pnum mono">{next ? pad(next.order) : ''}</p>
            <p class="name display">{next?.title}</p>
          </a>
        </nav>
      </article>
    </>,
    { title: project.title, description: project.description },
  )
})

/* ==========================================================================
   ABOUT
   ========================================================================== */
app.get('/about', (c) => {
  return c.render(
    <>
      {/* Opening — a large editorial statement rather than a resume header */}
      <section class="about__open" aria-label="About">
        <div class="wrap">
          <p class="marker" data-reveal>
            <span class="idx">—</span> Profile
          </p>
          <h1 class="about__stmt display" data-reveal data-reveal-delay="1">
            Between the drawing, the model, and the render.
          </h1>
          <p class="about__lead measure" data-reveal data-reveal-delay="2">
            {about.lead}
          </p>
        </div>
      </section>

      {/* Atmospheric band */}
      <section class="about__band" aria-hidden="true">
        <div class="frame" data-clip>
          <Ph src="/img/about/wide" alt="Studio atmosphere" ratio="21 / 9" parallax={0.06} />
        </div>
      </section>

      {/* Approach — three disciplines expressed as prose, not cards */}
      <section class="about__approach section" aria-label="Approach">
        <div class="wrap">
          <p class="marker" data-reveal>
            <span class="idx">01</span> Approach
          </p>
          <div class="about__prose">
            {about.approach.map((a, i) => (
              <div class="about__disc" data-reveal data-reveal-delay={String((i % 3) + 1) as any}>
                <p class="about__disc-k mono">{pad(i + 1)} — {a.k}</p>
                <p class="about__disc-t">{a.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities + software — a two-column editorial index */}
      <section class="about__cap section" aria-label="Capabilities">
        <div class="wrap">
          <p class="marker" data-reveal>
            <span class="idx">02</span> Capabilities
          </p>
          <div class="about__capgrid">
            <div class="about__caplist">
              {about.capabilities.map((c2, i) => (
                <div class="capgroup" data-reveal data-reveal-delay={String((i % 3) + 1) as any}>
                  <h3 class="mono">{c2.group}</h3>
                  <ul>
                    {c2.items.map((it) => (
                      <li>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div class="about__side">
              <div data-reveal>
                <h3 class="mono">Focus</h3>
                <ul class="about__focus">
                  {about.focus.map((f) => (
                    <li>{f}</li>
                  ))}
                </ul>
              </div>
              <div data-reveal data-reveal-delay="1">
                <h3 class="mono">Software &amp; tools</h3>
                <p class="about__soft">{about.software.join(' · ')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline — restrained ledger */}
      <section class="about__exp section" aria-label="Experience and education">
        <div class="wrap">
          <p class="marker" data-reveal>
            <span class="idx">03</span> Experience &amp; education
          </p>
          <div class="timeline">
            {about.timeline.map((t, i) => (
              <div class="tl" data-reveal data-reveal-delay={String((i % 3) + 1) as any}>
                <span class="yr mono">{t.year}</span>
                <div>
                  <p class="ti">{t.title}</p>
                  <p class="de">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p class="about__note mono" data-reveal>
            Placeholder profile — dates, titles &amp; institutions are generic.
          </p>
        </div>
      </section>
    </>,
    { title: 'About', description: about.lead },
  )
})

/* ==========================================================================
   CONTACT
   ========================================================================== */
app.get('/contact', (c) => {
  return c.render(
    <>
      <section class="contact" aria-label="Contact">
        <div class="wrap contact__inner">
          <p class="marker" data-reveal>
            <span class="idx">—</span> Contact
          </p>

          <h1 class="contact__head display" data-reveal data-reveal-delay="1">
            <span class="line" data-reveal-delay="1"><span>Let’s talk</span></span>
            <span class="line" data-reveal-delay="2"><span>about a <em>project.</em></span></span>
          </h1>

          <div class="contact__links" data-reveal data-reveal-delay="2">
            <a class="contact__link" href={`mailto:${site.email}`}>
              <span class="mono contact__link-k">Email</span>
              <span class="contact__link-v">{site.email}</span>
            </a>
            {site.social.map((s) => (
              <a class="contact__link" href={s.href} target="_blank" rel="noopener">
                <span class="mono contact__link-k">{s.label}</span>
                <span class="contact__link-v">
                  {s.label} <span class="arrow" aria-hidden="true">↗</span>
                </span>
              </a>
            ))}
          </div>

          <p class="contact__foot mono" data-reveal>
            {site.location} — by appointment
          </p>
        </div>
      </section>
    </>,
    { title: 'Contact', description: `Contact ${site.name} for architecture, interior and visualization work.` },
  )
})

/* ==========================================================================
   404
   ========================================================================== */
app.notFound((c) => {
  return c.render(
    <section class="phead section" style="min-height:70svh;display:flex;align-items:center">
      <div class="wrap">
        <p class="eyebrow" data-reveal>
          404
        </p>
        <h1 class="display" data-reveal data-reveal-delay="1" style="margin-top:1rem">
          Not found
        </h1>
        <p data-reveal data-reveal-delay="2" style="margin-top:1rem">
          This page has moved or never existed.{' '}
          <a href="/" style="color:var(--accent)">
            Return home ↗
          </a>
        </p>
      </div>
    </section>,
    { title: 'Not found' },
  )
})

export default app
