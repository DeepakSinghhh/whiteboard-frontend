"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import type { Board, User } from "@prisma/client"

type BoardWithOwner = Board & {
  owner: { name: string | null; imageUrl: string | null }
  members: { userId: string }[]
}

interface Props {
  boards: BoardWithOwner[]
  user: User
}

function formatDate(date: Date) {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    "day"
  )
}

function BoardCard({ board, userId, onDelete }: { board: BoardWithOwner; userId: string; onDelete: (id: string) => void }) {
  const router = useRouter()
  const isOwner = board.ownerId === userId
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${board.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/boards/${board.roomId}`, { method: "DELETE" })
    onDelete(board.id)
  }

  return (
    <div
      onClick={() => router.push(`/board/${board.roomId}`)}
      className="group bg-[#16161a] border border-[#2a2a35] rounded-2xl overflow-hidden cursor-pointer hover:border-[#7c6aff]/40 transition-all hover:shadow-lg hover:shadow-[#7c6aff]/5"
    >
      {/* Thumbnail */}
      <div className="h-36 bg-[#0f0f12] relative flex items-center justify-center overflow-hidden">
        {board.thumbnail ? (
          <img src={board.thumbnail} alt={board.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#2a2a35]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            </svg>
            <span className="text-[11px]">Empty board</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#7c6aff]/0 group-hover:bg-[#7c6aff]/8 transition-all flex items-center justify-center">
          <span className="text-white text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-[#7c6aff] px-3 py-1.5 rounded-lg">
            Open board
          </span>
        </div>
        {/* Public badge */}
        {board.isPublic && (
          <div className="absolute top-2 left-2 bg-[#16161a]/80 border border-[#2a2a35] text-[#888] text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
            Public
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-white truncate">{board.title}</h3>
            <p className="text-[11px] text-[#555] mt-0.5">
              {formatDate(board.updatedAt)} · {board.members.length + 1} member{board.members.length !== 0 ? "s" : ""}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#2a1a1a] text-[#555] hover:text-[#f87171] transition-all flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardClient({ boards: initialBoards, user }: Props) {
  const router = useRouter()
  const [boards, setBoards] = useState(initialBoards)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [newTitle, setNewTitle] = useState("")
  const [showModal, setShowModal] = useState(false)

  const createBoard = async () => {
    if (creating) return
    setCreating(true)
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() || "Untitled Board" }),
      })
      const board = await res.json()
      router.push(`/board/${board.roomId}`)
    } finally {
      setCreating(false)
      setShowModal(false)
    }
  }

  const handleDelete = (boardId: string) => {
    setBoards(prev => prev.filter(b => b.id !== boardId))
  }

  return (
    <div className="min-h-screen bg-[#0f0f12]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 bg-[rgba(15,15,18,0.9)] backdrop-blur-md border-b border-[#2a2a35]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#7c6aff] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-[14px]">Sketchpad</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#555] text-[12px] hidden sm:block">{user.name}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-[22px] font-semibold">My Boards</h1>
            <p className="text-[#555] text-[13px] mt-0.5">{boards.length} board{boards.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#7c6aff] hover:bg-[#6a58ee] text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#7c6aff]/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New board
          </button>
        </div>

        {/* Board grid */}
        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 bg-[#16161a] border border-[#2a2a35] rounded-2xl flex items-center justify-center mb-4 text-[#2a2a35]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              </svg>
            </div>
            <h2 className="text-[#555] text-[15px] font-medium mb-1">No boards yet</h2>
            <p className="text-[#333] text-[13px] mb-6">Create your first board to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#7c6aff] text-white text-[13px] font-medium px-4 py-2.5 rounded-xl hover:bg-[#6a58ee] transition-all"
            >
              Create first board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                userId={user.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#16161a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-white text-[15px] font-semibold mb-4">New board</h2>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createBoard()}
              placeholder="Board title..."
              className="w-full bg-[#0f0f12] border border-[#2a2a35] rounded-xl px-3 py-3 text-white text-[13px] placeholder-[#444] outline-none focus:border-[#7c6aff]/50 transition-colors mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[#555] hover:text-white text-[13px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createBoard}
                disabled={creating}
                className="flex items-center gap-2 bg-[#7c6aff] hover:bg-[#6a58ee] disabled:opacity-50 text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-all"
              >
                {creating ? "Creating..." : "Create board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
