import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Anonymous",
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Anonymous",
      imageUrl: clerkUser.imageUrl,
    },
  })

  return NextResponse.json(user)
}
