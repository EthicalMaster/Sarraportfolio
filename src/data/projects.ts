// ============================================================================
//  PROJECT DATA LAYER
//  ----------------------------------------------------------------------------
//  This is the single source of truth for all portfolio projects.
//  A developer (or, later, an authenticated CMS) can add / remove / reorder
//  projects here without touching any layout code. Every page reads from this
//  layer, so the portfolio stays fully data-driven.
//
//  To add a project: append an object to `projects` with a unique `id`/`slug`.
//  `order` controls sequence; `featured` surfaces it on the homepage.
// ============================================================================

export type Discipline = 'architecture' | 'interior'
export type Track = 'academic' | 'professional'

export interface GalleryImage {
  /** Placeholder image key used by the generative image system (see /static/img). */
  src: string
  alt: string
  /** Layout hint for the editorial gallery: how much horizontal space to occupy. */
  span?: 'full' | 'wide' | 'half' | 'third'
  /** Aspect ratio hint to prevent layout shift, e.g. "3 / 2". */
  ratio?: string
  caption?: string
}

export interface Project {
  id: number
  slug: string
  title: string
  /** Short 1-2 word subtitle shown beneath large titles. */
  subtitle?: string
  year: number
  discipline: Discipline
  track: Track
  /** Human-readable category label, e.g. "Cultural Architecture". */
  category: string
  location: string
  /** One-paragraph editorial description. */
  description: string
  /** Longer statement for the detail page. */
  statement?: string
  /** Key facts shown as a metadata table on the detail page. */
  facts?: { label: string; value: string }[]
  coverImage: string
  gallery: GalleryImage[]
  featured: boolean
  order: number
  /** Accent seed used to tint the generated placeholder imagery. */
  tone: number
}

// Helper to build a placeholder image src that the client renderer understands.
// Format: /img/<seed>/<variant>  — resolved to an inline generative SVG/canvas.
const img = (seed: string, variant = 'a') => `/img/${seed}/${variant}`

