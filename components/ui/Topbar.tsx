"use client"

import { useState, useRef, useEffect } from "react"
import type { Tool } from "@/types"

interface TopbarProps {
  activeTool: Tool
  elementCount: number
  selectedId: string | null
  title?: string
  onRename?: (title: string) => void
  isSaving?: boolean
  isSignedIn?: boolean
}

const TOOL_LABELS: Record<Tool, string> = {
  select: "Select", pen: "Pen", eraser: "Eraser",
  line: "Line", rect: "Rectangle", circle: "Ellipse",
  arrow: "Arrow", text: "Text",
}

const SHORTCUT_MAP: Record<Tool, string> = {
  select: "S", pen: "P", eraser: "E", line: "L",
  rect: "R", circle: "C", arrow: "A", text: "T",
}

export default function Topbar({
  activeTool, elementCount, selectedId,
  title = "Untitled Board", onRename,
  isSaving, isSignedIn,
}: TopbarProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(title) }, [title])
  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim() || "Untitled Board"
    setDraft(trimmed)
    if (trimmed !== title) onRename?.(trimmed)
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 bg-[#16161a] border border-[#2a2a35] rounded-xl px-3 py-2 shadow-xl shadow-black/30">
        <div className="w-5 h-5 bg-[#7c6aff] rounded-md flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          </svg>
        </div>

        {/* Editable board title */}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(title); setEditing(false) } }}
            className="bg-transparent outline-none text-white text-[13px] font-semibold w-36 border-b border-[#7c6aff]/50"
          />
        ) : (
          <span
            className="text-white text-[13px] font-semibold tracking-tight cursor-pointer hover:text-[#aaa] transition-colors max-w-[140px] truncate"
            onClick={() => onRename && setEditing(true)}
            title="Click to rename"
          >
            {title}
          </span>
        )}

        {/* Save indicator */}
        {isSignedIn && (
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSaving ? "bg-[#fbbf24]" : "bg-[#34d399]"}`} title={isSaving ? "Saving..." : "Saved"} />
        )}
      </div>

      {/* Tool + count */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-xl px-3 py-2 shadow-xl shadow-black/30 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full" />
        <span className="text-[#aaa] text-[12px]">
          {TOOL_LABELS[activeTool]}
          <span className="ml-1 text-[#444]">({SHORTCUT_MAP[activeTool]})</span>
        </span>
        <span className="text-[#333] mx-0.5">·</span>
        <span className="text-[#555] text-[12px]">{elementCount} element{elementCount !== 1 ? "s" : ""}</span>
        {selectedId && (
          <>
            <span className="text-[#333] mx-0.5">·</span>
            <span className="text-[#7c6aff] text-[11px] font-medium">1 selected</span>
          </>
        )}
      </div>

      {/* Shortcuts */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-xl px-3 py-2 shadow-xl shadow-black/30 text-[11px] text-[#444]">
        <kbd className="bg-[#1e1e2a] px-1.5 py-0.5 rounded text-[#666] text-[10px]">⌘Z</kbd>
        <span className="mx-1">undo</span>
        <span className="text-[#2a2a2f] mx-1">·</span>
        <kbd className="bg-[#1e1e2a] px-1.5 py-0.5 rounded text-[#666] text-[10px]">S</kbd>
        <span className="mx-1">select</span>
        <span className="text-[#2a2a2f] mx-1">·</span>
        <kbd className="bg-[#1e1e2a] px-1.5 py-0.5 rounded text-[#666] text-[10px]">⌫</kbd>
        <span className="mx-1">delete</span>
      </div>
    </div>
  )
}
