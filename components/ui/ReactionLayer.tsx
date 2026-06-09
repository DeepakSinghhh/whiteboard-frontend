"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { Reaction } from "@/types"
import { generateId } from "@/lib/utils"

const EMOJIS = ["👍", "❤️", "🔥", "✨", "😂", "👀", "🎉", "💡", "❓", "✅"]

interface Props {
  reactions: Reaction[]
  localUserId: string
  localUserName: string
  active: boolean
  onReactionsChange: (reactions: Reaction[]) => void
  onEmitReactions: (reactions: Reaction[]) => void
}

interface FloatingReaction extends Reaction {
  opacity: number
  offsetY: number
}

export default function ReactionLayer({
  reactions, localUserId, localUserName,
  active, onReactionsChange, onEmitReactions,
}: Props) {
  const [selectedEmoji, setSelectedEmoji] = useState("👍")
  const [floating, setFloating] = useState<FloatingReaction[]>([])
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Animate new reactions floating up then fading
  useEffect(() => {
    reactions.forEach(r => {
      if (timerRef.current.has(r.id)) return
      const fr: FloatingReaction = { ...r, opacity: 1, offsetY: 0 }
      setFloating(prev => [...prev, fr])

      // Animate over 2s
      let start: number | null = null
      const animate = (ts: number) => {
        if (!start) start = ts
        const elapsed = ts - start
        const progress = Math.min(elapsed / 2000, 1)
        setFloating(prev =>
          prev.map(f => f.id === r.id
            ? { ...f, opacity: 1 - progress, offsetY: -60 * progress }
            : f
          )
        )
        if (progress < 1) requestAnimationFrame(animate)
        else setFloating(prev => prev.filter(f => f.id !== r.id))
      }
      requestAnimationFrame(animate)

      // Remove from data after 2s
      const t = setTimeout(() => {
        onReactionsChange(reactions.filter(rx => rx.id !== r.id))
        timerRef.current.delete(r.id)
      }, 2500)
      timerRef.current.set(r.id, t)
    })
  }, [reactions])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!active) return
    const r: Reaction = {
      id: generateId(),
      emoji: selectedEmoji,
      x: e.clientX,
      y: e.clientY,
      authorId: localUserId,
      authorName: localUserName,
      createdAt: Date.now(),
    }
    const next = [...reactions, r]
    onReactionsChange(next)
    onEmitReactions(next)
  }, [active, selectedEmoji, reactions, localUserId, localUserName, onReactionsChange, onEmitReactions])

  return (
    <>
      {active && (
        <div
          className="absolute inset-0 z-10"
          style={{ cursor: "cell" }}
          onClick={handleCanvasClick}
        />
      )}

      {/* Floating emoji animations */}
      {floating.map(r => (
        <div
          key={r.id}
          className="absolute pointer-events-none z-40 text-2xl"
          style={{
            left: r.x - 12,
            top: r.y - 12 + r.offsetY,
            opacity: r.opacity,
            transition: "none",
          }}
        >
          {r.emoji}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff", opacity: r.opacity }}
          >
            {r.authorName}
          </div>
        </div>
      ))}

      {/* Emoji picker bar */}
      {active && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-[#16161a] border border-[#2a2a35] rounded-2xl px-3 py-2 shadow-2xl">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={e => { e.stopPropagation(); setSelectedEmoji(emoji) }}
              className={`text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                selectedEmoji === emoji ? "bg-[#7c6aff]/20 scale-110 ring-1 ring-[#7c6aff]/50" : "hover:bg-[#1e1e2a]"
              }`}
            >
              {emoji}
            </button>
          ))}
          <span className="text-[#555] text-[11px] ml-1 pl-2 border-l border-[#2a2a35]">click to react</span>
        </div>
      )}
    </>
  )
}
