// HERA — hand-drawn line-art glyphs for the table pieces.
// Brand-locked stroke colors so they read the same wherever they're placed.
const INK = '#2B2722'
const TEAL = '#437E79'
const GOLD = '#B5893C'

const base = { fill: 'none', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function Glyph({ kind, size = 60 }) {
  const common = { width: size, height: size, viewBox: '0 0 72 72', style: { display: 'block' } }
  switch (kind) {
    case 'assiette':
      return (
        <svg {...common}>
          <circle cx="36" cy="36" r="25" {...base} stroke={INK} />
          <circle cx="36" cy="36" r="17" {...base} stroke={GOLD} strokeOpacity="0.75" />
        </svg>
      )
    case 'verre':
      return (
        <svg {...common}>
          <path d="M25 14 H47 L43 33 Q36 39 29 33 Z" {...base} stroke={INK} />
          <path d="M36 39 V55 M28 56 H44" {...base} stroke={INK} />
        </svg>
      )
    case 'centre':
      return (
        <svg {...common}>
          <path d="M27 32 H45 L42 47 Q36 52 30 47 Z" {...base} stroke={TEAL} />
          <path d="M36 32 C33 23 28 19 24 16 M36 32 C39 23 44 19 48 16 M36 32 V13" {...base} stroke={TEAL} />
        </svg>
      )
    case 'bougie':
      return (
        <svg {...common}>
          <rect x="31" y="24" width="10" height="30" rx="2" {...base} stroke={INK} />
          <path d="M36 24 V16" {...base} stroke={INK} />
          <path d="M36 10 q4 4 0 7 q-4 -3 0 -7 Z" {...base} stroke={GOLD} fill={GOLD} fillOpacity="0.5" />
          <path d="M27 55 H45" {...base} stroke={INK} />
        </svg>
      )
    case 'couvert':
      return (
        <svg {...common}>
          <path d="M29 17 V55 M25 17 V27 M33 17 V27" {...base} stroke={INK} />
          <path d="M45 17 C40 19 40 31 45 33 V55" {...base} stroke={INK} />
        </svg>
      )
    case 'serviette':
      return (
        <svg {...common}>
          <path d="M21 22 H51 V52 H21 Z" {...base} stroke={TEAL} />
          <path d="M21 22 L36 37 L51 22 M30 52 V41" {...base} stroke={TEAL} />
        </svg>
      )
    case 'carafe':
      return (
        <svg {...common}>
          <path d="M31 13 H41 V22 C49 27 49 38 49 44 C49 53 43 57 36 57 C29 57 23 53 23 44 C23 38 23 27 31 22 Z" {...base} stroke={INK} />
          <path d="M27 40 H45" {...base} stroke={GOLD} strokeOpacity="0.7" />
        </svg>
      )
    case 'decor':
      return (
        <svg {...common}>
          <path d="M28 30 C24 40 26 52 36 56 C46 52 48 40 44 30 Z" {...base} stroke={TEAL} />
          <path d="M30 30 Q36 22 42 30" {...base} stroke={TEAL} />
          <circle cx="36" cy="20" r="4" {...base} stroke={GOLD} />
        </svg>
      )
    default:
      return <svg {...common} />
  }
}
