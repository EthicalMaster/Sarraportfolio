import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
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
  const isAbout = useRequestContext().req.path.replace(/\/$/, '') === '/about'
  const pageTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`
  const desc =
    description ||
    'Architecture, interiors and visual explorations by Sarra Saifee, a fifth-year undergraduate architecture student.'
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={desc} />
        <meta name="theme-color" content="#F0EBE6" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        {/* Tiny fail-open bootstrap: never leave the site behind a failed loader. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var r=document.documentElement;try{if(location.pathname!=='/'&&sessionStorage.getItem('sarra-entered'))return;}catch(e){}r.classList.add('is-loading');window.setTimeout(function(){if(!r.classList.contains('is-loading'))return;window.dispatchEvent(new Event('portfolio:skip'));r.classList.remove('is-loading');document.querySelectorAll('[data-loader-inert]').forEach(function(e){e.inert=false;});window.dispatchEvent(new Event('portfolio:entered'));},8000);})();` }} />
        <style dangerouslySetInnerHTML={{ __html: `.arrival{display:none}html.is-loading{overflow:hidden}html.is-loading .arrival{display:flex;position:fixed;inset:0;z-index:10000;background:#141312;color:#f4f1ec}html:not(.js-ready) .hero-video-wrap{height:auto}` }} />
        {/* Fonts: preconnect + display=swap keeps first paint fast */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Geist:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/static/style.css" />
        <link rel="stylesheet" href="/static/home-motion.css" />
        {isAbout && <link rel="stylesheet" href="/static/about.css" />}
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23141312'/%3E%3Ctext x='16' y='23' font-family='serif' font-size='20' fill='%23c8a97e' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E"
        />
        <script defer src="/static/arrival.js"></script>
        <script defer src="/static/app.js"></script>
        <script defer src="/static/home-motion.js"></script>
        {isAbout && <script defer src="/static/about.js"></script>}
      </head>
      <body id="top">
        <div class="arrival" data-arrival role="dialog" aria-modal="true" aria-label="Preparing portfolio" aria-describedby="arrival-status">
          <div class="arrival__top"><span class="arrival__brand">{site.name}</span><span class="arrival__edition">Portfolio — {site.year}</span></div>
          <div class="arrival__center">
            <div class="arrival__drawing" aria-hidden="true">
              <svg viewBox="0 0 320 200" fill="none"><path class="arrival__guide" d="M20 170H300M45 20V185M275 20V185M20 40H300" /><path class="arrival__outline" pathLength="100" d="M60 165V70L160 25L260 70V165L160 195L60 165M60 70L160 110L260 70M160 110V195M160 25V110M60 115L160 155L260 115" /></svg>
            </div>
            <p class="arrival__eyebrow">Space · Light · Material</p>
            <p class="arrival__title">A space taking shape.</p>
          </div>
          <div class="arrival__bottom">
            <div class="arrival__readout"><p id="arrival-status" data-arrival-status role="status">Preparing your visit</p><span class="arrival__number" aria-hidden="true"><span data-arrival-number>0</span><small>%</small></span></div>
            <div class="arrival__track" data-arrival-progress role="progressbar" aria-label="Portfolio preparation" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
            <div class="arrival__meta"><span>Architecture · Interior · Visualization</span><button type="button" data-arrival-skip>Enter now <span aria-hidden="true">↗</span></button></div>
          </div>
        </div>
        <a class="skip-link" href="#content">Skip to content</a>
        <SiteNav />
        <MobileNav />
        <main id="content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
})

const navigationLinks = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const { req } = useRequestContext()
  const path = req.path.replace(/\/$/, '') || '/'
  const current = path.startsWith('/work/') ? '/work' : path
  const links = mobile ? [{ href: '/', label: 'Home' }, ...navigationLinks] : navigationLinks
  return <>{links.map(({ href, label }) => (
    <a href={href} aria-current={href === current ? (path.startsWith('/work/') ? 'location' : 'page') : undefined}>{label}</a>
  ))}</>
}

function SiteNav() {
  return (
    <header class="nav" data-nav>
      <a class="nav__brand" href="/" aria-label={`${site.name}, home`}>
        {site.name}
        <small>Architecture portfolio</small>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <NavigationLinks />
      </nav>
      <button class="nav__toggle" data-mnav-toggle type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  )
}

function MobileNav() {
  return (
    <nav class="mnav" id="mobile-nav" data-mnav aria-label="Mobile" inert>
      <NavigationLinks mobile />
      <div class="mnav__meta">
        <span>Fifth-year architecture student</span>
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
            {site.social.filter(s => s.href).map((s) => (
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
