import { useEffect, useRef, useCallback } from 'react'

/* A dashed curve + arrowhead drawn from the cursor toward a target element
   (a CTA button). Adapted from the shadcn "dynamic-hero" canvas effect to
   Hera's plain-JSX + scoped-CSS stack. Draws only while the target is on
   screen, on fine pointers, and respects prefers-reduced-motion. */

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Hera gold (#B5893C) — matches the hero underline gradient.
const GOLD = { r: 181, g: 137, b: 60 }

export default function CursorArrow({ targetRef, color = GOLD }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const mouseRef = useRef({ x: null, y: null })
  const rafRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const target = targetRef.current
    const ctx = ctxRef.current
    if (!canvas || !target || !ctx) return

    const { x: x0, y: y0 } = mouseRef.current
    if (x0 === null || y0 === null) return

    const rect = target.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    // Only draw while the button is actually within the viewport.
    if (cx < 0 || cx > window.innerWidth || cy < 0 || cy > window.innerHeight) return

    const a = Math.atan2(cy - y0, cx - x0)
    const x1 = cx - Math.cos(a) * (rect.width / 2 + 12)
    const y1 = cy - Math.sin(a) * (rect.height / 2 + 12)

    const midX = (x0 + x1) / 2
    const midY = (y0 + y1) / 2
    const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5)
    const t = Math.max(-1, Math.min(1, (y0 - y1) / 200))
    const controlX = midX
    const controlY = midY + offset * t

    const r = Math.hypot(x1 - x0, y1 - y0)
    const opacity = Math.min(0.85, (r - Math.max(rect.width, rect.height) / 2) / 500)
    if (opacity <= 0.02) return

    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
    ctx.lineWidth = 2

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.quadraticCurveTo(controlX, controlY, x1, y1)
    ctx.setLineDash([10, 5])
    ctx.stroke()
    ctx.restore()

    const angle = Math.atan2(y1 - controlY, x1 - controlX)
    const headLength = 10 * (ctx.lineWidth / 1.5)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - headLength * Math.cos(angle - Math.PI / 6), y1 - headLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - headLength * Math.cos(angle + Math.PI / 6), y1 - headLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }, [targetRef, color])

  useEffect(() => {
    if (prefersReduced()) return
    if (!window.matchMedia('(pointer: fine)').matches) return // skip touch devices

    const canvas = canvasRef.current
    if (!canvas) return
    ctxRef.current = canvas.getContext('2d')
    const ctx = ctxRef.current

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const move = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }

    window.addEventListener('resize', size)
    window.addEventListener('mousemove', move)
    size()

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('resize', size)
      window.removeEventListener('mousemove', move)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [draw])

  return <canvas ref={canvasRef} className="h-cursor-arrow" aria-hidden="true" />
}
