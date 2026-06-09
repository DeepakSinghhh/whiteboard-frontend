import { useState, useCallback } from "react"
import type { SelectionState, Point, ResizeHandle } from "@/types"

const DEFAULT: SelectionState = {
  elementId: null,
  isDragging: false,
  isResizing: false,
  resizeHandle: null,
  dragStartMouse: { x: 0, y: 0 },
  dragStartPoints: [],
  dragStartX: 0,
  dragStartY: 0,
}

export function useSelection() {
  const [selection, setSelection] = useState<SelectionState>(DEFAULT)

  const select = useCallback((id: string) => {
    setSelection(s => ({ ...s, elementId: id }))
  }, [])

  const deselect = useCallback(() => {
    setSelection(DEFAULT)
  }, [])

  const startDrag = useCallback((mouse: Point, points: Point[], x = 0, y = 0) => {
    setSelection(s => ({
      ...s,
      isDragging: true,
      dragStartMouse: mouse,
      dragStartPoints: points,
      dragStartX: x,
      dragStartY: y,
    }))
  }, [])

  const startResize = useCallback((handle: ResizeHandle, mouse: Point, points: Point[], x = 0, y = 0) => {
    setSelection(s => ({
      ...s,
      isResizing: true,
      resizeHandle: handle,
      dragStartMouse: mouse,
      dragStartPoints: points,
      dragStartX: x,
      dragStartY: y,
    }))
  }, [])

  const stopInteraction = useCallback(() => {
    setSelection(s => ({ ...s, isDragging: false, isResizing: false, resizeHandle: null }))
  }, [])

  return { selection, select, deselect, startDrag, startResize, stopInteraction, setSelection }
}
