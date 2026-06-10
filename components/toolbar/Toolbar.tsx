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

const COLORS = [
  "#ffffff", "#e63946", "#f4a261", "#ffd166",
  "#2a9d8f", "#457b9d", "#a8dadc", "#6a4c93",
  "#000000", "#666666",
]
const STROKE_SIZES = [2, 4, 8, 14]
const DRAWING_TOOLS: ExtendedTool[] = ["pen","eraser","line","rect","circle","arrow","text"]

export default function Toolbar({
  activeTool, color, onColorChange,
  strokeWidth, onStrokeWidthChange,
  onClear, hasSelection,
}: ToolbarProps) {
  const showColorStroke = DRAWING_TOOLS.includes(activeTool)

  if (!showColorStroke) return null

  return (
    <div
      className="absolute left-4 z-20 flex flex-col gap-1.5 overflow-y-auto no-scrollbar"
      style={{ top: 64, bottom: 16 }}
    >
      {/* Stroke sizes */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-0.5 items-center shadow-2xl shadow-black/40 flex-shrink-0">
        <div className="text-[9px] text-[#444] uppercase tracking-widest mb-1">Size</div>
        {STROKE_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onStrokeWidthChange(size)}
            title={`${size}px`}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              strokeWidth === size ? "bg-[#1e1e2a] ring-1 ring-[#7c6aff]/40" : "hover:bg-[#1a1a22]"
            )}
          >
            <div
              className="rounded-full bg-white transition-all"
              style={{
                width: Math.max(4, size * 1.4),
                height: Math.max(4, size * 1.4),
                opacity: strokeWidth === size ? 1 : 0.35,
              }}
            />
          </button>
        ))}
      </div>

      {/* Colors */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-1.5 items-center shadow-2xl shadow-black/40 flex-shrink-0">
        <div className="text-[9px] text-[#444] uppercase tracking-widest mb-0.5">Color</div>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={cn(
              "w-6 h-6 rounded-lg transition-all border-2 hover:scale-110",
              color === c
                ? "border-[#7c6aff] scale-110 shadow-md shadow-[#7c6aff]/30"
                : "border-transparent hover:border-[#444]"
            )}
            style={{
              background: c,
              boxShadow: c === "#ffffff" && color !== c ? "inset 0 0 0 1px #333" : undefined,
            }}
          />
        ))}
        {/* Custom color */}
        <label
          className="w-6 h-6 rounded-lg overflow-hidden cursor-pointer border-2 border-[#2a2a35] hover:border-[#7c6aff] transition-colors"
          title="Custom color"
        >
          <input
            type="color"
            value={color}
            onChange={e => onColorChange(e.target.value)}
            className="opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>

      {/* Clear */}
      <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-2 flex flex-col gap-0.5 items-center shadow-2xl shadow-black/40 flex-shrink-0">
        <button
          onClick={onClear}
          title="Clear canvas"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#555] hover:bg-[#1e1e2a] hover:text-[#f87171] transition-all group relative"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <span className="absolute left-full ml-2.5 px-2 py-1 bg-[#0f0f12] border border-[#2a2a35] text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Clear all
          </span>
        </button>
      </div>
    </div>
  )
}
