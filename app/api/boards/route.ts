import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function generateRoomId() {
  const words = ["ocean","forest","spark","drift","north","ember","cloud","pixel","storm","amber","cedar","frost"]
  const pick = () => words[Math.floor(Math.random() * words.length)]
  return `${pick()}-${pick()}-${Math.floor(Math.random() * 900) + 100}`
}

// GET /api/boards — list all boards for current user
export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, roomId: true, title: true,
      thumbnail: true, isPublic: true,
      createdAt: true, updatedAt: true,
      ownerId: true,
      owner: { select: { name: true, imageUrl: true } },
      members: { select: { userId: true, role: true } },
    },
  })

  return NextResponse.json(boards)
}

// POST /api/boards — create a new board
export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const title = body.title || "Untitled Board"
  const roomId = generateRoomId()

  const board = await prisma.board.create({
    data: {
      roomId,
      title,
      ownerId: user.id,
    },
  })

  return NextResponse.json(board, { status: 201 })
}
