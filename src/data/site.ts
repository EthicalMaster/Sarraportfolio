// ============================================================================
//  SITE CONTENT
//  Global, non-project content: identity, navigation, about, contact.
//  Edit here to rebrand the portfolio without touching layout code.
// ============================================================================

export const site = {
  name: 'Sarra Saifee',
  role: 'Architect & Visualizer',
  tagline: 'Architecture · Interior · Visualization',
  location: 'Copenhagen',
  email: 'studio@sarrasaifee.com',
  phone: '+45 00 00 00 00',
  year: 2026,
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Behance', href: '#' },
  ],
}

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Architecture', href: '/work?discipline=architecture' },
  { label: 'Interior', href: '/work?discipline=interior' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const about = {
  lead:
    'I am an architect and architectural visualizer based in Copenhagen, working across residential, cultural, and hospitality scales. My practice moves between the drawing, the model, and the render — treating each as a way of thinking about space rather than merely representing it.',
  paragraphs: [
    'I am drawn to buildings that are quiet but precise: projects where a single clear idea organises structure, light, and material into something that feels inevitable. Much of my work begins in section, testing how a person moves through space and how daylight changes across a day and a year.',
    'Alongside built and academic projects, I produce architectural visualizations for studios who want their ideas communicated with restraint and atmosphere rather than spectacle. I care about the honest depiction of material, weather, and time.',
  ],
  // Three disciplines expressed as short prose statements (not cards).
  approach: [
    {
      k: 'Architecture',
      t: 'I work from section and light — organising structure and material around a single clear idea, so that a building feels inevitable rather than assembled.',
    },
    {
      k: 'Interior',
      t: 'Interiors are treated as continuous with the architecture: a few crafted elements and a restrained palette, letting proportion and daylight carry the room.',
    },
    {
      k: 'Visualization',
      t: 'I make images that describe space with restraint and atmosphere — honest material, weather and time — rather than spectacle, so an idea reads before the render does.',
    },
  ],
  focus: [
    'Daylight & spatial sequence',
    'Material honesty',
    'Adaptive reuse',
    'Landscape & threshold',
    'Editorial visualization',
  ],
  capabilities: [
    { group: 'Design', items: ['Architectural design', 'Interior design', 'Concept development', 'Detailing'] },
    { group: 'Visualization', items: ['3D modelling', 'Photoreal rendering', 'Lighting studies', 'Post-production'] },
    { group: 'Representation', items: ['Orthographic drawing', 'Physical models', 'Diagramming', 'Editorial layout'] },
  ],
  software: ['Rhino', 'Grasshopper', 'AutoCAD', 'Revit', 'V-Ray', 'Corona', 'Blender', 'Photoshop', 'InDesign'],
  timeline: [
    { year: '2024 — present', title: 'Independent Practice', detail: 'Architecture, interiors & visualization' },
    { year: '2021 — 2024', title: 'Studio Architect', detail: 'Cultural & residential projects, Copenhagen' },
    { year: '2019 — 2021', title: 'M.Arch', detail: 'Graduate thesis with distinction' },
    { year: '2015 — 2019', title: 'B.Arch', detail: 'Foundation in design & representation' },
  ],
}
