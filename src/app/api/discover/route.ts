import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get IDs of users the current user has already swiped on
  const swipedUserIds = await prisma.swipe.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true },
  })

  const excludedIds = [userId, ...swipedUserIds.map((s) => s.toUserId)]

  const profiles = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludedIds },
      active: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true },
      },
    },
  })

  const result = profiles.map((profile) => ({
    ...profile,
    interests: JSON.parse(profile.interests),
    photos: JSON.parse(profile.photos),
    userId: profile.user.id,
    user: undefined,
  }))

  return NextResponse.json(result)
}
