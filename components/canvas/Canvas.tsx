"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import type { Tool, CanvasElement } from "@/types"
import { generateId, getCanvasPoint } from "@/lib/utils"
import { drawElement } from "@/hooks/useCanvas"
import { useSelection } from "@/hooks/useSelection"
import { useTouchHandlers, type SyntheticPointer } from "@/hooks/useTouch"
import {
  getHitElement, getHitHandle, getBoundingBox, getHandles,
  resizeElement, handleCursor,
} from "@/lib/geometry"

interface CanvasProps {
  elements: CanvasElement[]
  remoteElements?: CanvasElement[]
  setElements: (action: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[]), overwrite?: boolean) => void
  tool: Tool
  color: string
  strokeWidth: number
  onSelectElement?: (id: string | null) => void
  onDrawStart?: (el: CanvasElement) => void
  onDrawUpdate?: (el: CanvasElement) => void
  onDrawEnd?: (el: CanvasElement) => void
  onElementsChange?: (els: CanvasElement[]) => void
  onCursorMove?: (x: number, y: number) => void
  onCursorLeave?: () => void
}

function drawSelectionOverlay(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  const box = getBoundingBox(el)
  const handles = getHandles(box)
  ctx.save()
  ctx.strokeStyle = "#7c6aff"
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4])
  ctx.shadowColor = "#7c6aff"
  ctx.shadowBlur = 8
  ctx.strokeRect(box.x - 4, box.y - 4, box.width + 8, box.height + 8)
  ctx.setLineDash([])
  ctx.shadowBlur = 0
  Object.values(handles).forEach((pt) => {
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2)
    ctx.fillStyle = "#7c6aff"; ctx.fill()
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = "#fff"; ctx.fill()
  })
  ctx.restore()
}

