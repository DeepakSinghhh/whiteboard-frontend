"use client"

import { useState } from "react"

interface Props {
  isPublic: boolean
  isOwner: boolean
  roomId: string
  onTogglePublic: (pub: boolean) => void
}

export default function PermissionsPanel({ isPublic, isOwner, roomId, onTogglePublic }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const boardUrl = typeof window !== "undefined" ? `${window.location.origin}/board/${roomId}` : ""

  const handleToggle = async () => {
    if (!isOwner) return
    setSaving(true)
    const next = !isPublic
    await fetch(`/api/boards/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: next }),
    })
    onTogglePublic(next)
    setSaving(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-medium transition-all ${
          open ? "bg-[#1e1e2a] border-[#7c6aff]/40 text-[#7c6aff]" : "bg-[#16161a] border-[#2a2a35] text-[#555] hover:text-[#888]"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          {isPublic
            ? <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>
            : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
          }
        </svg>
        {isPublic ? "Public" : "Private"}
      </button>

      {open && (
        <div className="absolute top-10 right-0 w-72 bg-[#16161a] border border-[#2a2a35] rounded-2xl shadow-2xl shadow-black/50 p-4 z-30">
          <h3 className="text-[#aaa] text-[12px] font-semibold mb-3">Board access</h3>

          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#0f0f12] rounded-xl mb-3">
            <div>
              <div className="text-[#aaa] text-[12px] font-medium">{isPublic ? "Public" : "Private"}</div>
              <div className="text-[#444] text-[11px] mt-0.5">
                {isPublic ? "Anyone with the link can view and draw" : "Only invited members can access"}
              </div>
            </div>
            {isOwner ? (
              <button
                onClick={handleToggle}
                disabled={saving}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isPublic ? "bg-[#7c6aff]" : "bg-[#2a2a35]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            ) : (
              <span className="text-[#444] text-[10px]">owner only</span>
            )}
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <input
              readOnly
              value={boardUrl}
              className="flex-1 bg-[#0f0f12] border border-[#2a2a35] rounded-lg px-2.5 py-2 text-[#555] text-[11px] font-mono outline-none truncate"
            />
            <button
              onClick={() => navigator.clipboard.writeText(boardUrl)}
              className="px-3 py-2 bg-[#7c6aff]/10 border border-[#7c6aff]/30 text-[#7c6aff] text-[11px] rounded-lg hover:bg-[#7c6aff]/20 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
