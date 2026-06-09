"use client"

import { useState } from "react"
import type { BoardUser } from "@/types"

interface Props {
  users: BoardUser[]
  localUser: BoardUser
  connected: boolean
  roomId: string
}

export default function PresenceBar({ users, localUser, connected, roomId }: Props) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    const url = `${window.location.origin}/board/${roomId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // All users including self, deduplicated
  const allUsers = [localUser, ...users.filter(u => u.id !== localUser.id)]
  const MAX_SHOW = 4
  const extra = allUsers.length - MAX_SHOW

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">

      {/* Connection status */}
      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-medium shadow-xl shadow-black/30 transition-all ${
        connected
          ? "bg-[#16161a] border-[#2a2a35] text-[#34d399]"
          : "bg-[#1a1616] border-[#35282a] text-[#f87171]"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#34d399]" : "bg-[#f87171]"}`} />
        {connected ? "Live" : "Reconnecting..."}
      </div>

      {/* User avatars */}
      <div className="flex items-center bg-[#16161a] border border-[#2a2a35] rounded-xl px-2 py-1.5 gap-1 shadow-xl shadow-black/30">
        <div className="flex">
          {allUsers.slice(0, MAX_SHOW).map((user, i) => (
            <div
              key={user.id}
              title={user.id === localUser.id ? `${user.name} (you)` : user.name}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[#16161a] transition-all hover:scale-110 hover:z-10 relative"
              style={{
                background: user.color,
                marginLeft: i === 0 ? 0 : -6,
                zIndex: i,
                boxShadow: user.id === localUser.id ? `0 0 0 1.5px ${user.color}` : undefined,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {extra > 0 && (
            <div
              className="w-6 h-6 rounded-full bg-[#2a2a35] flex items-center justify-center text-[9px] font-bold text-[#888] border-2 border-[#16161a]"
              style={{ marginLeft: -6 }}
            >
              +{extra}
            </div>
          )}
        </div>
        <span className="text-[#555] text-[11px] ml-1">{allUsers.length}</span>
      </div>

      {/* Invite / copy link */}
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-2 bg-[#16161a] border border-[#2a2a35] rounded-xl text-[11px] font-medium text-[#888] hover:text-white hover:border-[#7c6aff]/50 transition-all shadow-xl shadow-black/30"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-[#34d399]">Copied!</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Invite
          </>
        )}
      </button>
    </div>
  )
}
