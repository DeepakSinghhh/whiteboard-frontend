"use client"
import { useCallback } from "react"

// Converts a TouchEvent into a synthetic mouse-like object the canvas can use
export interface SyntheticPointer {
  clientX: number
  clientY: number
  button: number
}

export function touchToPointer(e: React.TouchEvent): SyntheticPointer | null {
  const touch = e.touches[0] ?? e.changedTouches[0]
  if (!touch) return null
  return { clientX: touch.clientX, clientY: touch.clientY, button: 0 }
}

export function useTouchHandlers(
  onDown: (e: SyntheticPointer) => void,
  onMove: (e: SyntheticPointer) => void,
  onUp: (e: SyntheticPointer) => void,
) {
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const p = touchToPointer(e)
    if (p) onDown(p)
  }, [onDown])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const p = touchToPointer(e)
    if (p) onMove(p)
  }, [onMove])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const p = touchToPointer(e)
    if (p) onUp(p)
  }, [onUp])

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}
