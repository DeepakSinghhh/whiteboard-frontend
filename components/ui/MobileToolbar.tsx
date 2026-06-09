"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ExtendedTool } from "@/components/toolbar/Toolbar"

interface Props {
  activeTool: ExtendedTool
  onToolChange: (tool: ExtendedTool) => void
  color: string
  onColorChange: (color: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  hasSelection: boolean
  onDeleteSelected: () => void
  onExport: () => void
}

const MAIN_TOOLS: { id: ExtendedTool; svg: React.ReactNode }[] = [
  { id: "pen",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg> },
  { id: "eraser",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 15l4-4"/></svg> },
  { id: "rect",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="5" width="18" height="14" rx="2"/></svg> },
  { id: "circle",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><ellipse cx="12" cy="12" rx="9" ry="6"/></svg> },
  { id: "arrow",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/></svg> },
  { id: "text",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
  { id: "sticky",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { id: "reaction",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
]

const COLORS = ["#ffffff", "#e63946", "#f4a261", "#ffd166", "#2a9d8f", "#6a4c93", "#457b9d"]

export default function MobileToolbar({
  activeTool, onToolChange,
  color, onColorChange,
  onUndo, onRedo, canUndo, canRedo,
  hasSelection, onDeleteSelected, onExport,
}: Props) {
  const [showColors, setShowColors] = useState(false)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* Color tray — slides up when open */}
      {showColors && (
        <div className="flex items-center justify-center gap-3 px-4 py-3 bg-[#16161a] border-t border-[#2a2a35]">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { onColorChange(c); setShowColors(false) }}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                color === c ? "border-[#7c6aff] scale-110" : "border-transparent"
              )}
              style={{ background: c, boxShadow: c === "#ffffff" && color !== c ? "inset 0 0 0 1px #444" : undefined }}
            />
          ))}
          <label className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2a2a35]">
            <input type="color" value={color} onChange={e => { onColorChange(e.target.value); setShowColors(false) }} className="opacity-0 w-full h-full cursor-pointer" />
          </label>
        </div>
      )}

      {/* Main toolbar row */}
      <div className="flex items-center justify-between px-2 py-2 bg-[#16161a] border-t border-[#2a2a35] safe-area-bottom">

        {/* Tool icons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          {MAIN_TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => onToolChange(t.id)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                activeTool === t.id
                  ? "bg-[#7c6aff] text-white shadow-lg shadow-[#7c6aff]/30"
                  : "text-[#555] hover:bg-[#1e1e2a] hover:text-white"
              )}
            >
              {t.svg}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {/* Active color dot → opens color tray */}
          <button
            onClick={() => setShowColors(v => !v)}
            className="w-7 h-7 rounded-full border-2 border-[#7c6aff] flex-shrink-0 transition-all"
            style={{ background: color }}
          />

          <button onClick={onUndo} disabled={!canUndo}
            className={cn("w-10 h-10 rounded-xl flex items-center justify-center", canUndo ? "text-[#888] hover:bg-[#1e1e2a] hover:text-white" : "text-[#333]")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </button>

          <button onClick={onRedo} disabled={!canRedo}
            className={cn("w-10 h-10 rounded-xl flex items-center justify-center", canRedo ? "text-[#888] hover:bg-[#1e1e2a] hover:text-white" : "text-[#333]")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
          </button>

          {hasSelection && (
            <button onClick={onDeleteSelected}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#f87171] hover:bg-[#2a1a1a]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          )}

          <button onClick={onExport}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#555] hover:bg-[#1e1e2a] hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
