"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import dynamic from "next/dynamic"
import Canvas from "@/components/canvas/Canvas"
import Toolbar, { type ExtendedTool } from "@/components/toolbar/Toolbar"
import Topbar from "@/components/ui/Topbar"
import LiveCursors from "@/components/ui/LiveCursors"
import PresenceBar from "@/components/ui/PresenceBar"
import StickyLayer from "@/components/ui/StickyLayer"
import ReactionLayer from "@/components/ui/ReactionLayer"
import ActivityFeed from "@/components/ui/ActivityFeed"
import PermissionsPanel from "@/components/ui/PermissionsPanel"
import BoardSkeleton from "@/components/ui/LoadingSkeleton"
import ErrorState from "@/components/ui/ErrorState"
import MobileToolbar from "@/components/ui/MobileToolbar"
import { useHistory } from "@/hooks/useHistory"
import { useSocket } from "@/hooks/useSocket"
import { useBoardPersistence } from "@/hooks/useBoardPersistence"
import type { Tool, CanvasElement, StickyNote, Reaction } from "@/types"

const CANVAS_TOOLS: Tool[] = ["pen","eraser","line","rect","circle","arrow","text","select"]

const TOOL_KEYS: Record<string, ExtendedTool> = {
  p: "pen", e: "eraser", l: "line", r: "rect",
  c: "circle", a: "arrow", t: "text", s: "select",
  n: "sticky", f: "reaction",
}

type LoadState = "loading" | "ready" | "error"

