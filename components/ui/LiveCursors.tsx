"use client"

import type { RemoteCursor } from "@/types"

interface Props {
  cursors: Record<string, RemoteCursor>
}

export default function LiveCursors({ cursors }: Props) {
  return (
    <>
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none z-30 transition-transform duration-75"
          style={{ left: cursor.x, top: cursor.y, transform: "translate(-2px, -2px)" }}
        >
          {/* SVG cursor arrow */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 2L16 10.5L10.5 11.5L8 17L4 2Z"
              fill={cursor.color}
              stroke="#0f0f12"
              strokeWidth="1.2"
            />
          </svg>
          {/* Name label */}
          <div
            className="absolute top-4 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white whitespace-nowrap shadow-lg"
            style={{ background: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  )
}
