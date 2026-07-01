// HERA — catalogue. Prices in Tunisian Dinar (DT / TND).
// Products mirror the real collections photographed on @heragoddesstn.
// `image` points at a local file in /public/hera/ig (downloaded from Instagram,
// so it doesn't rely on Instagram's expiring CDN links). `kind` is the
// line-art glyph used as a fallback if the photo ever fails to load.

export const CURRENCY = 'DT'
export const formatPrice = (n) => `${new Intl.NumberFormat('fr-TN').format(n)} ${CURRENCY}`

// WhatsApp business line for orders. Replace with Hera's real number
// (international format, no "+", no spaces). e.g. 21620123456 for Tunisia.
export const WHATSAPP = '21600000000'

export const CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'assiette', label: 'Assiettes & plats' },
  { id: 'verre', label: 'Verrerie' },
  { id: 'centre', label: 'Centres & présentoirs' },
  { id: 'carafe', label: 'Pichets & rafraîchisseurs' },
  { id: 'decor', label: 'Floral & déco' },
]

export const CATEGORY_LABEL = CATEGORIES.reduce((m, c) => ((m[c.id] = c.label), m), {})

export const PRODUCTS = [
  {
    id: 'evasion-assiettes-poisson',
    name: 'Assiettes poisson · Évasion Estivale',
    category: 'assiette',
    kind: 'assiette',
    image: '/hera/ig/ig-01.jpg',
    price: 45,
    unit: 'la pièce',
    materials: 'Céramique peinte main · formes poisson',
    blurb: 'Invoquez l’esprit de l’été. Des assiettes en forme de poisson, rayées et écaillées de bleus et de jaunes — la Méditerranée, dressée.',
  },
  {
    id: 'evasion-plats-sardines',
    name: 'Plats à poisson & sardines',
    category: 'assiette',
    kind: 'assiette',
    image: '/hera/ig/ig-03.jpg',
    price: 72,
    unit: 'la pièce',
    materials: 'Céramique · plats de service longs',
    blurb: 'Les longs plats sardine et les grands poissons de service — pour présenter mezzés, poissons et antipasti avec le sourire.',
  },
  {
    id: 'citrus-service',
    name: 'Service Citrus Brandani',
    category: 'assiette',
    kind: 'assiette',
    image: '/hera/ig/ig-04.jpg',
    price: 85,
    unit: 'la pièce',
    materials: 'Mélamine décor majolique · citrons',
    blurb: 'L’esprit de la Méditerranée s’invite à table : décor majolique turquoise, citrons et volutes. Résistant, élégant, pour dedans comme dehors.',
  },
  {
    id: 'evasion-verres-etoile',
    name: 'Verres colorés & plats étoile',
    category: 'verre',
    kind: 'verre',
    image: '/hera/ig/ig-02.jpg',
    price: 32,
    unit: 'la pièce',
    materials: 'Verre nervuré teinté · plats étoile de mer',
    blurb: 'Des gobelets nervurés dans des teintes marines et corail, à marier aux plats étoile de mer. La table d’été qui ne se prend pas au sérieux.',
  },
  {
    id: 'citrus-verres-rafraichisseur',
    name: 'Verres nervurés & rafraîchisseur · Citrus',
    category: 'verre',
    kind: 'verre',
    image: '/hera/ig/ig-05.jpg',
    price: 46,
    unit: 'la pièce',
    materials: 'Verre côtelé ambre & vert · rafraîchisseur assorti',
    blurb: 'Les verres côtelés ambre et vert du service Citrus, avec leur rafraîchisseur à bouteille assorti. Verser, lentement, à l’ombre.',
  },
  {
    id: 'presentoirs-verre',
    name: 'Présentoirs en verre texturé',
    category: 'centre',
    kind: 'centre',
    image: '/hera/ig/ig-07.jpg',
    price: 74,
    unit: 'la pièce',
    materials: 'Verre soufflé texturé · vert & ambre',
    blurb: 'Des présentoirs sur pied au verre finement strié — pour surélever un gâteau, des pâtisseries ou quelques fruits. La lumière s’y accroche.',
  },
  {
    id: 'garden-pichet-gobelets',
    name: 'Pichet & gobelets · jardin fleuri',
    category: 'carafe',
    kind: 'carafe',
    image: '/hera/ig/ig-08.jpg',
    price: 58,
    unit: 'la pièce',
    materials: 'Verre embossé · motif feuillage',
    blurb: 'Le pichet embossé et ses grands verres feuillage, dressés sur la nappe hortensia. Une table de printemps, au jardin.',
  },
  {
    id: 'printemps-cafetiere-tasses',
    name: 'Cafetière & tasses fleuries',
    category: 'decor',
    kind: 'decor',
    image: '/hera/ig/ig-06.jpg',
    price: 68,
    unit: 'le service',
    materials: 'Porcelaine · décor hortensia',
    blurb: 'La cafetière italienne et ses tasses assorties, décor hortensia. Le petit-déjeuner devient une douceur de saison.',
  },
  {
    id: 'garden-joy-tasse',
    name: 'Tasse & sous-tasse Garden Joy',
    category: 'decor',
    kind: 'decor',
    image: '/hera/ig/ig-09.jpg',
    price: 34,
    unit: 'la pièce',
    materials: 'Porcelaine fine · liseré or · roses',
    blurb: 'Roses anglaises, liseré doré, fond rose poudré. Une tasse à thé qui transforme la pause en petite cérémonie.',
  },
  {
    id: 'garden-joy-service',
    name: 'Service à café Garden Joy',
    category: 'decor',
    kind: 'decor',
    image: '/hera/ig/ig-10.jpg',
    price: 96,
    unit: 'le service',
    materials: 'Porcelaine fine · liseré or · roses',
    blurb: 'Le service complet Garden Joy — mugs et tasses fleuris cerclés d’or. Offert, ou gardé pour les matins qui comptent.',
  },
]

export const PRODUCT_BY_ID = PRODUCTS.reduce((m, p) => ((m[p.id] = p), m), {})

// A representative piece for each drag-palette kind (used by "Dresser la table").
export const productByKind = (kind) => PRODUCTS.find((p) => p.kind === kind) || null
