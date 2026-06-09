import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function getAuthedBoard(roomId: string, clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return null
  const board = await prisma.board.findUnique({ where: { roomId } })
  if (!board) return null
  // Allow owner or member
  const isMember = board.ownerId === user.id ||
    await prisma.boardMember.findFirst({ where: { boardId: board.id, userId: user.id } })
  return isMember ? { board, user } : null
}

// GET /api/boards/[roomId] — load board elements
export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  const { userId } = auth()

  const board = await prisma.board.findUnique({
    where: { roomId: params.roomId },
    include: { owner: { select: { name: true, imageUrl: true } } },
  })
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 })

  // Public boards: anyone can read
  // Private boards: only owner/members
  if (!board.isPublic && userId) {
    const authed = await getAuthedBoard(params.roomId, userId)
    if (!authed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(board)
}

// PATCH /api/boards/[roomId] — save elements or rename
export async function PATCH(req: Request, { params }: { params: { roomId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const authed = await getAuthedBoard(params.roomId, userId)
  if (!authed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const updated = await prisma.board.update({
    where: { roomId: params.roomId },
    data: {
      ...(body.elements !== undefined && { elements: body.elements }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/boards/[roomId] — owner only
export async function DELETE(_: Request, { params }: { params: { roomId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const board = await prisma.board.findUnique({ where: { roomId: params.roomId } })
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (board.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.board.delete({ where: { roomId: params.roomId } })
  return NextResponse.json({ deleted: true })
}
