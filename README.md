# HERA — art de la table & décoration

A preview / proposition site for **Hera** (@heragoddesstn), a tableware & decoration
boutique in Hammamet, Tunisia (au-dessus de Cuisina · 10h–20h).

Warm, quiet, editorial — *l'art de recevoir*. Bilingual FR/EN.

## Stack
- Vite + React 18
- Three.js — domain-warped fbm "marble" hero shader
- GSAP + ScrollTrigger — scroll choreography, reveals, parallax
- Lenis — smooth scroll
- Google Fonts: Fraunces (italic display) · Jost (body) · Spline Sans Mono (labels)

## Design
- Warm ivory paper, gold + muted peacock-teal accents, terracotta bloom (OKLCH, `--h-` tokens)
- Opening curtain intro, flowing marble hero, ✺ marquee, framed-print collection
- "Dresser la table" — drag pieces to compose a place setting
- Stationery-grade inquiry form
- Honors `prefers-reduced-motion`; WebGL loop is IntersectionObserver-paused with full cleanup

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

> Verify motion in a real browser tab — preview panels can freeze requestAnimationFrame.

## Notes
- Collection cards use line-art placeholders ("photographie à venir"); drop in real
  product photos at `.h-plate` when available.
