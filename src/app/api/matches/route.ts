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

  // Find all users who the current user has liked/superliked
  const sentLikes = await prisma.swipe.findMany({
    where: {
      fromUserId: userId,
      direction: { in: ['like', 'superlike'] },
    },
    select: { toUserId: true },
  })

  const likedUserIds = sentLikes.map((s) => s.toUserId)

  if (likedUserIds.length === 0) {
    return NextResponse.json([])
  }

  // Find which of those users have also liked the current user back
  const mutualSwipes = await prisma.swipe.findMany({
    where: {
      fromUserId: { in: likedUserIds },
      toUserId: userId,
      direction: { in: ['like', 'superlike'] },
    },
    select: { fromUserId: true },
  })

  const mutualUserIds = mutualSwipes.map((s) => s.fromUserId)

  if (mutualUserIds.length === 0) {
    return NextResponse.json([])
  }

  // Fetch profiles for all mutual matches
  const profiles = await prisma.profile.findMany({
    where: {
      userId: { in: mutualUserIds },
    },
  })

  // For each match, get the latest message
  const matchesWithMessages = await Promise.all(
    profiles.map(async (profile) => {
      const latestMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { fromUserId: userId, toUserId: profile.userId },
            { fromUserId: profile.userId, toUserId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      })

      return {
        ...profile,
        interests: JSON.parse(profile.interests),
        photos: JSON.parse(profile.photos),
        latestMessage,
      }
    })
  )

  return NextResponse.json(matchesWithMessages)
}
