"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { getLocalUser } from "@/lib/user"

function generateRoomId() {
  const words = ["ocean", "forest", "spark", "drift", "north", "ember", "cloud", "pixel", "storm", "amber"]
  const pick = () => words[Math.floor(Math.random() * words.length)]
  return `${pick()}-${pick()}-${Math.floor(Math.random() * 900) + 100}`
}

export default function LobbyPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  // Wait until mounting is complete to prevent random generation on server
  useEffect(() => {
    setMounted(true)
  }, [])

  // Safely grab the local user only on the client side
  const user = mounted ? getLocalUser() : null

  const createBoard = async () => {
    if (creating) return
    setCreating(true)
    try {
      if (isSignedIn) {
        // Create in DB for signed-in users
        const res = await fetch("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Untitled Board" }),
        })
        const board = await res.json()
        router.push(`/board/${board.roomId}`)
      } else {
        // Guest: just use a random room ID
        router.push(`/board/${generateRoomId()}`)
      }
    } finally {
      setCreating(false)
    }
  }

  const joinBoard = () => {
    const trimmed = joinCode.trim().toLowerCase()
    if (!trimmed) { setError("Enter a board code or URL"); return }
    const match = trimmed.match(/board\/([a-z0-9-]+)/)
    const roomId = match ? match[1] : trimmed
    if (!/^[a-z0-9-]+$/.test(roomId)) { setError("Invalid board code"); return }
    router.push(`/board/${roomId}`)
  }

  // Prevent UI rendering until hydration completely finishes
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center px-4">
        <div className="text-zinc-600 text-[13px] font-medium animate-pulse">
          Loading workspace...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[500px] bg-[#7c6aff]/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] bg-[#6aafff]/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#7c6aff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7c6aff]/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            </svg>
          </div>
          <span className="text-white text-2xl font-semibold tracking-tight">Sketchpad</span>
        </div>

        {isLoaded && isSignedIn ? (
          /* Signed-in state */
          <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#888] text-[12px]">Signed in</span>
              <Link href="/dashboard" className="text-[#7c6aff] text-[12px] hover:underline">View all boards →</Link>
            </div>
            <button
              onClick={createBoard}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 bg-[#7c6aff] hover:bg-[#6a58ee] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-[#7c6aff]/20"
            >
              {creating ? "Creating..." : "Create new board"}
            </button>
          </div>
        ) : isLoaded && user ? (
          /* Guest state */
          <div className="mb-4">
            <div className="flex items-center gap-2 bg-[#16161a] border border-[#2a2a35] rounded-xl px-3 py-2.5 mb-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: user.color }}>
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="text-white text-[12px] font-medium">{user.name}</div>
                <div className="text-[#444] text-[10px]">Guest · boards won't be saved</div>
              </div>
            </div>
            <button
              onClick={createBoard}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 bg-[#7c6aff] hover:bg-[#6a58ee] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-[#7c6aff]/20 mb-2"
            >
              {creating ? "Creating..." : "Create board (guest)"}
            </button>
            <div className="flex gap-2">
              <Link href="/sign-up" className="flex-1 text-center py-2.5 border border-[#7c6aff]/40 text-[#7c6aff] text-[13px] font-medium rounded-xl hover:bg-[#7c6aff]/10 transition-all">
                Sign up free
              </Link>
              <Link href="/sign-in" className="flex-1 text-center py-2.5 border border-[#2a2a35] text-[#888] text-[13px] font-medium rounded-xl hover:border-[#444] transition-all">
                Sign in
              </Link>
            </div>
          </div>
        ) : null}

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#2a2a35]" />
          <span className="text-[#333] text-[11px]">or join existing</span>
          <div className="flex-1 h-px bg-[#2a2a35]" />
        </div>

        {/* Join */}
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={e => { setJoinCode(e.target.value); setError("") }}
            onKeyDown={e => e.key === "Enter" && joinBoard()}
            placeholder="Board code or link..."
            className="flex-1 bg-[#16161a] border border-[#2a2a35] rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-[#333] outline-none focus:border-[#7c6aff]/50 transition-colors"
          />
          <button
            onClick={joinBoard}
            className="px-4 py-2.5 bg-[#16161a] border border-[#2a2a35] text-[#666] hover:text-white hover:border-[#7c6aff]/40 rounded-xl text-[13px] font-medium transition-all"
          >
            Join
          </button>
        </div>
        {error && <p className="text-[#f87171] text-[11px] mt-2 ml-1">{error}</p>}

        <p className="text-center text-[#2a2a35] text-[11px] mt-6">
          Share the board URL to collaborate in real-time
        </p>
      </div>
    </div>
  )
}