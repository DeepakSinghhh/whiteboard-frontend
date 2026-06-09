import type { CanvasElement, BoundingBox, Point, ResizeHandle } from "@/types"

/** Get the axis-aligned bounding box of any element */
export function getBoundingBox(el: CanvasElement): BoundingBox {
  if (el.type === "text" && el.x != null && el.y != null) {
    const fontSize = el.strokeWidth * 8 + 12
    const approxWidth = (el.text?.length ?? 1) * fontSize * 0.6
    return { x: el.x, y: el.y - fontSize, width: approxWidth, height: fontSize + 8 }
  }

  if (el.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

  const xs = el.points.map(p => p.x)
  const ys = el.points.map(p => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  const pad = el.strokeWidth / 2 + 2

  return {
    x: minX - pad,
    y: minY - pad,
    width: Math.max(maxX - minX + pad * 2, 1),
    height: Math.max(maxY - minY + pad * 2, 1),
  }
}

/** Returns true if point is inside bounding box (with optional padding) */
export function hitTestBox(box: BoundingBox, pt: Point, pad = 0): boolean {
  return (
    pt.x >= box.x - pad &&
    pt.x <= box.x + box.width + pad &&
    pt.y >= box.y - pad &&
    pt.y <= box.y + box.height + pad
  )
}

/** Hit-test which element (topmost) a point lands on */
export function getHitElement(elements: CanvasElement[], pt: Point): CanvasElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]
    const box = getBoundingBox(el)
    if (hitTestBox(box, pt, 6)) return el
  }
  return null
}

const HANDLE_SIZE = 8

/** Returns center points of all 8 resize handles for a bounding box */
export function getHandles(box: BoundingBox): Record<ResizeHandle, Point> {
  const { x, y, width: w, height: h } = box
  return {
    nw: { x, y },
    n:  { x: x + w / 2, y },
    ne: { x: x + w, y },
    w:  { x, y: y + h / 2 },
    e:  { x: x + w, y: y + h / 2 },
    sw: { x, y: y + h },
    s:  { x: x + w / 2, y: y + h },
    se: { x: x + w, y: y + h },
  }
}

/** Returns which handle (if any) a point lands on */
export function getHitHandle(box: BoundingBox, pt: Point): ResizeHandle | null {
  const handles = getHandles(box)
  const hs = HANDLE_SIZE
  for (const [name, center] of Object.entries(handles) as [ResizeHandle, Point][]) {
    if (
      pt.x >= center.x - hs && pt.x <= center.x + hs &&
      pt.y >= center.y - hs && pt.y <= center.y + hs
    ) return name
  }
  return null
}

/** Cursor for each resize handle */
export function handleCursor(handle: ResizeHandle): string {
  const map: Record<ResizeHandle, string> = {
    nw: "nw-resize", ne: "ne-resize",
    sw: "sw-resize", se: "se-resize",
    n: "n-resize",   s: "s-resize",
    e: "e-resize",   w: "w-resize",
  }
  return map[handle]
}

/** Move all points of an element by dx,dy */
export function moveElement(el: CanvasElement, dx: number, dy: number): CanvasElement {
  return {
    ...el,
    points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })),
    x: el.x != null ? el.x + dx : el.x,
    y: el.y != null ? el.y + dy : el.y,
  }
}

/** Scale/resize element given handle drag delta */
export function resizeElement(
  el: CanvasElement,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  originalBox: BoundingBox,
  originalPoints: Point[],
  originalX?: number,
  originalY?: number,
): CanvasElement {
  const { x, y, width: w, height: h } = originalBox
  let newX = x, newY = y, newW = w, newH = h

  if (handle.includes("e")) newW = Math.max(10, w + dx)
  if (handle.includes("s")) newH = Math.max(10, h + dy)
  if (handle.includes("w")) { newX = x + dx; newW = Math.max(10, w - dx) }
  if (handle.includes("n")) { newY = y + dy; newH = Math.max(10, h - dy) }

  const scaleX = newW / w
  const scaleY = newH / h

  const scaledPoints = originalPoints.map(p => ({
    x: newX + (p.x - x) * scaleX,
    y: newY + (p.y - y) * scaleY,
  }))

  // For text, just move anchor
  if (el.type === "text") {
    return {
      ...el,
      x: originalX != null ? originalX + (handle.includes("w") ? dx : 0) : el.x,
      y: originalY != null ? originalY + (handle.includes("n") ? dy : 0) : el.y,
    }
  }

  return { ...el, points: scaledPoints }
}
