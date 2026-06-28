import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Glyph } from './glyphs.jsx'

gsap.registerPlugin(ScrollTrigger)

/* domain-warped fbm marble — same technique as the soft hero, Hera's palette */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`
const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes;
  uniform vec3 uBase; uniform vec3 uFlow; uniform vec3 uHi;
  uniform float uSpeed; uniform float uGlow;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
  }
  float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.07; a*=0.5; } return v; }
  void main(){
    vec2 asp = vec2(uRes.x/uRes.y, 1.0);
    vec2 p = vUv * asp * 3.0;
    float t = uTime * uSpeed;
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));
    vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7,9.2)), fbm(p + 4.0*q + vec2(8.3,2.8)));
    float f = fbm(p + 4.0*r);
    float m = distance(vUv*asp, uMouse*asp);
    float glow = smoothstep(0.5, 0.0, m);
    vec3 col = uBase;
    col = mix(col, uFlow, smoothstep(0.42, 0.92, f) * 0.85);
    col = mix(col, uHi, smoothstep(0.82, 1.0, f*f) * 0.25);
    col += uFlow * glow * f * uGlow;
    float vig = smoothstep(1.25, 0.4, length(vUv-0.5)*1.6);
    col *= vig * 0.92 + 0.08;
    gl_FragColor = vec4(col, 1.0);
  }
`
const HERO_PAL = {
  base: [0.957, 0.937, 0.902], // warm ivory paper
  flow: [0.27, 0.49, 0.47],    // muted peacock-teal pigment
  hi: [0.80, 0.57, 0.44],      // terracotta bloom
  speed: 0.05,
  glow: 0.5,                   // the cursor reads like a wet brush
}

const PLANCHES = [
  { roman: 'I', kind: 'assiette', title: 'Service en grès', caption: 'présenté au calme' },
  { roman: 'II', kind: 'verre', title: 'Verrerie soufflée', caption: 'la lumière, retenue' },
  { roman: 'III', kind: 'centre', title: 'Centre de table', caption: 'fleurs de saison, sans bruit' },
  { roman: 'IV', kind: 'couvert', title: 'Couverts dorés', caption: 'le détail, à peine' },
  { roman: 'V', kind: 'carafe', title: 'Carafes & pichets', caption: 'verser, lentement' },
  { roman: 'VI', kind: 'decor', title: 'Décor de maison', caption: 'objets choisis' },
]

const PALETTE = ['assiette', 'verre', 'centre', 'bougie', 'couvert', 'serviette']
const PALETTE_LABELS = { assiette: 'assiette', verre: 'verre', centre: 'centre', bougie: 'bougie', couvert: 'couvert', serviette: 'serviette' }
const MARQUEE = 'l\u2019art de recevoir \u273A verrerie souffl\u00e9e \u273A gr\u00e8s \u273A centres de table \u273A d\u00e9coration \u273A Hammamet \u273A '

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* a word that arrives letter by letter */
function Letters({ text, immediate = false }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (prefersReduced()) { setOn(true); return }
    if (immediate) { const t = setTimeout(() => setOn(true), 280); return () => clearTimeout(t) }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { setOn(true); io.disconnect() } })
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [immediate])
  return (
    <span ref={ref} className={`h-letters ${on ? 'on' : ''}`}>
      {[...text].map((ch, i) => (
        <span key={i} style={{ transitionDelay: `${i * 0.028}s` }}>{ch === ' ' ? '\u00A0' : ch}</span>
      ))}
    </span>
  )
}

/* settle-in-on-scroll wrapper */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (prefersReduced()) { setShown(true); return }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { setShown(true); io.unobserve(el) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`h-reveal ${shown ? 'is-in' : ''} ${className}`}
      style={shown ? { transitionDelay: `${delay / 1000}s` } : undefined} {...rest}>
      {children}
    </Tag>
  )
}

