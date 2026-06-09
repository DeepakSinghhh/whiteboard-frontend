"use client"

import { useState } from "react"
import type { ActivityEvent } from "@/types"
import { cn } from "@/lib/utils"

interface Props {
  events: ActivityEvent[]
}

const EVENT_ICONS: Record<ActivityEvent["type"], string> = {
  join:     "→",
  leave:    "←",
  draw:     "✏",
  delete:   "✕",
  clear:    "⊘",
  sticky:   "📝",
  reaction: "✨",
}

const EVENT_COLORS: Record<ActivityEvent["type"], string> = {
  join:     "text-[#34d399]",
  leave:    "text-[#6b6b72]",
  draw:     "text-[#7c6aff]",
  delete:   "text-[#f87171]",
  clear:    "text-[#f87171]",
  sticky:   "text-[#fbbf24]",
  reaction: "text-[#f472b6]",
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export default function ActivityFeed({ events }: Props) {
  const [open, setOpen] = useState(false)
  const recent = events.slice(-5).reverse()

  return (
    <div className="absolute bottom-4 left-16 z-20">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium transition-all shadow-xl shadow-black/30",
          open
            ? "bg-[#1e1e2a] border-[#7c6aff]/40 text-[#7c6aff]"
            : "bg-[#16161a] border-[#2a2a35] text-[#555] hover:text-[#888]"
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Activity
        {events.length > 0 && (
          <span className="bg-[#7c6aff] text-white text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {events.length > 99 ? "99+" : events.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-10 left-0 w-64 bg-[#16161a] border border-[#2a2a35] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a2a35]">
            <span className="text-[#888] text-[11px] font-medium">Recent activity</span>
            <span className="text-[#444] text-[10px]">{events.length} events</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="px-3 py-6 text-center text-[#333] text-[12px]">No activity yet</div>
            ) : (
              events.slice().reverse().map(ev => (
                <div key={ev.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-[#1e1e22] transition-colors border-b border-[#1a1a1e] last:border-0">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: ev.userColor + "30", color: ev.userColor }}
                  >
                    {ev.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#aaa] text-[11px] font-medium truncate">{ev.userName}</span>
                      <span className={cn("text-[10px]", EVENT_COLORS[ev.type])}>
                        {EVENT_ICONS[ev.type]}
                      </span>
                    </div>
                    <div className="text-[#555] text-[10px] truncate">{ev.detail}</div>
                  </div>
                  <span className="text-[#333] text-[9px] flex-shrink-0 mt-0.5">{timeAgo(ev.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
