import { site } from './data/site'

export const enquiries = [
  { id: 'opportunity', label: 'An opportunity', note: 'Internships & roles', title: 'A chance to learn. A place to contribute.', text: 'Share the role, the studio, and what you have in mind. I’d love to explore how I could contribute while continuing to grow.', subject: 'An opportunity for Sarra Saifee' },
  { id: 'collaboration', label: 'A collaboration', note: 'Ideas & shared practice', title: 'Different perspectives. Something new.', text: 'Have an idea we could explore together? Tell me a little about the collaboration and where you see our interests meeting.', subject: 'A collaboration with Sarra Saifee' },
  { id: 'project', label: 'A project', note: 'Spaces & possibilities', title: 'An idea for a space. A first conversation.', text: 'Tell me about the space, its location, and what you hope to create. We can discuss the scope and whether it is a good fit.', subject: 'A project enquiry for Sarra Saifee' },
]

export function ContactPage() {
 return <article class="ct" data-contact-page data-email={site.email}>
  <section class="ct-opening wrap" aria-labelledby="contact-heading">
   <div class="ct-topline"><p class="marker">Contact / An open invitation</p><span class="mono">Indore, India</span></div>
   <div class="ct-opening__grid">
    <div class="ct-opening__copy"><p class="ct-kicker">Every idea starts somewhere.</p><h1 id="contact-heading">Good spaces<br />begin with a<br /><span>conversation.</span></h1><p class="ct-lead">Have an opportunity, a project in mind, or a perspective to share? I’d love to hear from you.</p><a class="ct-intro-link text-link" href="#start-conversation">Let’s begin <span aria-hidden="true">↓</span></a></div>
    <figure class="ct-space" aria-label="An architectural drawing of an open doorway with light extending through it">
     <svg class="ct-space__drawing" viewBox="0 0 480 540" fill="none" aria-hidden="true">
      <defs><linearGradient id="ct-wall" x1="90" y1="90" x2="390" y2="420" gradientUnits="userSpaceOnUse"><stop stop-color="#e6dcd0"/><stop offset="1" stop-color="#c3b09a"/></linearGradient><linearGradient id="ct-light" x1="245" y1="335" x2="90" y2="530" gradientUnits="userSpaceOnUse"><stop stop-color="#c49b65" stop-opacity=".65"/><stop offset="1" stop-color="#d8b889" stop-opacity="0"/></linearGradient></defs>
      <g class="ct-space__guides" stroke="#8e7c67" stroke-width=".7"><path d="M20 418H460M80 28V480M390 28V480M25 78H450M25 358H450M165 48V470M315 48V470"/><path d="M80 42H390M80 36V48M390 36V48M417 78V418M411 78H423M411 418H423"/></g>
      <path class="ct-space__light" d="M175 358H315L220 540H12Z" fill="url(#ct-light)"/>
      <path d="M80 78H390V418H315V160H165V418H80Z" fill="url(#ct-wall)"/>
      <path d="M165 160H315V418H165Z" fill="#746352"/>
      <path d="M182 180H301V418H182Z" fill="#dbc3a3"/>
      <path d="M182 180L212 195V418H182Z" fill="#b59673"/>
      <g class="ct-space__door"><path d="M165 160H315V418H165Z" fill="#b49a7f" stroke="#7d6853" stroke-width="1"/><path d="M181 178H299V400H181Z" stroke="#d4c0a7"/><circle cx="290" cy="294" r="4" fill="#65503c"/></g>
      <path class="ct-space__outline" pathLength="100" d="M80 418V78H390V418M165 418V160H315V418M80 431H390" stroke="#78634e" stroke-width="1"/>
      <circle cx="417" cy="42" r="3" fill="#9c7952"/><path d="M36 76H48M42 70V82" stroke="#9c7952"/>
     </svg>
     <figcaption><span>01 / Room for possibility</span><span>Come on in ↗</span></figcaption>
    </figure>
   </div>
  </section>
  <section class="ct-conversation wrap" id="start-conversation" aria-labelledby="conversation-title">
   <div class="ct-section-heading"><p class="marker">Choose a starting point</p><h2 id="conversation-title">What brings<br />you here?</h2><p>Just a starting point.<br />The conversation is yours.</p></div>
   <div class="ct-options" role="group" aria-label="Type of enquiry">{enquiries.map((q,i)=><button type="button" class="ct-option" aria-pressed={i===0?'true':'false'} aria-controls="enquiry-detail" data-enquiry={q.id} data-title={q.title} data-description={q.text} data-subject={q.subject}><span class="ct-option__index">0{i+1}</span><span class="ct-option__label">{q.label}<small>{q.note}</small></span><span class="ct-option__arrow" aria-hidden="true">↗</span></button>)}</div>
   <div class="ct-detail" id="enquiry-detail"><div class="ct-detail__copy" aria-live="polite" aria-atomic="true"><h3 data-enquiry-title>{enquiries[0].title}</h3><p data-enquiry-description>{enquiries[0].text}</p></div><a class="ct-write" data-write-email href={`mailto:${site.email}?subject=${encodeURIComponent(enquiries[0].subject)}`}><span>Write to Sarra<small>Opens your email app</small></span><span aria-hidden="true">↗</span></a></div>
   <div class="ct-address"><div><span class="mono">Or reach me directly</span><a data-contact-email href={`mailto:${site.email}`}>{site.email}</a></div><div class="ct-copy"><button type="button" data-copy-email hidden>Copy email <span aria-hidden="true">↗</span></button><p data-copy-status role="status"></p></div></div>
  </section>
  <section class="ct-elsewhere wrap" aria-labelledby="elsewhere-title"><div><p class="marker">A little further</p><h2 id="elsewhere-title">Other ways<br />to connect.</h2><p>Based in {site.location}.<br />Fifth-year architecture undergraduate.</p></div><div class="ct-socials">{site.social.filter(s=>s.href).map(s=><a href={s.href} target="_blank" rel="noopener noreferrer"><span><span class="ct-socials__name">{s.label}</span><small>{s.label.startsWith('Instagram')?'Architectural posts & visual explorations':'Professional profile & experience'}</small></span><span class="ct-socials__arrow" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>)}</div></section>
  <div class="ct-signoff wrap" aria-hidden="true"><span>A first hello.</span><span>A new perspective.</span><span class="ct-signoff__mark">S / S</span></div>
 </article>
}
