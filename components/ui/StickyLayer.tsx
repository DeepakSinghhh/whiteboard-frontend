"use client"

import { useState, useCallback } from "react"
import StickyNoteCard from "./StickyNote"
import type { StickyNote, StickyColor } from "@/types"
import { generateId } from "@/lib/utils"

const COLORS: StickyColor[] = ["yellow", "pink", "blue", "green", "purple", "orange"]

const COLOR_DOTS: Record<StickyColor, string> = {
  yellow: "#fde047", pink: "#f9a8d4", blue: "#93c5fd",
  green: "#86efac", purple: "#c4b5fd", orange: "#fdba74",
}

interface Props {
  notes: StickyNote[]
  localUserId: string
  localUserName: string
  active: boolean                        // toolbar "sticky" tool is selected
  onNotesChange: (notes: StickyNote[]) => void
  onEmitNotes: (notes: StickyNote[]) => void
}

export default function StickyLayer({
  notes, localUserId, localUserName,
  active, onNotesChange, onEmitNotes,
}: Props) {
  const [pendingColor, setPendingColor] = useState<StickyColor>("yellow")

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!active) return
    // Don't place if clicking an existing note
    if ((e.target as HTMLElement).closest(".sticky-note-card")) return

    const note: StickyNote = {
      id: generateId(),
      x: e.clientX - 100,
      y: e.clientY - 40,
      width: 200,
      height: 160,
      text: "",
      color: pendingColor,
      authorId: localUserId,
      authorName: localUserName,
      createdAt: Date.now(),
    }
    const next = [...notes, note]
    onNotesChange(next)
    onEmitNotes(next)
  }, [active, pendingColor, notes, localUserId, localUserName, onNotesChange, onEmitNotes])

  const handleUpdate = useCallback((updated: StickyNote) => {
    const next = notes.map(n => n.id === updated.id ? updated : n)
    onNotesChange(next)
    onEmitNotes(next)
  }, [notes, onNotesChange, onEmitNotes])

  const handleDelete = useCallback((id: string) => {
    const next = notes.filter(n => n.id !== id)
    onNotesChange(next)
    onEmitNotes(next)
  }, [notes, onNotesChange, onEmitNotes])

  return (
    <>
      {/* Transparent click capture layer when sticky tool active */}
      {active && (
        <div
          className="absolute inset-0 z-10"
          style={{ cursor: "copy" }}
          onClick={handleCanvasClick}
        />
      )}

      {/* Render all sticky notes */}
      {notes.map(note => (
        <div key={note.id} className="sticky-note-card" style={{ position: "absolute", zIndex: 20 }}>
          <StickyNoteCard
            note={note}
            isOwn={note.authorId === localUserId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      ))}

      {/* Color picker when sticky tool active */}
      {active && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#16161a] border border-[#2a2a35] rounded-2xl px-3 py-2.5 shadow-2xl">
          <span className="text-[#555] text-[11px] mr-1">Note color:</span>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={e => { e.stopPropagation(); setPendingColor(c) }}
              className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
              style={{
                background: COLOR_DOTS[c],
                borderColor: pendingColor === c ? "#fff" : "transparent",
                boxShadow: pendingColor === c ? `0 0 0 1px ${COLOR_DOTS[c]}` : "none",
              }}
            />
          ))}
          <span className="text-[#555] text-[11px] ml-1">· click canvas to place</span>
        </div>
      )}
    </>
  )
}
