import { Hono } from 'hono'
import { renderer } from './renderer'
import { Ph, WorkCard } from './components'
import { site } from './data/site'
import { profile } from './data/profile'
import { AboutPage } from './about-page'
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
            <span>Architecture student · Year 05</span>
            <span>Portfolio — {site.year}</span>
          </div>

          <div class="hero__inner">
            <div class="hero__lead" data-hero-title>
              <p class="hero__eyebrow line" data-reveal-delay="1">
                <span>Sarra Saifee · Selected portfolio</span>
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

      <div class="home-story" data-home-story>
      <section class="introduction section" aria-labelledby="intro-title" data-motion-intro>
        <div class="wrap">
          <p class="marker"><span class="idx">01</span> A perspective in progress</p>
          <h2 id="intro-title" class="intro-statement"><span data-type-line>Learning to see.</span><span data-type-line>Designing to</span><span data-type-line>connect.</span></h2>
          <div class="intro-bottom">
            <div class="intro-signature" aria-hidden="true"><span class="intro-cross">+</span><span>Space. Light. Everyday life.</span></div>
            <div class="intro-copy"><p>I’m Sarra, a fifth-year architecture student exploring the relationships between space, light and everyday life.</p><p>This portfolio brings together architectural studies, interior explorations and an evolving approach to visual storytelling.</p><a class="text-link" href="/about">Meet Sarra <span aria-hidden="true">↗</span></a></div>
          </div>
        </div>
      </section>

      <div class="spatial-ribbon" aria-hidden="true"><div data-motion-ribbon><span>Space</span><i>↗</i><span>Light</span><i>↗</i><span>Material</span><i>↗</i><span>Space</span><i>↗</i><span>Light</span></div></div>

      <section class="selected section" id="selected-work" aria-labelledby="selected-title">
        <div class="wrap">
          <div class="editorial-heading" data-reveal><div><p class="marker"><span class="idx">02</span> Selected work</p><h2 id="selected-title" class="editorial-title">Four perspectives.<br />An evolving practice.</h2></div><a class="text-link" href="/work">Explore all {count} projects <span aria-hidden="true">↗</span></a></div>
          <div class="project-deck" data-project-deck>
            {featured.slice(0, 4).map((p, i) => (
              <article class="project-chapter" data-project-chapter style={`--chapter-order:${i + 1}`} aria-labelledby={`project-title-${i}`}>
                <a class="project-panel" href={`/work/${p.slug}`} aria-label={`Explore ${p.title}`}>
                  <div class="project-panel__visual"><div class="project-panel__picture" data-project-picture><Ph src={p.coverImage} alt={`${p.title} — ${p.category}`} /></div><span class="project-panel__folio" aria-hidden="true">{pad(i + 1)}<small>/ 04</small></span><span class="project-panel__category mono">{p.category}</span></div>
                  <div class="project-panel__info"><div><p class="mono">Selected work / {pad(i + 1)}</p><h3 id={`project-title-${i}`}>{p.title}</h3><p class="project-panel__subtitle">{p.subtitle}</p></div><div class="project-panel__bottom"><span>Explore project</span><span class="round-arrow" aria-hidden="true">↗</span></div></div>
                </a>
              </article>
            ))}
          </div>
          <div class="project-end"><p class="mono">A selection, not the whole story.</p><a class="text-link" href="/work">Continue to all projects <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>

      <section class="thinking section" aria-labelledby="thinking-title" data-motion-process>
        <div class="wrap thinking-layout">
          <div class="thinking-heading"><p class="marker"><span class="idx">03</span> Ways of seeing</p><h2 id="thinking-title" class="editorial-title">From a line.<br />To a space.</h2>
            <div class="spatial-study" aria-hidden="true"><div class="spatial-study__grid"></div><div class="spatial-study__form"><span class="spatial-plane spatial-plane--base"></span><span class="spatial-plane spatial-plane--one"></span><span class="spatial-plane spatial-plane--two"></span><span class="spatial-plane spatial-plane--three"></span><span class="spatial-axis"></span></div><div class="spatial-study__caption"><span>Spatial study</span><span data-study-phase>01 / Observe</span></div><div class="spatial-study__progress"><span></span></div></div>
          </div>
          <div class="thinking-steps">
            {[
              ['Observe', 'Read the context.', 'Begin with place: its light, movement, scale and the people who use it.'],
              ['Explore', 'Think through drawing.', 'Use lines, diagrams and spatial studies to ask questions and test possibilities.'],
              ['Develop', 'Give the idea form.', 'Bring proportion, structure and material into conversation through models and drawings.'],
              ['Communicate', 'Make space legible.', 'Compose views and sequences that explain the idea and the atmosphere it could create.'],
            ].map(([label, title, text], i) => (
              <article class="thinking-step" data-process-step><div class="thinking-step__label"><span class="mono">{pad(i + 1)} / {label}</span><span aria-hidden="true">↗</span></div><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section class="practice section" aria-labelledby="practice-title" data-motion-practice>
        <div class="wrap"><div class="practice-heading"><p class="marker"><span class="idx">04</span> Education meets practice</p><h2 class="editorial-title" id="practice-title">Still learning.<br />Already exploring.</h2></div>
          <div class="practice-facts"><div data-practice-fact><strong>05</strong><span>Year of undergraduate study</span></div><div data-practice-fact><strong>08<small> months</small></strong><span>Completed junior architect internship</span></div><div data-practice-fact><strong>03<small> months</small></strong><span>Current internship · ongoing</span></div></div>
          <div class="practice-note"><p>Developing a design perspective through academic exploration and hands-on experience in architectural practice.</p><a class="text-link" href="/about">More about my journey <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>
      <section class="home-contact section" data-motion-contact><div class="wrap"><p class="marker">A conversation starts here</p><a href="/contact" class="home-contact__link"><span data-contact-word>Let’s connect.</span><span class="contact-arrow" aria-hidden="true">↗</span></a><p>For opportunities, collaborations and conversations about architecture.</p></div></section>
      </div>

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
app.get('/about', (c) => c.render(<AboutPage />, { title: 'About', description: profile.lead }))

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
            {site.social.filter(s => s.href).map((s) => (
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
