"use client"
import { useEffect, useRef, useCallback } from "react"
import type { CanvasElement } from "@/types"

interface Options {
  roomId: string
  elements: CanvasElement[]
  enabled: boolean          // only save when user is logged in
  debounceMs?: number
}

export function useBoardPersistence({ roomId, elements, enabled, debounceMs = 2000 }: Options) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>("")

  const save = useCallback(async (els: CanvasElement[]) => {
    try {
      await fetch(`/api/boards/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: els }),
      })
      lastSavedRef.current = JSON.stringify(els)
    } catch (err) {
      console.error("[persistence] save failed", err)
    }
  }, [roomId])

  useEffect(() => {
    if (!enabled) return
    const serialized = JSON.stringify(elements)
    if (serialized === lastSavedRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(elements), debounceMs)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [elements, enabled, save, debounceMs])

  // Save thumbnail (small canvas snapshot) when user leaves
  const saveThumbnail = useCallback(async () => {
    if (!enabled) return
    try {
      const canvas = document.querySelector("canvas")
      if (!canvas) return
      // Scale down to small thumbnail
      const thumb = document.createElement("canvas")
      thumb.width = 400; thumb.height = 225
      const ctx = thumb.getContext("2d")
      if (!ctx) return
      ctx.drawImage(canvas, 0, 0, 400, 225)
      const thumbnail = thumb.toDataURL("image/jpeg", 0.6)
      await fetch(`/api/boards/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnail }),
      })
    } catch {}
  }, [enabled, roomId])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener("beforeunload", saveThumbnail)
    return () => window.removeEventListener("beforeunload", saveThumbnail)
  }, [enabled, saveThumbnail])
}