export default function Hera() {
  const rootRef = useRef(null)
  const navRef = useRef(null)
  const heroRef = useRef(null)
  const washRef = useRef(null)
  const glowRef = useRef(null)
  const marqueeRef = useRef(null)
  const tableRef = useRef(null)

  const [placed, setPlaced] = useState([])
  const [dragId, setDragId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [intro, setIntro] = useState(() => !prefersReduced())
  const introRef = useRef(null)
  const drag = useRef({ id: null, offX: 0, offY: 0 })
  const idc = useRef(1)

  /* ---- opening curtain: settles in, then lifts to reveal the hero ---- */
  useEffect(() => {
    if (!intro) return
    const root = introRef.current
    if (!root) return
    document.documentElement.style.overflow = 'hidden'
    const orn = root.querySelector('.h-intro-orn')
    const word = root.querySelector('.h-intro-word')
    const sub = root.querySelector('.h-intro-sub')
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = ''
        setIntro(false)
        ScrollTrigger.refresh()
      },
    })
    tl.fromTo(orn, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.25)
    tl.fromTo(word, { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: 'power3.out' }, 0.35)
    tl.fromTo(sub, { opacity: 0, letterSpacing: '0.5em' }, { opacity: 0.7, letterSpacing: '0.34em', duration: 0.7, ease: 'power2.out' }, '-=0.5')
    tl.to([orn, word, sub], { opacity: 0, y: -14, duration: 0.45, ease: 'power2.in' }, '+=0.75')
    tl.to(root, { yPercent: -100, duration: 0.85, ease: 'power3.inOut' }, '-=0.1')
    return () => { tl.kill(); document.documentElement.style.overflow = '' }
  }, [intro])

  /* ---- Lenis smooth scroll, wired into ScrollTrigger ---- */
  useEffect(() => {
    if (prefersReduced()) return
    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  /* ---- nav: frost on scroll ---- */
  useEffect(() => {
    const onScroll = () => {
      const nav = navRef.current
      if (!nav) return
      nav.classList.toggle('is-stuck', window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---- hero marble wash (domain-warped fbm, Three.js) ---- */
  useEffect(() => {
    const mount = washRef.current
    if (!mount) return
    const reduced = prefersReduced()

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uRes: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
      uBase: { value: new THREE.Vector3(...HERO_PAL.base) },
      uFlow: { value: new THREE.Vector3(...HERO_PAL.flow) },
      uHi: { value: new THREE.Vector3(...HERO_PAL.hi) },
      uSpeed: { value: HERO_PAL.speed },
      uGlow: { value: HERO_PAL.glow },
    }
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
    )
    scene.add(quad)

    const target = new THREE.Vector2(0.5, 0.55)
    const onMove = (e) => target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    window.addEventListener('pointermove', onMove)

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      uniforms.uRes.value.set(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    let raf = null
    const clock = new THREE.Clock()
    const loop = () => {
      uniforms.uTime.value = clock.getElapsedTime()
      uniforms.uMouse.value.lerp(target, 0.06)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) { renderer.render(scene, camera); return }
      if (entry.isIntersecting && raf === null) loop()
      else if (!entry.isIntersecting && raf !== null) { cancelAnimationFrame(raf); raf = null }
    })
    io.observe(mount)

    return () => {
      io.disconnect()
      if (raf !== null) cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      quad.geometry.dispose()
      quad.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  /* ---- GSAP / ScrollTrigger motion layer ---- */
  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context((self) => {
      // hero parallax — the wash drifts down, the words rise & soften as you leave
      gsap.to('.h-wash', {
        yPercent: 16, ease: 'none',
        scrollTrigger: { trigger: '.h-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.h-hero-inner', {
        yPercent: -14, opacity: 0.55, ease: 'none',
        scrollTrigger: { trigger: '.h-hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      // the ✺ marquee scrolls forever, and nudges with scroll velocity
      const mq = marqueeRef.current
      if (mq) {
        gsap.to(mq, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 })
      }

      // gilded rules draw themselves across on enter
      self.selector('.h-gild').forEach((el) => {
        gsap.fromTo(el, { scaleX: 0 }, {
          scaleX: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })

      // collection: planches lift in, stagger, with a whisper of rotation
      ScrollTrigger.batch('.h-figure', {
        start: 'top 88%',
        onEnter: (batch) => gsap.fromTo(batch,
          { opacity: 0, y: 48, rotateZ: -1.5 },
          { opacity: 1, y: 0, rotateZ: 0, duration: 0.95, ease: 'power3.out', stagger: 0.12, overwrite: true }),
      })
      gsap.set('.h-figure', { opacity: 0 })

      // plate art floats gently, forever
      self.selector('.h-plate svg').forEach((el, i) => {
        gsap.to(el, { y: 9, duration: 3 + (i % 3) * 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.25 })
      })

      // drifting ornaments — slow parallax + float
      self.selector('.h-drift span').forEach((el, i) => {
        const dir = i % 2 ? 1 : -1
        gsap.to(el, { y: dir * 26, x: dir * -14, rotation: dir * 18, duration: 7 + i, ease: 'sine.inOut', repeat: -1, yoyo: true })
        gsap.to(el, {
          yPercent: dir * 60, ease: 'none',
          scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      // the blockquote's accent bar grows from the top
      const bar = self.selector('.h-quote-col .bar')[0]
      if (bar) {
        gsap.fromTo(bar, { scaleY: 0, transformOrigin: '50% 0%' }, {
          scaleY: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: bar, start: 'top 85%' },
        })
      }

      // info rows tick in one by one
      gsap.utils.toArray('.h-rows .h-row, .h-info-rows .h-row').forEach((row, i) => {
        gsap.fromTo(row, { opacity: 0, x: -16 }, {
          opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: (i % 3) * 0.08,
          scrollTrigger: { trigger: row, start: 'top 92%' },
        })
      })

      // palette chips bounce in
      gsap.fromTo('.h-chip', { opacity: 0, y: 20, scale: 0.9 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.06,
        scrollTrigger: { trigger: '.h-palette', start: 'top 85%' },
      })

      ScrollTrigger.refresh()
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const onHeroMove = (e) => {
    const hero = heroRef.current
    if (!hero || !glowRef.current) return
    const r = hero.getBoundingClientRect()
    glowRef.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
  }

  /* ---- dresser la table: drag to place ---- */
  const clampToTable = (x, y) => {
    const half = 34
    const r = tableRef.current ? tableRef.current.getBoundingClientRect() : { width: 400, height: 400 }
    return { x: Math.max(half, Math.min(r.width - half, x)), y: Math.max(half, Math.min(r.height - half, y)) }
  }

  const onMove = useCallback((e) => {
    const d = drag.current
    if (!d.id || !tableRef.current) return
    const r = tableRef.current.getBoundingClientRect()
    const p = clampToTable(e.clientX - r.left - d.offX, e.clientY - r.top - d.offY)
    setPlaced((prev) => prev.map((it) => (it.id === d.id ? { ...it, x: p.x, y: p.y } : it)))
  }, [])

  const onUp = useCallback(() => {
    drag.current.id = null
    setDragId(null)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }, [onMove])

  const bind = useCallback(() => {
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [onMove, onUp])

  useEffect(() => () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }, [onMove, onUp])

  const onPaletteDown = (kind) => (e) => {
    e.preventDefault()
    if (!tableRef.current) return
    const r = tableRef.current.getBoundingClientRect()
    const p = clampToTable(e.clientX - r.left, e.clientY - r.top)
    const id = 'p' + idc.current++
    drag.current = { id, offX: 0, offY: 0 }
    setDragId(id)
    setPlaced((prev) => [...prev, { id, kind, x: p.x, y: p.y, z: 50 + prev.length }])
    bind()
  }

  const onPlacedDown = (id) => (e) => {
    e.preventDefault(); e.stopPropagation()
    const it = placed.find((p) => p.id === id)
    if (!it || !tableRef.current) return
    const r = tableRef.current.getBoundingClientRect()
    drag.current = { id, offX: (e.clientX - r.left) - it.x, offY: (e.clientY - r.top) - it.y }
    setDragId(id)
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, z: 200 } : p)))
    bind()
  }

  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true) }

  return (
    <div className="h-root" ref={rootRef}>
      <div className="h-grain" aria-hidden="true" />

      <nav className="h-nav" ref={navRef}>
        <a className="h-brand" href="#top">
          <span className="h-brand-name">Hera</span>
          <span className="h-brand-tag">art de la table</span>
        </a>
        <div className="h-nav-links">
          <a href="#collection">La collection</a>
          <a href="#dresser">Dresser la table</a>
          <a href="#recevoir">L'art de recevoir</a>
          <a className="h-nav-cta" href="#contact">Nous contacter</a>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="h-hero" id="top" ref={heroRef} onPointerMove={onHeroMove}>
        <div className="h-wash" ref={washRef} aria-hidden="true" />
        <div className="h-glow" ref={glowRef} aria-hidden="true" />

        <div className="h-margin h-margin-l" aria-hidden="true">№ 01 — la table</div>
        <div className="h-margin h-margin-r" aria-hidden="true">set in Fraunces &amp; Jost</div>
        <div className="h-margin h-margin-b" aria-hidden="true">pigment · ivoire — sauge — or</div>

        <div className="h-hero-inner">
          <div className="h-kicker"><span className="star">✺</span> Hammamet · 10h—20h</div>
          <h1>
            <span className="line"><Letters text="L'art de" immediate /></span>
            <span className="h-underline-wrap">
              <Letters text="recevoir" immediate /><span>.</span>
              <svg className="h-underline draw" viewBox="0 0 340 34" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="heraStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#B5893C" />
                    <stop offset="0.6" stopColor="#437E79" />
                    <stop offset="1" stopColor="#2E605E" />
                  </linearGradient>
                </defs>
                <path d="M4 22 C 60 8, 120 30, 178 18 S 300 6, 336 16" />
              </svg>
            </span>
          </h1>
          <p className="h-hero-echo">the art of receiving — kept warm, kept calm.</p>
          <p className="h-hero-lede">Verrerie soufflée, grès et pièces de centre — réunis à Hammamet pour celles et ceux qui aiment dresser une belle table.</p>
          <div className="h-hero-cta">
            <a className="h-btn h-btn-solid" href="#collection">Voir la collection</a>
            <a className="h-btn h-btn-ghost" href="#contact">Nous rendre visite</a>
          </div>
        </div>

        <div className="h-scroll-hint" aria-hidden="true">
          <span>défiler, doucement</span>
          <span className="h-scroll-bar" />
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="h-marquee" aria-hidden="true">
        <div className="h-marquee-track" ref={marqueeRef}>
          <span>{MARQUEE.repeat(2)}</span>
          <span>{MARQUEE.repeat(2)}</span>
        </div>
      </div>

      {/* ---------- LA COLLECTION ---------- */}
      <section className="h-section" id="collection">
        <div className="h-drift" aria-hidden="true"><span>✺</span><span>❧</span><span>✺</span></div>
        <div className="h-wrap h-layer">
          <div className="h-coll-head">
            <div>
              <div className="h-eyebrow">№ 02 — la collection</div>
              <h2 className="h-h2"><Letters text="La collection" /></h2>
              <span className="h-gild" aria-hidden="true" />
            </div>
            <p className="h-coll-note">Chaque pièce présentée comme une planche — encadrée, posée, présentée au calme.<br /><em>presented like prints.</em></p>
          </div>

          <div className="h-planche-rule">
            <span className="from">planche 01</span>
            <span className="dash" />
            <span>06</span>
          </div>

          <div className="h-grid">
            {PLANCHES.map((p) => (
              <figure className="h-figure" key={p.roman}>
                <div className="h-mat">
                  <div className="h-plate">
                    <span className="roman">planche {p.roman}</span>
                    <Glyph kind={p.kind} size={96} />
                    <span className="stub">photographie à venir</span>
                  </div>
                </div>
                <figcaption className="h-cap">
                  <span className="tag">planche {p.roman}</span>
                  <h3>{p.title}</h3>
                  <p>{p.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- DRESSER LA TABLE ---------- */}
      <section className="h-section h-dresser" id="dresser">
        <div className="h-wrap" style={{ maxWidth: 1120 }}>
          <Reveal className="h-dresser-head">
            <div className="h-eyebrow">№ 03 — dresser la table</div>
            <h2 className="h-h2">Composez votre dressage</h2>
            <span className="h-gild h-gild-c" aria-hidden="true" />
            <p>Glissez les pièces sur la nappe, arrangez-les à votre goût.<br /><em>arrange your own setting — then ask us to lay it for you.</em></p>
          </Reveal>

          <div className="h-palette">
            {PALETTE.map((kind) => (
              <button type="button" className="h-chip" key={kind} onPointerDown={onPaletteDown(kind)}>
                <span><Glyph kind={kind} size={44} /></span>
                <span className="label">{PALETTE_LABELS[kind]}</span>
              </button>
            ))}
          </div>

          <div className="h-table" ref={tableRef}>
            <div className="h-table-weave" aria-hidden="true" />
            <div className="h-table-runner" aria-hidden="true" />
            {placed.length === 0 && <div className="h-table-empty">déposez les pièces ici · ❧</div>}
            {placed.map((it) => (
              <div
                key={it.id}
                className="h-placed"
                onPointerDown={onPlacedDown(it.id)}
                style={{
                  transform: `translate3d(${it.x - 30}px, ${it.y - 30}px, 0)`,
                  zIndex: it.z || 1,
                  transition: dragId === it.id ? 'none' : 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <span><Glyph kind={it.kind} size={60} /></span>
              </div>
            ))}
          </div>

          <Reveal className="h-dresser-foot">
            <button type="button" className="h-clear" onClick={() => setPlaced([])}>↺ tout retirer</button>
            <a className="h-btn h-btn-gold" href="#contact">Demander ce dressage</a>
          </Reveal>
        </div>
      </section>

      {/* ---------- L'ART DE RECEVOIR ---------- */}
      <section className="h-section h-recevoir" id="recevoir">
        <div className="h-drift" aria-hidden="true"><span>❧</span><span>✺</span></div>
        <div className="h-wrap h-recevoir-grid h-layer" style={{ maxWidth: 1120 }}>
          <Reveal>
            <div className="h-eyebrow">№ 04 — l'art de recevoir</div>
            <div className="h-fleuron">❧</div>
            <h2 className="h-h2">Hera, reine des festins</h2>
            <span className="h-gild" aria-hidden="true" />
            <p>Dans la mythologie, Hera ⚜ règne sur le mariage et l'hospitalité — celle qui accueille, qui réunit, qui fait d'un repas une cérémonie. Notre boutique porte son nom comme une promesse&nbsp;: recevoir avec grâce.</p>
            <p>À Hammamet, au-dessus de Cuisina, nous choisissons chaque verre, chaque assiette, chaque pièce de centre pour la table que vous voulez offrir.</p>
          </Reveal>
          <Reveal delay={160} className="h-quote-col">
            <span className="bar" aria-hidden="true" />
            <blockquote className="h-blockquote">« Une table bien dressée est déjà une forme d'<span className="hi">accueil</span>. »</blockquote>
            <div className="h-rows">
              <div className="h-row"><span>Adresse</span><span className="val">Hammamet · au-dessus de Cuisina</span></div>
              <div className="h-row"><span>Heures</span><span className="val">10h — 20h</span></div>
              <div className="h-row"><span>Instagram</span><span className="val teal">@heragoddesstn</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section className="h-section h-contact" id="contact">
        <div className="h-wrap" style={{ maxWidth: 1080 }}>
          <Reveal className="h-contact-head">
            <div className="orn">— ❧ —</div>
            <h2 className="h-h2">Nous contacter</h2>
            <p className="sub">une visite · un dressage · une occasion</p>
          </Reveal>

          <div className="h-contact-grid">
            <Reveal>
              {submitted ? (
                <div className="h-thanks">
                  <p className="big">Merci. ✺</p>
                  <p className="small">Nous vous répondrons bientôt — votre table vous attend.</p>
                  <button type="button" onClick={() => setSubmitted(false)}>écrire à nouveau</button>
                </div>
              ) : (
                <form className="h-form" onSubmit={onSubmit}>
                  <label className="h-field">
                    <span>Votre nom</span>
                    <input type="text" required placeholder="Nom &amp; prénom" />
                  </label>
                  <label className="h-field">
                    <span>L'occasion</span>
                    <input type="text" placeholder="dîner, mariage, vitrine…" />
                  </label>
                  <label className="h-field">
                    <span>Votre message</span>
                    <textarea rows="3" placeholder="dites-nous tout…" />
                  </label>
                  <button type="submit" className="h-btn h-btn-gold">Envoyer · nous écrire</button>
                </form>
              )}
            </Reveal>

            <Reveal delay={140} className="h-info">
              <div className="h-map">
                <div className="grid" aria-hidden="true" />
                <div className="pin">
                  <i />
                  <span>36.40°N · 10.61°E</span>
                </div>
              </div>
              <div className="h-info-rows">
                <div className="h-row"><span>Heures</span><span className="val">10h — 20h</span></div>
                <div className="h-row"><span>Adresse</span><span className="val">Hammamet · au-dessus de Cuisina</span></div>
                <div className="socials">
                  <a href="https://instagram.com/heragoddesstn" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                  <a href="https://www.facebook.com/profile.php?id=100090690722403" target="_blank" rel="noopener noreferrer">Facebook ↗</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="h-footer">
        <div className="h-wrap" style={{ maxWidth: 1120 }}>
          <Reveal as="h2">À bientôt, à&nbsp;table.</Reveal>
          <Reveal as="p" className="h-rumor">
            reçue comme une déesse
            <svg viewBox="0 0 220 12" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 7 Q 18 2, 34 7 T 66 7 T 98 7 T 130 7 T 162 7 T 194 7 T 218 7" fill="none" stroke="#B5893C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Reveal>
          <div className="h-footer-meta">
            <span>10h — 20h</span>
            <span>Hammamet · au-dessus de Cuisina</span>
            <span className="teal">@heragoddesstn</span>
            <span>© 2026 Hera ✺</span>
          </div>
        </div>
      </footer>

      {intro && (
        <div className="h-intro" ref={introRef} aria-hidden="true">
          <div className="h-intro-stack">
            <span className="h-intro-orn">✺</span>
            <span className="h-intro-word">à table.</span>
            <span className="h-intro-sub">Hera · l'art de recevoir</span>
          </div>
        </div>
      )}
    </div>
  )
}
