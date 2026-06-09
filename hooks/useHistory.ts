import { useState, useCallback } from "react"
import type { CanvasElement } from "@/types"

export function useHistory(initialState: CanvasElement[] = []) {
  const [history, setHistory] = useState<CanvasElement[][]>([initialState])
  const [index, setIndex] = useState(0)

  const elements = history[index]

  const setState = useCallback((action: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[]), overwrite = false) => {
    const newState = typeof action === "function" ? action(history[index]) : action

    if (overwrite) {
      const updatedHistory = [...history]
      updatedHistory[index] = newState
      setHistory(updatedHistory)
    } else {
      const newHistory = history.slice(0, index + 1)
      setHistory([...newHistory, newState])
      setIndex(newHistory.length)
    }
  }, [history, index])

  const undo = useCallback(() => {
    if (index > 0) setIndex(i => i - 1)
  }, [index])

  const redo = useCallback(() => {
    if (index < history.length - 1) setIndex(i => i + 1)
  }, [index, history.length])

  const canUndo = index > 0
  const canRedo = index < history.length - 1

  return { elements, setElements: setState, undo, redo, canUndo, canRedo }
}
