"use client"
import { useEffect, useRef, useCallback } from "react"
import type { CanvasElement } from "@/types"
import { getBoundingBox, getHandles } from "@/lib/geometry"

function drawArrow(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) {
  const headLen = 16
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(to.x, to.y)
  ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

export function drawElement(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.save()
  ctx.strokeStyle = el.color
  ctx.fillStyle = el.color
  ctx.lineWidth = el.strokeWidth
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  switch (el.type) {
    case "freedraw": {
      if (el.points.length < 2) break
      ctx.beginPath()
      ctx.moveTo(el.points[0].x, el.points[0].y)
      for (let i = 1; i < el.points.length - 1; i++) {
        const mx = (el.points[i].x + el.points[i + 1].x) / 2
        const my = (el.points[i].y + el.points[i + 1].y) / 2
        ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, mx, my)
      }
      ctx.stroke()
      break
    }
    case "line": {
      if (el.points.length < 2) break
      const [s, e] = [el.points[0], el.points[el.points.length - 1]]
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke()
      break
    }
    case "rect": {
      if (el.points.length < 2) break
      const [a, b] = [el.points[0], el.points[el.points.length - 1]]
      ctx.beginPath()
      ctx.roundRect(a.x, a.y, b.x - a.x, b.y - a.y, 4)
      ctx.stroke()
      break
    }
    case "circle": {
      if (el.points.length < 2) break
      const [c, r] = [el.points[0], el.points[el.points.length - 1]]
      const rx = Math.abs(r.x - c.x) / 2
      const ry = Math.abs(r.y - c.y) / 2
      const cx = c.x + (r.x - c.x) / 2
      const cy = c.y + (r.y - c.y) / 2
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke()
      break
    }
    case "arrow": {
      if (el.points.length < 2) break
      drawArrow(ctx, el.points[0], el.points[el.points.length - 1])
      break
    }
    case "text": {
      if (!el.text || el.x == null || el.y == null) break
      const fontSize = el.strokeWidth * 8 + 12
      ctx.font = `${fontSize}px 'DM Sans', sans-serif`
      ctx.fillStyle = el.color
      ctx.fillText(el.text, el.x, el.y)
      break
    }
  }
  ctx.restore()
}

export function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
) {
  const box = getBoundingBox(el)
  const handles = getHandles(box)

  ctx.save()

  // Dashed selection rect
  ctx.strokeStyle = "#7c6aff"
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4])
  ctx.shadowColor = "#7c6aff"
  ctx.shadowBlur = 6
  ctx.strokeRect(box.x - 4, box.y - 4, box.width + 8, box.height + 8)
  ctx.setLineDash([])
  ctx.shadowBlur = 0

  // Handles
  const HS = 7
  Object.values(handles).forEach((pt) => {
    // Outer circle (accent)
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, HS, 0, Math.PI * 2)
    ctx.fillStyle = "#7c6aff"
    ctx.fill()
    // Inner dot (white)
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, HS - 3, 0, Math.PI * 2)
    ctx.fillStyle = "#fff"
    ctx.fill()
  })

  ctx.restore()
}

export function useCanvas(elements: CanvasElement[], selectedId?: string | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const redraw = useCallback((extra?: CanvasElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dot-grid
    ctx.fillStyle = "rgba(255,255,255,0.04)"
    const spacing = 28
    for (let x = 0; x < canvas.width; x += spacing)
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
      }

    elements.forEach(el => {
      drawElement(ctx, el)
      if (el.id === selectedId) drawSelectionOverlay(ctx, el)
    })

    if (extra) drawElement(ctx, extra)
  }, [elements, selectedId])

  useEffect(() => {
    let id: number

    const renderLoop = () => {
      redraw()
      id = requestAnimationFrame(renderLoop)
    }

    id = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(id)
  }, [redraw])

  return { canvasRef, redraw }
}
