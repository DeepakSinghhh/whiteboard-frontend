"use client"
import { useEffect, useRef, useCallback, useState } from "react"
import { getSocket } from "@/lib/socket"
import { getLocalUser } from "@/lib/user"
import type { CanvasElement, BoardUser, RemoteCursor, StickyNote, Reaction, ActivityEvent } from "@/types"
import { generateId } from "@/lib/utils"

interface UseSocketOptions {
  roomId: string
  onElementsUpdate: (elements: CanvasElement[]) => void
  onDrawStart: (element: CanvasElement) => void
  onDrawUpdate: (element: CanvasElement) => void
  onDrawEnd: (element: CanvasElement) => void
  onElementDelete: (elementId: string) => void
  onClear: () => void
  onNotesUpdate?: (notes: StickyNote[]) => void
  onReactionsUpdate?: (reactions: Reaction[]) => void
}

export function useSocket({
  roomId, onElementsUpdate, onDrawStart, onDrawUpdate,
  onDrawEnd, onElementDelete, onClear,
  onNotesUpdate, onReactionsUpdate,
}: UseSocketOptions) {
  const [users, setUsers] = useState<BoardUser[]>([])
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({})
  const [connected, setConnected] = useState(false)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const cursorThrottle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socket = getSocket()
  const localUser = getLocalUser()

  const addActivity = useCallback((ev: Omit<ActivityEvent, "id" | "timestamp">) => {
    setActivity(prev => [...prev.slice(-99), { ...ev, id: generateId(), timestamp: Date.now() }])
  }, [])

  useEffect(() => {
    if (!roomId) return
    socket.connect()

    socket.on("connect", () => {
      setConnected(true)
      socket.emit("join-room", { roomId, user: localUser })
    })
    socket.on("disconnect", () => setConnected(false))

    socket.on("room-state", ({ elements, users, notes, reactions }: any) => {
      onElementsUpdate(elements)
      setUsers(users)
      if (notes) onNotesUpdate?.(notes)
      if (reactions) onReactionsUpdate?.(reactions)
    })

    socket.on("users-update", (users: BoardUser[]) => setUsers(users))
    socket.on("user-joined", (user: BoardUser) => {
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user])
      addActivity({ userId: user.id, userName: user.name, userColor: user.color, type: "join", detail: "joined the board" })
    })
    socket.on("user-left", ({ userId }: { userId: string }) => {
      setUsers(prev => {
        const user = prev.find(u => u.id === userId)
        if (user) addActivity({ userId: user.id, userName: user.name, userColor: user.color, type: "leave", detail: "left the board" })
        return prev.filter(u => u.id !== userId)
      })
      setCursors(prev => { const next = { ...prev }; delete next[userId]; return next })
    })

    socket.on("draw-start", ({ element }: { element: CanvasElement }) => onDrawStart(element))
    socket.on("draw-update", ({ element }: { element: CanvasElement }) => onDrawUpdate(element))
    socket.on("draw-end", ({ element, userName, userColor }: any) => {
      onDrawEnd(element)
      addActivity({ userId: element.id, userName: userName ?? "Someone", userColor: userColor ?? "#888", type: "draw", detail: `drew a ${element.type}` })
    })
    socket.on("elements-update", (elements: CanvasElement[]) => onElementsUpdate(elements))
    socket.on("element-delete", (id: string) => {
      onElementDelete(id)
      addActivity({ userId: id, userName: "Someone", userColor: "#f87171", type: "delete", detail: "deleted an element" })
    })
    socket.on("canvas-clear", () => {
      onClear()
      addActivity({ userId: "system", userName: "Someone", userColor: "#f87171", type: "clear", detail: "cleared the canvas" })
    })

    socket.on("notes-update", (notes: StickyNote[]) => onNotesUpdate?.(notes))
    socket.on("reactions-update", (reactions: Reaction[]) => onReactionsUpdate?.(reactions))

    socket.on("cursor-move", (cursor: RemoteCursor) => {
      setCursors(prev => ({ ...prev, [cursor.userId]: cursor }))
    })
    socket.on("cursor-leave", ({ userId }: { userId: string }) => {
      setCursors(prev => { const next = { ...prev }; delete next[userId]; return next })
    })

    return () => {
      socket.emit("cursor-leave")
      ;["connect","disconnect","room-state","users-update","user-joined","user-left",
        "draw-start","draw-update","draw-end","elements-update","element-delete","canvas-clear",
        "notes-update","reactions-update","cursor-move","cursor-leave"
      ].forEach(ev => socket.off(ev))
      socket.disconnect()
    }
  }, [roomId])

  const emitDrawStart  = useCallback((el: CanvasElement) => socket.emit("draw-start", el), [])
  const emitDrawUpdate = useCallback((el: CanvasElement) => socket.emit("draw-update", el), [])
  const emitDrawEnd    = useCallback((el: CanvasElement) => socket.emit("draw-end", { element: el, userName: localUser.name, userColor: localUser.color }), [])
  const emitElementsUpdate = useCallback((els: CanvasElement[]) => socket.emit("elements-update", els), [])
  const emitElementDelete  = useCallback((id: string) => socket.emit("element-delete", id), [])
  const emitClear          = useCallback(() => socket.emit("canvas-clear"), [])
  const emitNotes          = useCallback((notes: StickyNote[]) => socket.emit("notes-update", notes), [])
  const emitReactions      = useCallback((reactions: Reaction[]) => socket.emit("reactions-update", reactions), [])

  const emitCursor = useCallback((x: number, y: number) => {
    if (cursorThrottle.current) return
    socket.emit("cursor-move", { x, y })
    cursorThrottle.current = setTimeout(() => { cursorThrottle.current = null }, 40)
  }, [])
  const emitCursorLeave = useCallback(() => socket.emit("cursor-leave"), [])

  return {
    connected, users, cursors, activity, localUser,
    emitDrawStart, emitDrawUpdate, emitDrawEnd,
    emitElementsUpdate, emitElementDelete, emitClear,
    emitNotes, emitReactions,
    emitCursor, emitCursorLeave,
  }
}
