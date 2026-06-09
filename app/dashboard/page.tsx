import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect("/sign-in")

  // Ensure user exists in DB
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    // Trigger sync if user doesn't exist yet
    redirect("/api/user/sync?redirect=/dashboard")
  }

  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true, imageUrl: true } },
      members: { select: { userId: true } },
    },
  })

  return <DashboardClient boards={boards} user={user} />
}
