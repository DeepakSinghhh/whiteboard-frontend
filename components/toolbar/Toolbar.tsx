"use client"

import { cn } from "@/lib/utils"
import type { Tool } from "@/types"

export type ExtendedTool = Tool | "sticky" | "reaction"

interface ToolbarProps {
  activeTool: ExtendedTool
  onToolChange: (tool: ExtendedTool) => void
  color: string
  onColorChange: (color: string) => void
  strokeWidth: number
  onStrokeWidthChange: (w: number) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onExport: () => void
  onDeleteSelected: () => void
  canUndo: boolean
  canRedo: boolean
  hasSelection: boolean
}

const TOOLS: { id: ExtendedTool; label: string; shortcut: string; svg: React.ReactNode }[] = [
  { id: "select", label: "Select", shortcut: "S",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 3l14 9-7 1-4 7z"/></svg> },
  { id: "pen", label: "Pen", shortcut: "P",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg> },
  { id: "eraser", label: "Eraser", shortcut: "E",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 15l4-4"/></svg> },
  { id: "line", label: "Line", shortcut: "L",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4"><line x1="5" y1="19" x2="19" y2="5"/></svg> },
  { id: "rect", label: "Rectangle", shortcut: "R",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="5" width="18" height="14" rx="2"/></svg> },
  { id: "circle", label: "Ellipse", shortcut: "C",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><ellipse cx="12" cy="12" rx="9" ry="6"/></svg> },
  { id: "arrow", label: "Arrow", shortcut: "A",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/></svg> },
  { id: "text", label: "Text", shortcut: "T",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
  { id: "sticky", label: "Sticky Note", shortcut: "N",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id: "reaction", label: "Reaction", shortcut: "F",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
]

const COLORS = ["#ffffff", "#e63946", "#f4a261", "#ffd166", "#2a9d8f", "#457b9d", "#a8dadc", "#6a4c93"]
const STROKE_SIZES = [2, 4, 8, 14]

const DRAWING_TOOLS: ExtendedTool[] = ["pen","eraser","line","rect","circle","arrow","text"]

export default function Toolbar({
  activeTool, onToolChange, color, onColorChange,
  strokeWidth, onStrokeWidthChange,
  onUndo, onRedo, onClear, onExport, onDeleteSelected,
  canUndo, canRedo, hasSelection,
}: ToolbarProps) {
  const showColorStroke = DRAWING_TOOLS.includes(activeTool)

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
      {/* Tools */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-0.5 shadow-2xl shadow-black/40">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 group relative",
              activeTool === tool.id
                ? "bg-[#7c6aff] text-white shadow-lg shadow-[#7c6aff]/30"
                : "text-[#666] hover:bg-[#1e1e2a] hover:text-white"
            )}
          >
            {tool.svg}
            <span className="absolute left-full ml-2.5 px-2 py-1 bg-[#0f0f12] border border-[#2a2a35] text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium flex items-center gap-1.5">
              {tool.label}
              <kbd className="bg-[#1e1e2a] px-1 py-0.5 rounded text-[#888] text-[10px]">{tool.shortcut}</kbd>
            </span>
          </button>
        ))}
      </div>

      {/* Stroke + Colors — only for drawing tools */}
      {showColorStroke && (
        <>
          <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-0.5 items-center shadow-2xl shadow-black/40">
            {STROKE_SIZES.map((size) => (
              <button key={size} onClick={() => onStrokeWidthChange(size)} title={`${size}px`}
                className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all", strokeWidth === size ? "bg-[#1e1e2a]" : "hover:bg-[#1a1a22]")}>
                <div className="rounded-full bg-white transition-all" style={{ width: Math.max(4, size * 1.4), height: Math.max(4, size * 1.4), opacity: strokeWidth === size ? 1 : 0.35 }} />
              </button>
            ))}
          </div>

          <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-1 items-center shadow-2xl shadow-black/40">
            {COLORS.map((c) => (
              <button key={c} onClick={() => onColorChange(c)}
                className={cn("w-6 h-6 rounded-lg transition-all border-2 hover:scale-110", color === c ? "border-[#7c6aff] scale-110 shadow-lg shadow-[#7c6aff]/40" : "border-transparent")}
                style={{ background: c, boxShadow: c === "#ffffff" && color !== c ? "inset 0 0 0 1px #333" : undefined }} />
            ))}
            <label className="w-6 h-6 rounded-lg overflow-hidden cursor-pointer border-2 border-[#2a2a35] hover:border-[#7c6aff] transition-colors">
              <input type="color" value={color} onChange={e => onColorChange(e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
            </label>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-0.5 shadow-2xl shadow-black/40">
        {[
          { fn: onUndo, disabled: !canUndo, label: "Undo", shortcut: "⌘Z",
            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg> },
          { fn: onRedo, disabled: !canRedo, label: "Redo", shortcut: "⌘⇧Z",
            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg> },
          { fn: onExport, disabled: false, label: "Export PNG", shortcut: "",
            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
          { fn: onClear, disabled: false, label: "Clear all", shortcut: "",
            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> },
        ].map(({ fn, disabled, label, shortcut, svg }) => (
          <button key={label} onClick={fn} disabled={disabled} title={shortcut ? `${label} ${shortcut}` : label}
            className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative",
              disabled ? "text-[#333] cursor-not-allowed" : "text-[#666] hover:bg-[#1e1e2a] hover:text-white")}>
            {svg}
            <span className="absolute left-full ml-2.5 px-2 py-1 bg-[#0f0f12] border border-[#2a2a35] text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{label}</span>
          </button>
        ))}

        {hasSelection && (
          <>
            <div className="h-px bg-[#2a2a35] my-0.5" />
            <button onClick={onDeleteSelected} title="Delete (⌫)"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#f87171] hover:bg-[#2a1a1a] transition-all group relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              <span className="absolute left-full ml-2.5 px-2 py-1 bg-[#2a1a1a] border border-[#f87171]/30 text-[#f87171] text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Delete (⌫)</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
