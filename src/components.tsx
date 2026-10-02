// Reusable presentational components shared across pages.
import type { Project } from './data/projects'

/**
 * Ph — a generative placeholder "image".
 * Renders a div the client script fills with an inline architectural SVG.
 * Uses aspect-ratio to reserve space (no layout shift) and lazy-generates
 * unless `eager` (hero / critical imagery).
 *
 * `src` uses our data convention `/img/<seed>/<variant>` → we translate it
 * into the `data-ph="seed|variant"` the runtime understands.
 */
export function Ph(props: {
  src: string
  alt: string
  ratio?: string
  eager?: boolean
  clip?: boolean
  parallax?: number
  class?: string
  lightbox?: boolean
}) {
  const parts = props.src.replace(/^\/img\//, '').split('/')
  const key = `${parts[0] || 'x'}|${parts[1] || 'a'}`
  const style = props.ratio ? `aspect-ratio:${props.ratio};` : ''
  const Tag = props.lightbox ? 'button' : 'div'
  return (
    <Tag
      class={`ph ${props.class || ''}`}
      type={props.lightbox ? 'button' : undefined}
      role={props.lightbox ? undefined : 'img'}
      aria-label={props.lightbox ? `Open image: ${props.alt}` : props.alt}
      aria-haspopup={props.lightbox ? 'dialog' : undefined}
      data-image-alt={props.lightbox ? props.alt : undefined}
      data-ph={key}
      data-eager={props.eager ? '' : undefined}
      data-clip={props.clip ? '' : undefined}
      data-parallax={props.parallax !== undefined ? String(props.parallax) : undefined}
      data-lightbox={props.lightbox ? '' : undefined}
      data-ratio={props.ratio}
      style={style}
    ></Tag>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * FeaturedRow — a cinematic project "scene" in the homepage sequence.
 * Alternating sides on desktop; a large sticky project number tracks the
 * image; number, title and metadata reveal independently on scroll. The
 * image scales via [data-scene-media]; the whole block is a scroll step.
 */
export function FeaturedRow({ project, i, total }: { project: Project; i: number; total?: number }) {
  const side = i % 2 === 0 ? 'left' : 'right'
  return (
    <article class={`scene scene--${side}`} data-scene aria-label={project.title}>
      {/* Oversized index — architectural graphic language */}
      <div class="scene__num display" data-reveal aria-hidden="true">
        {pad(project.order)}
      </div>

      <a class="scene__media" href={`/work/${project.slug}`} aria-label={`View ${project.title}`}>
        <div class="frame" data-clip>
          <div class="scene__img" data-scene-media>
            <Ph src={project.coverImage} alt={`${project.title} — ${project.category}`} />
          </div>
        </div>
        <span class="scene__tag mono">{project.category}</span>
      </a>

      <div class="scene__info">
        <p class="scene__count mono" data-reveal>
          {pad(project.order)}{total ? ` / ${pad(total)}` : ''}
        </p>
        <a href={`/work/${project.slug}`} class="scene__titlelink">
          <h3 class="scene__title display">
            <span class="line" data-reveal-delay="1">
              <span>{project.title}</span>
            </span>
          </h3>
        </a>
        <p class="scene__sub" data-reveal data-reveal-delay="1">{project.subtitle}</p>

        <dl class="scene__facts" data-reveal data-reveal-delay="2">
          <div>
            <dt>Location</dt>
            <dd>{project.location}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd style="text-transform:capitalize">{project.discipline}</dd>
          </div>
        </dl>

        <a class="scene__cta" href={`/work/${project.slug}`} data-reveal data-reveal-delay="2">
          <span>View project</span>
          <span class="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

/** A card for the work index grid. */
export function WorkCard({ project, wide }: { project: Project; wide?: boolean }) {
  return (
    <article
      class={`card ${wide ? 'card--wide' : ''}`}
      data-discipline={project.discipline}
      data-track={project.track}
      data-reveal
    >
      <a href={`/work/${project.slug}`} aria-label={`View ${project.title}`}>
        <div class="card__media">
          <span class="card__badge">{project.track === 'academic' ? 'Academic' : 'Professional'}</span>
          <Ph src={project.coverImage} alt={`${project.title} — ${project.category}`} />
        </div>
        <div class="card__meta">
          <div>
            <h3 class="card__title">{project.title}</h3>
            <p class="card__cat">{project.category}</p>
          </div>
          <span class="card__year">{project.year}</span>
        </div>
      </a>
    </article>
  )
}
