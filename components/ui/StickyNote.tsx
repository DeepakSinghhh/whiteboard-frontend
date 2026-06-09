"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { StickyNote, StickyColor } from "@/types"

const STICKY_COLORS: Record<StickyColor, { bg: string; border: string; text: string; header: string }> = {
  yellow: { bg: "#fef9c3", border: "#fde047", text: "#713f12",  header: "#fde047" },
  pink:   { bg: "#fce7f3", border: "#f9a8d4", text: "#831843",  header: "#f9a8d4" },
  blue:   { bg: "#dbeafe", border: "#93c5fd", text: "#1e3a5f",  header: "#93c5fd" },
  green:  { bg: "#dcfce7", border: "#86efac", text: "#14532d",  header: "#86efac" },
  purple: { bg: "#ede9fe", border: "#c4b5fd", text: "#3b0764",  header: "#c4b5fd" },
  orange: { bg: "#ffedd5", border: "#fdba74", text: "#7c2d12",  header: "#fdba74" },
}

interface Props {
  note: StickyNote
  isOwn: boolean
  onUpdate: (note: StickyNote) => void
  onDelete: (id: string) => void
}

export default function StickyNoteCard({ note, isOwn, onUpdate, onDelete }: Props) {
  const [dragging, setDragging] = useState(false)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(note.text)
  const dragStart = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const colors = STICKY_COLORS[note.color]

  useEffect(() => { setText(note.text) }, [note.text])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isOwn || editing) return
    e.stopPropagation()
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: note.x, ny: note.y }
    setDragging(true)

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.mx
      const dy = ev.clientY - dragStart.current.my
      onUpdate({ ...note, x: dragStart.current.nx + dx, y: dragStart.current.ny + dy })
    }
    const onUp = () => {
      setDragging(false)
      dragStart.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [isOwn, editing, note, onUpdate])

  const commitText = useCallback(() => {
    setEditing(false)
    if (text !== note.text) onUpdate({ ...note, text })
  }, [text, note, onUpdate])

  return (
    <div
      className={cn(
        "absolute rounded-xl shadow-lg select-none group",
        dragging ? "cursor-grabbing shadow-2xl scale-[1.02]" : isOwn ? "cursor-grab" : "cursor-default",
      )}
      style={{
        left: note.x, top: note.y,
        width: note.width, minHeight: note.height,
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        zIndex: dragging ? 100 : 20,
        transition: dragging ? "none" : "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseDown={onMouseDown}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-2.5 py-1.5 rounded-t-xl"
        style={{ background: colors.header }}
      >
        <span className="text-[10px] font-semibold opacity-60 truncate max-w-[100px]" style={{ color: colors.text }}>
          {note.authorName}
        </span>
        {isOwn && (
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => onDelete(note.id)}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-[11px] px-1 rounded"
            style={{ color: colors.text }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Text body */}
      <div className="p-2.5">
        {editing ? (
          <textarea
            ref={textRef}
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={e => { if (e.key === "Escape") commitText() }}
            className="w-full bg-transparent outline-none resize-none text-[13px] leading-relaxed font-medium"
            style={{ color: colors.text, minHeight: 60 }}
            rows={4}
            onMouseDown={e => e.stopPropagation()}
          />
        ) : (
          <p
            className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap min-h-[60px] cursor-text"
            style={{ color: colors.text }}
            onDoubleClick={() => isOwn && setEditing(true)}
          >
            {note.text || <span className="opacity-30 italic">Double-click to edit</span>}
          </p>
        )}
      </div>
    </div>
  )
}