export default function BoardPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const { isSignedIn, isLoaded } = useAuth()

  const [tool, setTool] = useState<ExtendedTool>("pen")
  const [color, setColor] = useState("#ffffff")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [boardTitle, setBoardTitle] = useState("Untitled Board")
  const [isPublic, setIsPublic] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const { elements, setElements, undo, redo, canUndo, canRedo } = useHistory([])
  const [remoteStrokes, setRemoteStrokes] = useState<Record<string, CanvasElement>>({})
  const [notes, setNotes] = useState<StickyNote[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Load board
  const loadBoard = useCallback(() => {
    if (!isLoaded) return
    setLoadState("loading")
    fetch(`/api/boards/${roomId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(board => {
        if (board?.elements) setElements(Array.isArray(board.elements) ? board.elements : [])
        setBoardTitle(board?.title ?? "Untitled Board")
        setIsPublic(board?.isPublic ?? false)
        setOwnerId(board?.ownerId ?? null)
        setLoadState("ready")
      })
      .catch(() => setLoadState("ready")) // guest board: just open empty
  }, [roomId, isLoaded, setElements])

  useEffect(() => { loadBoard() }, [loadBoard])

  // Determine ownership
  useEffect(() => {
    if (!isSignedIn || !ownerId) return
    fetch("/api/user/sync", { method: "POST" })
      .then(r => r.ok ? r.json() : null)
      .then(user => { if (user) setIsOwner(user.id === ownerId) })
  }, [isSignedIn, ownerId])

  // Auto-save
  useBoardPersistence({ roomId, elements, enabled: !!isSignedIn && loadState === "ready" })

  // Socket
  const {
    connected, users, cursors, activity, localUser,
    emitDrawStart, emitDrawUpdate, emitDrawEnd,
    emitElementsUpdate, emitElementDelete, emitClear,
    emitNotes, emitReactions,
    emitCursor, emitCursorLeave,
  } = useSocket({
    roomId,
    onElementsUpdate: useCallback((els: CanvasElement[]) => setElements(els), []),
    onDrawStart: useCallback((el: CanvasElement) => setRemoteStrokes(prev => ({ ...prev, [el.id]: el })), []),
    onDrawUpdate: useCallback((el: CanvasElement) => setRemoteStrokes(prev => ({ ...prev, [el.id]: el })), []),
    onDrawEnd: useCallback((el: CanvasElement) => {
      setElements(prev => [...prev, el])
      setRemoteStrokes(prev => { const n = { ...prev }; delete n[el.id]; return n })
    }, []),
    onElementDelete: useCallback((id: string) => { setElements(prev => prev.filter(e => e.id !== id)); setSelectedId(null) }, []),
    onClear: useCallback(() => { setElements([]); setSelectedId(null) }, []),
    onNotesUpdate: useCallback((n: StickyNote[]) => setNotes(n), []),
    onReactionsUpdate: useCallback((r: Reaction[]) => setReactions(r), []),
  })

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); redo(); return }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); return }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault()
        setElements(prev => prev.filter(el => el.id !== selectedId))
        emitElementDelete(selectedId); setSelectedId(null); return
      }
      if (e.key === "Escape") { setSelectedId(null); return }
      if (TOOL_KEYS[e.key.toLowerCase()]) setTool(TOOL_KEYS[e.key.toLowerCase()])
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo, selectedId, setElements, emitElementDelete])

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return
    setElements(prev => prev.filter(el => el.id !== selectedId))
    emitElementDelete(selectedId); setSelectedId(null)
  }, [selectedId, setElements, emitElementDelete])

  const handleClear = useCallback(() => {
    if (elements.length === 0 && notes.length === 0) return
    if (window.confirm("Clear the canvas for everyone?")) {
      setElements([]); setNotes([]); setSelectedId(null)
      emitClear(); emitNotes([])
    }
  }, [elements.length, notes.length, setElements, emitClear, emitNotes])

  const handleExport = useCallback(() => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `${boardTitle.replace(/\s+/g, "-")}-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png"); link.click()
  }, [boardTitle])

  const handleRename = useCallback(async (title: string) => {
    setBoardTitle(title)
    if (isSignedIn) {
      await fetch(`/api/boards/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
    }
  }, [roomId, isSignedIn])

  if (loadState === "loading") return <BoardSkeleton />
  if (loadState === "error") return <ErrorState onRetry={loadBoard} />

  const activeCanvasTool = CANVAS_TOOLS.includes(tool as Tool) ? (tool as Tool) : "pen"

  return (
    <div className="relative w-screen h-screen bg-[#0f0f12] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-[#7c6aff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-[#6aafff]/4 rounded-full blur-[100px]" />
      </div>

      {/* Desktop topbar */}
      {!isMobile && (
        <Topbar activeTool={activeCanvasTool} elementCount={elements.length} selectedId={selectedId}
          title={boardTitle} onRename={handleRename} isSaving={false} isSignedIn={!!isSignedIn} />
      )}

      <PresenceBar users={users} localUser={localUser} connected={connected} roomId={roomId} />

      {isSignedIn && !isMobile && (
        <div className="absolute top-16 right-4 z-20">
          <PermissionsPanel isPublic={isPublic} isOwner={isOwner} roomId={roomId} onTogglePublic={setIsPublic} />
        </div>
      )}

      {/* Desktop sidebar toolbar */}
      {!isMobile && (
        <Toolbar
          activeTool={tool}
          onToolChange={t => { setTool(t); if (t !== "select") setSelectedId(null) }}
          color={color} onColorChange={setColor}
          strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth}
          onUndo={undo} onRedo={redo} onClear={handleClear} onExport={handleExport}
          onDeleteSelected={handleDeleteSelected}
          canUndo={canUndo} canRedo={canRedo} hasSelection={!!selectedId}
        />
      )}

      <Canvas
        elements={elements}
        remoteElements={Object.values(remoteStrokes)}
        setElements={setElements}
        tool={activeCanvasTool}
        color={color} strokeWidth={strokeWidth}
        onSelectElement={setSelectedId}
        onDrawStart={emitDrawStart} onDrawUpdate={emitDrawUpdate} onDrawEnd={emitDrawEnd}
        onElementsChange={emitElementsUpdate}
        onCursorMove={emitCursor} onCursorLeave={emitCursorLeave}
      />

      <StickyLayer notes={notes} localUserId={localUser.id} localUserName={localUser.name}
        active={tool === "sticky"} onNotesChange={setNotes} onEmitNotes={emitNotes} />

      <ReactionLayer reactions={reactions} localUserId={localUser.id} localUserName={localUser.name}
        active={tool === "reaction"} onReactionsChange={setReactions} onEmitReactions={emitReactions} />

      <LiveCursors cursors={cursors} />

      {!isMobile && <ActivityFeed events={activity} />}

      {/* Mobile bottom toolbar */}
      {isMobile && (
        <MobileToolbar
          activeTool={tool}
          onToolChange={t => { setTool(t); if (t !== "select") setSelectedId(null) }}
          color={color} onColorChange={setColor}
          onUndo={undo} onRedo={redo}
          canUndo={canUndo} canRedo={canRedo}
          hasSelection={!!selectedId}
          onDeleteSelected={handleDeleteSelected}
          onExport={handleExport}
        />
      )}

      {selectedId && !isMobile && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#16161a] border border-[#7c6aff]/30 rounded-xl px-4 py-2 text-[12px] text-[#7c6aff] shadow-xl flex items-center gap-2 pointer-events-none">
          <span className="w-1.5 h-1.5 bg-[#7c6aff] rounded-full" />
          1 selected · drag · resize · <kbd className="bg-[#1e1e2a] px-1 py-0.5 rounded text-[10px]">⌫</kbd> delete
        </div>
      )}

      {isLoaded && !isSignedIn && !isMobile && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#16161a] border border-[#2a2a35] rounded-xl px-4 py-2.5 text-[12px] text-[#555] flex items-center gap-3 shadow-xl">
          Drawing as guest ·
          <a href="/sign-up" className="text-[#7c6aff] hover:underline font-medium">Sign up to save boards</a>
        </div>
      )}

      {!isMobile && (
        <div className="absolute bottom-4 right-4 text-[#2a2a35] text-[11px] select-none">
          Sketchpad · Part 6 ✓
        </div>
      )}
    </div>
  )
}
