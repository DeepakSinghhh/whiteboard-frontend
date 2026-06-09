export type Tool = "pen" | "eraser" | "line" | "rect" | "circle" | "arrow" | "text" | "select"

export interface Point {
  x: number
  y: number
}

export type ElementType = "freedraw" | "line" | "rect" | "circle" | "arrow" | "text"

export interface CanvasElement {
  id: string
  type: ElementType
  points: Point[]
  color: string
  strokeWidth: number
  text?: string
  x?: number
  y?: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"

export interface SelectionState {
  elementId: string | null
  isDragging: boolean
  isResizing: boolean
  resizeHandle: ResizeHandle | null
  dragStartMouse: Point
  dragStartPoints: Point[]
  dragStartX: number
  dragStartY: number
}

// ── Real-time / Collaboration ──────────────────────────────
export interface BoardUser {
  id: string          // unique per session
  name: string
  color: string       // cursor + avatar color
  socketId?: string
}

export interface RemoteCursor {
  userId: string
  name: string
  color: string
  x: number
  y: number
}

// ── Part 5: Sticky Notes & Reactions ──────────────────────────
export interface StickyNote {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  color: StickyColor
  authorId: string
  authorName: string
  createdAt: number
}

export type StickyColor = "yellow" | "pink" | "blue" | "green" | "purple" | "orange"

export interface Reaction {
  id: string
  emoji: string
  x: number
  y: number
  authorId: string
  authorName: string
  createdAt: number
}

export interface ActivityEvent {
  id: string
  userId: string
  userName: string
  userColor: string
  type: "join" | "leave" | "draw" | "delete" | "clear" | "sticky" | "reaction"
  detail?: string
  timestamp: number
}