export default function Canvas({
  elements, remoteElements = [], setElements, tool, color, strokeWidth,
  onSelectElement, onDrawStart, onDrawUpdate, onDrawEnd, onElementsChange,
  onCursorMove, onCursorLeave,
}: CanvasProps) {
  const { selection, select, deselect, startDrag, startResize, stopInteraction } = useSelection()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>()
  const drawThrottleRef = useRef<number>(0)

  const [isDrawing, setIsDrawing] = useState(false)
  const [currentEl, setCurrentEl] = useState<CanvasElement | null>(null)
  const [cursor, setCursor] = useState("crosshair")
  const [textInput, setTextInput] = useState<{
    x: number; y: number; canvasX: number; canvasY: number; visible: boolean
  }>({ x: 0, y: 0, canvasX: 0, canvasY: 0, visible: false })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const textRef = useRef<HTMLInputElement>(null)

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current; if (!c) return
      c.width = window.innerWidth; c.height = window.innerHeight
    }
    resize(); window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  useEffect(() => { onSelectElement?.(selection.elementId) }, [selection.elementId, onSelectElement])

  // ── Optimised draw loop with rAF ──────────────────────────
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current; if (!canvas) return
      const ctx = canvas.getContext("2d"); if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dot grid — only draw visible portion
      ctx.fillStyle = "rgba(255,255,255,0.04)"
      const sp = 28
      for (let x = 0; x < canvas.width; x += sp)
        for (let y = 0; y < canvas.height; y += sp) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
        }

      elements.forEach(el => {
        drawElement(ctx, el)
        if (el.id === selection.elementId) drawSelectionOverlay(ctx, el)
      })

      // Remote in-progress strokes at reduced opacity
      if (remoteElements.length > 0) {
        ctx.save(); ctx.globalAlpha = 0.65
        remoteElements.forEach(el => drawElement(ctx, el))
        ctx.restore()
      }

      if (currentEl) drawElement(ctx, currentEl)
    })
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [elements, remoteElements, selection.elementId, currentEl])

  const computeCursor = useCallback((clientX: number, clientY: number) => {
    if (tool !== "select") {
      if (tool === "eraser") return "cell"
      if (tool === "text") return "text"
      return "crosshair"
    }
    if (selection.isDragging) return "grabbing"
    const canvas = canvasRef.current; if (!canvas) return "default"
    // Fake a minimal event for getCanvasPoint
    const fakeE = { clientX, clientY } as MouseEvent
    const pt = getCanvasPoint(fakeE, canvas)
    if (selection.elementId) {
      const el = elements.find(el => el.id === selection.elementId)
      if (el) { const h = getHitHandle(getBoundingBox(el), pt); if (h) return handleCursor(h) }
    }
    return getHitElement(elements, pt) ? "grab" : "default"
  }, [tool, selection, elements])

  // ── Unified pointer handler (mouse + touch) ───────────────
  const handlePointerDown = useCallback((p: SyntheticPointer) => {
    if (p.button !== 0) return
    const canvas = canvasRef.current; if (!canvas) return
    const pt = getCanvasPoint(p as any, canvas)

    if (tool === "select") {
      if (selection.elementId) {
        const el = elements.find(el => el.id === selection.elementId)
        if (el) {
          const handle = getHitHandle(getBoundingBox(el), pt)
          if (handle) { startResize(handle, pt, [...el.points], el.x, el.y); return }
        }
      }
      const hit = getHitElement(elements, pt)
      if (hit) { select(hit.id); startDrag(pt, [...hit.points], hit.x, hit.y) }
      else deselect()
      return
    }

    if (tool === "text") {
      const hit = getHitElement(elements, pt)
      if (hit?.type === "text") {
        setEditingId(hit.id); setEditingText(hit.text ?? "")
        setTextInput({ x: p.clientX, y: p.clientY, canvasX: hit.x ?? pt.x, canvasY: hit.y ?? pt.y, visible: true })
        setTimeout(() => { if (textRef.current) { textRef.current.value = hit.text ?? ""; textRef.current.focus(); textRef.current.select() } }, 30)
        return
      }
      setEditingId(null); setEditingText("")
      setTextInput({ x: p.clientX, y: p.clientY, canvasX: pt.x, canvasY: pt.y, visible: true })
      setTimeout(() => textRef.current?.focus(), 30)
      return
    }

    const el: CanvasElement = {
      id: generateId(),
      type: tool === "pen" || tool === "eraser" ? "freedraw" : tool as CanvasElement["type"],
      points: [pt],
      color: tool === "eraser" ? "#0f0f12" : color,
      strokeWidth: tool === "eraser" ? strokeWidth * 6 : strokeWidth,
    }
    setIsDrawing(true)
    setCurrentEl(el)
    onDrawStart?.(el)
  }, [tool, color, strokeWidth, elements, selection, select, deselect, startDrag, startResize, onDrawStart])

  const handlePointerMove = useCallback((p: SyntheticPointer) => {
    setCursor(computeCursor(p.clientX, p.clientY))
    const canvas = canvasRef.current; if (!canvas) return
    const pt = getCanvasPoint(p as any, canvas)

    // Throttle cursor emit to ~25fps
    const now = Date.now()
    if (now - drawThrottleRef.current > 40) {
      onCursorMove?.(p.clientX, p.clientY)
      drawThrottleRef.current = now
    }

    if (tool === "select" && selection.isDragging && selection.elementId) {
      const dx = pt.x - selection.dragStartMouse.x
      const dy = pt.y - selection.dragStartMouse.y
      setElements(prev => prev.map(el =>
        el.id !== selection.elementId ? el : {
          ...el,
          points: selection.dragStartPoints.map(pp => ({ x: pp.x + dx, y: pp.y + dy })),
          x: selection.dragStartX + dx, y: selection.dragStartY + dy,
        }
      ), true)
      return
    }

    if (tool === "select" && selection.isResizing && selection.elementId && selection.resizeHandle) {
      const dx = pt.x - selection.dragStartMouse.x
      const dy = pt.y - selection.dragStartMouse.y
      const el = elements.find(el => el.id === selection.elementId)
      if (!el || !selection.dragStartPoints.length) return
      const pts = selection.dragStartPoints
      const xs = pts.map(pp => pp.x), ys = pts.map(pp => pp.y)
      const originalBox = {
        x: Math.min(...xs) - el.strokeWidth / 2, y: Math.min(...ys) - el.strokeWidth / 2,
        width: Math.max(1, Math.max(...xs) - Math.min(...xs) + el.strokeWidth),
        height: Math.max(1, Math.max(...ys) - Math.min(...ys) + el.strokeWidth),
      }
      const resized = resizeElement(el, selection.resizeHandle, dx, dy, originalBox, pts, selection.dragStartX, selection.dragStartY)
      setElements(prev => prev.map(e => e.id === selection.elementId ? resized : e), true)
      return
    }

    if (!isDrawing || !currentEl) return
    const updated: CanvasElement = {
      ...currentEl,
      points: currentEl.type === "freedraw" ? [...currentEl.points, pt] : [currentEl.points[0], pt],
    }
    setCurrentEl(updated)
    // Throttle draw update emit
    if (now - drawThrottleRef.current > 40) {
      onDrawUpdate?.(updated)
    }
  }, [tool, selection, elements, isDrawing, currentEl, setElements, computeCursor, onCursorMove, onDrawUpdate])

  const handlePointerUp = useCallback((p: SyntheticPointer) => {
    if (tool === "select") {
      stopInteraction()
      if ((selection.isDragging || selection.isResizing) && selection.elementId) {
        onElementsChange?.(elements)
      }
      return
    }
    if (isDrawing && currentEl && currentEl.points.length >= 1) {
      setElements(prev => [...prev, currentEl])
      onDrawEnd?.(currentEl)
    }
    setIsDrawing(false)
    setCurrentEl(null)
  }, [tool, isDrawing, currentEl, setElements, stopInteraction, selection, elements, onDrawEnd, onElementsChange])

  // Wrap for mouse events
  const onMouseDown  = (e: React.MouseEvent) => handlePointerDown({ clientX: e.clientX, clientY: e.clientY, button: e.button })
  const onMouseMove  = (e: React.MouseEvent) => handlePointerMove({ clientX: e.clientX, clientY: e.clientY, button: 0 })
  const onMouseUp    = (e: React.MouseEvent) => handlePointerUp({ clientX: e.clientX, clientY: e.clientY, button: 0 })
  const onMouseLeave = () => { handlePointerUp({ clientX: 0, clientY: 0, button: 0 }); onCursorLeave?.() }

  // Touch handlers
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchHandlers(
    handlePointerDown, handlePointerMove, handlePointerUp
  )

  const onTextSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== "Escape") return
    const val = (e.target as HTMLInputElement).value.trim()
    if (val) {
      if (editingId) {
        setElements(prev => { const n = prev.map(el => el.id === editingId ? { ...el, text: val } : el); onElementsChange?.(n); return n })
      } else {
        const el: CanvasElement = {
          id: generateId(), type: "text" as const,
          points: [], color, strokeWidth,
          text: val, x: textInput.canvasX, y: textInput.canvasY,
        }
        setElements(prev => { const n = [...prev, el]; onElementsChange?.(n); return n })
      }
    }
    setTextInput(t => ({ ...t, visible: false }))
    setEditingId(null); setEditingText("")
    if (textRef.current) textRef.current.value = ""
  }, [editingId, textInput, color, strokeWidth, setElements, onElementsChange])

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor, touchAction: "none" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {textInput.visible && (
        <input
          ref={textRef}
          defaultValue={editingText}
          onKeyDown={onTextSubmit}
          onBlur={() => setTextInput(t => ({ ...t, visible: false }))}
          placeholder="Type and press Enter..."
          className="absolute bg-transparent border-none outline-none placeholder-white/20 font-sans caret-[#7c6aff]"
          style={{ left: textInput.x, top: textInput.y - 14, minWidth: 220, fontSize: `${strokeWidth * 8 + 12}px`, color }}
        />
      )}
    </div>
  )
}