export const projects: Project[] = [
  {
    id: 1,
    slug: 'meridian-house',
    title: 'Meridian House',
    subtitle: 'A dwelling of light',
    year: 2026,
    discipline: 'architecture',
    track: 'professional',
    category: 'Residential Architecture',
    location: 'Copenhagen, DK',
    description:
      'A single-family residence organised around a central light court. Load-bearing masonry and exposed timber frame a sequence of rooms that open progressively toward the garden.',
    statement:
      'Meridian House is a study in the choreography of daylight. The plan folds around a top-lit court so that every principal room borrows a second, indirect source of light. Materials are held to a deliberately narrow palette — lime-washed brick, oiled oak, and blackened steel — allowing the changing quality of light to become the primary ornament.',
    facts: [
      { label: 'Programme', value: 'Private residence' },
      { label: 'Area', value: '340 m²' },
      { label: 'Status', value: 'Completed' },
      { label: 'Role', value: 'Design & Visualization' },
    ],
    coverImage: img('meridian', 'cover'),
    gallery: [
      { src: img('meridian', 'a'), alt: 'Meridian House — courtyard elevation at dusk', span: 'full', ratio: '16 / 9' },
      { src: img('meridian', 'b'), alt: 'Meridian House — living space toward the garden', span: 'half', ratio: '4 / 5' },
      { src: img('meridian', 'c'), alt: 'Meridian House — stair detail', span: 'half', ratio: '4 / 5' },
      { src: img('meridian', 'd'), alt: 'Meridian House — long section through the court', span: 'full', ratio: '2 / 1' },
    ],
    featured: true,
    order: 1,
    tone: 24,
  },
  {
    id: 2,
    slug: 'atrium-gallery',
    title: 'Atrium Gallery',
    subtitle: 'Civic threshold',
    year: 2025,
    discipline: 'architecture',
    track: 'professional',
    category: 'Cultural Architecture',
    location: 'Rotterdam, NL',
    description:
      'A contemporary art gallery inserted into a former industrial hall. A new concrete atrium carves vertical light into the deep plan, tying three exhibition levels together.',
    statement:
      'The intervention is deliberately singular: one carved atrium that reorganises an entire building. Circulation, daylight, and orientation all resolve into this vertical room. The existing brick shell is retained and quietly restored, while new insertions are cast in a pale board-formed concrete that reads as clearly contemporary.',
    facts: [
      { label: 'Programme', value: 'Public gallery' },
      { label: 'Area', value: '2,100 m²' },
      { label: 'Status', value: 'Completed' },
      { label: 'Role', value: 'Architecture' },
    ],
    coverImage: img('atrium', 'cover'),
    gallery: [
      { src: img('atrium', 'a'), alt: 'Atrium Gallery — central light well', span: 'full', ratio: '16 / 9' },
      { src: img('atrium', 'b'), alt: 'Atrium Gallery — gallery floor', span: 'wide', ratio: '3 / 2' },
      { src: img('atrium', 'c'), alt: 'Atrium Gallery — concrete stair', span: 'third', ratio: '3 / 4' },
      { src: img('atrium', 'd'), alt: 'Atrium Gallery — facade at street', span: 'full', ratio: '2 / 1' },
    ],
    featured: true,
    order: 2,
    tone: 210,
  },
  {
    id: 3,
    slug: 'quarry-pavilion',
    title: 'Quarry Pavilion',
    subtitle: 'Landscape & mass',
    year: 2025,
    discipline: 'architecture',
    track: 'academic',
    category: 'Academic — Thesis',
    location: 'Carrara, IT',
    description:
      'A thesis project siting a small research pavilion within a disused marble quarry. The building negotiates between extracted voids and remnant stone terraces.',
    statement:
      'Developed as a graduate thesis, Quarry Pavilion treats the quarry as both site and material archive. The design catalogues the extraction geometry of the quarry and returns a single mass that completes, rather than contrasts, the excavated volume. Drawings and physical models explore how a building can act as a form of landscape repair.',
    facts: [
      { label: 'Programme', value: 'Research pavilion' },
      { label: 'Area', value: '620 m²' },
      { label: 'Status', value: 'Academic thesis' },
      { label: 'Role', value: 'Author' },
    ],
    coverImage: img('quarry', 'cover'),
    gallery: [
      { src: img('quarry', 'a'), alt: 'Quarry Pavilion — approach across the terraces', span: 'full', ratio: '16 / 9' },
      { src: img('quarry', 'b'), alt: 'Quarry Pavilion — sectional model', span: 'half', ratio: '1 / 1' },
      { src: img('quarry', 'c'), alt: 'Quarry Pavilion — interior toward the void', span: 'half', ratio: '1 / 1' },
    ],
    featured: true,
    order: 3,
    tone: 40,
  },
  {
    id: 4,
    slug: 'linden-apartment',
    title: 'Linden Apartment',
    subtitle: 'Quiet interior',
    year: 2026,
    discipline: 'interior',
    track: 'professional',
    category: 'Residential Interior',
    location: 'Stockholm, SE',
    description:
      'The reconfiguration of a turn-of-the-century apartment. A single joinery spine hosts storage, seating, and thresholds, freeing the perimeter rooms for light and view.',
    statement:
      'Rather than dividing the apartment into more rooms, a continuous oak spine consolidates every service — wardrobe, library, kitchen, and bathroom door — into one crafted element. The historic cornices and floors are conserved; new interventions are consciously legible, allowing old and new to coexist without pastiche.',
    facts: [
      { label: 'Programme', value: 'Apartment renovation' },
      { label: 'Area', value: '120 m²' },
      { label: 'Status', value: 'Completed' },
      { label: 'Role', value: 'Interior Design' },
    ],
    coverImage: img('linden', 'cover'),
    gallery: [
      { src: img('linden', 'a'), alt: 'Linden Apartment — living room', span: 'full', ratio: '16 / 9' },
      { src: img('linden', 'b'), alt: 'Linden Apartment — joinery spine', span: 'half', ratio: '4 / 5' },
      { src: img('linden', 'c'), alt: 'Linden Apartment — kitchen detail', span: 'half', ratio: '4 / 5' },
    ],
    featured: true,
    order: 4,
    tone: 30,
  },
  {
    id: 5,
    slug: 'north-reading-room',
    title: 'North Reading Room',
    subtitle: 'Interior for study',
    year: 2024,
    discipline: 'interior',
    track: 'professional',
    category: 'Workplace Interior',
    location: 'Oslo, NO',
    description:
      'A reading and focus room for a design studio. Acoustic felt, warm timber, and a single long table create a calm, low-lit environment for deep work.',
    statement:
      'The brief asked for silence within an open-plan office. The response is a room-within-a-room lined in wool felt, entered through a heavy pivoting door. A continuous clerestory washes the ceiling with indirect daylight while task lighting keeps the working plane intimate and shadow-free.',
    facts: [
      { label: 'Programme', value: 'Workplace interior' },
      { label: 'Area', value: '85 m²' },
      { label: 'Status', value: 'Completed' },
      { label: 'Role', value: 'Interior & Visualization' },
    ],
    coverImage: img('reading', 'cover'),
    gallery: [
      { src: img('reading', 'a'), alt: 'North Reading Room — long table', span: 'full', ratio: '16 / 9' },
      { src: img('reading', 'b'), alt: 'North Reading Room — felt wall detail', span: 'wide', ratio: '3 / 2' },
      { src: img('reading', 'c'), alt: 'North Reading Room — pivot door', span: 'third', ratio: '3 / 4' },
    ],
    featured: false,
    order: 5,
    tone: 20,
  },
  {
    id: 6,
    slug: 'coastal-school',
    title: 'Coastal School',
    subtitle: 'Learning by the sea',
    year: 2023,
    discipline: 'architecture',
    track: 'academic',
    category: 'Academic — Studio',
    location: 'Aveiro, PT',
    description:
      'A primary school studio project on an exposed coastal edge. Classrooms step down toward the dunes, each with a sheltered outdoor room protected from the prevailing wind.',
    statement:
      'This design-studio project investigates the threshold between learning and landscape. The school is conceived as a low, terraced ground that children move across rather than a building they enter. Windbreak walls and planted courts moderate the harsh coastal climate, turning weather into part of the daily curriculum.',
    facts: [
      { label: 'Programme', value: 'Primary school' },
      { label: 'Area', value: '3,400 m²' },
      { label: 'Status', value: 'Academic studio' },
      { label: 'Role', value: 'Author' },
    ],
    coverImage: img('coastal', 'cover'),
    gallery: [
      { src: img('coastal', 'a'), alt: 'Coastal School — terraced classrooms', span: 'full', ratio: '16 / 9' },
      { src: img('coastal', 'b'), alt: 'Coastal School — site model', span: 'half', ratio: '1 / 1' },
      { src: img('coastal', 'c'), alt: 'Coastal School — courtyard', span: 'half', ratio: '1 / 1' },
      { src: img('coastal', 'd'), alt: 'Coastal School — long section', span: 'full', ratio: '2 / 1' },
    ],
    featured: false,
    order: 6,
    tone: 195,
  },
  {
    id: 7,
    slug: 'terrazzo-cafe',
    title: 'Terrazzo Café',
    subtitle: 'Hospitality',
    year: 2024,
    discipline: 'interior',
    track: 'professional',
    category: 'Hospitality Interior',
    location: 'Lisbon, PT',
    description:
      'A small neighbourhood café built almost entirely from a single terrazzo mix. The counter, floor, and shelving are cast as one continuous material landscape.',
    statement:
      'One material, applied without hierarchy. A warm terrazzo — flecked with recycled marble from a local fabricator — forms floor, counter, benches, and even the low dividing walls. Brass fixings and a single suspended light provide the only points of contrast in an otherwise seamless room.',
    facts: [
      { label: 'Programme', value: 'Café' },
      { label: 'Area', value: '60 m²' },
      { label: 'Status', value: 'Completed' },
      { label: 'Role', value: 'Interior Design' },
    ],
    coverImage: img('terrazzo', 'cover'),
    gallery: [
      { src: img('terrazzo', 'a'), alt: 'Terrazzo Café — counter', span: 'full', ratio: '16 / 9' },
      { src: img('terrazzo', 'b'), alt: 'Terrazzo Café — seating nook', span: 'half', ratio: '4 / 5' },
      { src: img('terrazzo', 'c'), alt: 'Terrazzo Café — material detail', span: 'half', ratio: '4 / 5' },
    ],
    featured: false,
    order: 7,
    tone: 15,
  },
  {
    id: 8,
    slug: 'ridge-observatory',
    title: 'Ridge Observatory',
    subtitle: 'Thesis in section',
    year: 2023,
    discipline: 'architecture',
    track: 'academic',
    category: 'Academic — Thesis',
    location: 'Dolomites, IT',
    description:
      'A mountain observatory and shelter developed through section. A single stair threads visitors from a rock-cut base up to an open viewing platform above the tree line.',
    statement:
      'Ridge Observatory is a sectional project first and foremost. The building is generated by the journey from valley to summit, compressing and releasing space to frame specific views. Concrete gives way to timber and finally to open sky, so that architecture gradually dissolves into landscape as one ascends.',
    facts: [
      { label: 'Programme', value: 'Observatory & shelter' },
      { label: 'Area', value: '410 m²' },
      { label: 'Status', value: 'Academic thesis' },
      { label: 'Role', value: 'Author' },
    ],
    coverImage: img('ridge', 'cover'),
    gallery: [
      { src: img('ridge', 'a'), alt: 'Ridge Observatory — viewing platform', span: 'full', ratio: '16 / 9' },
      { src: img('ridge', 'b'), alt: 'Ridge Observatory — long section', span: 'full', ratio: '2 / 1' },
      { src: img('ridge', 'c'), alt: 'Ridge Observatory — base chamber', span: 'half', ratio: '1 / 1' },
      { src: img('ridge', 'd'), alt: 'Ridge Observatory — study model', span: 'half', ratio: '1 / 1' },
    ],
    featured: false,
    order: 8,
    tone: 205,
  },
]

// ---------------------------------------------------------------------------
//  Selectors — small helpers so pages never manipulate the raw array directly.
// ---------------------------------------------------------------------------

export const allProjects = () => [...projects].sort((a, b) => a.order - b.order)

export const featuredProjects = () => allProjects().filter((p) => p.featured)

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)

export const adjacentProjects = (slug: string) => {
  const ordered = allProjects()
  const i = ordered.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: undefined, next: undefined }
  const prev = ordered[(i - 1 + ordered.length) % ordered.length]
  const next = ordered[(i + 1) % ordered.length]
  return { prev, next }
}

export interface Filter {
  discipline?: Discipline | 'all'
  track?: Track | 'all'
}

export const filterProjects = ({ discipline = 'all', track = 'all' }: Filter) =>
  allProjects().filter(
    (p) =>
      (discipline === 'all' || p.discipline === discipline) &&
      (track === 'all' || p.track === track),
  )
