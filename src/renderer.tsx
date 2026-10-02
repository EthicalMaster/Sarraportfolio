import { jsxRenderer } from 'hono/jsx-renderer'
import { site } from './data/site'

declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: { title?: string; description?: string },
    ): Response
  }
}

export const renderer = jsxRenderer(({ children, title, description }) => {
  const pageTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`
  const desc =
    description ||
    'Cinematic architectural editorial portfolio — architecture, interior & visualization by Sarra Saifee, Copenhagen.'
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={desc} />
        <meta name="theme-color" content="#141312" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        {/* Fonts: preconnect + display=swap keeps first paint fast */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Space+Grotesk:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/static/style.css" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23141312'/%3E%3Ctext x='16' y='23' font-family='serif' font-size='20' fill='%23c8a97e' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E"
        />
        <script defer src="/static/app.js"></script>
      </head>
      <body id="top">
        <SiteNav />
        <MobileNav />
        <main id="content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
})

function SiteNav() {
  return (
    <header class="nav" data-nav>
      <a class="nav__brand" href="/" aria-label={`${site.name}, home`}>
        {site.name}
        <small>{site.tagline}</small>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <a href="/work">Work</a>
        <a href="/work?discipline=architecture">Architecture</a>
        <a href="/work?discipline=interior">Interior</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <button class="nav__toggle" data-mnav-toggle aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  )
}

function MobileNav() {
  return (
    <nav class="mnav" id="mobile-nav" data-mnav aria-label="Mobile">
      <a href="/">Home</a>
      <a href="/work">Work</a>
      <a href="/work?discipline=architecture">Architecture</a>
      <a href="/work?discipline=interior">Interior</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <div class="mnav__meta">
        <span>{site.location}</span>
        <span>{site.email}</span>
      </div>
    </nav>
  )
}

function SiteFooter() {
  return (
    <footer class="foot">
      <div class="wrap">
        <hr class="rule foot__rule" />
        <div class="foot__grid">
          <div class="foot__brand">
            <a href="/" class="foot__name display">
              {site.name}
            </a>
            <ul class="foot__disc">
              <li>Architecture</li>
              <li>Interior</li>
              <li>Visualization</li>
            </ul>
          </div>

          <nav class="foot__nav" aria-label="Footer">
            <a href="/work">Work</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>

          <div class="foot__social">
            {site.social.map((s) => (
              <a href={s.href} target="_blank" rel="noopener">
                {s.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>

        <div class="foot__bottom">
          <span>© {site.year} {site.name}</span>
          <a href="#top" class="foot__top-link" data-backtotop>
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
