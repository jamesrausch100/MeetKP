import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { toUserId, direction } = body

  if (!toUserId || !direction) {
    return NextResponse.json({ error: 'toUserId and direction are required' }, { status: 400 })
  }

  if (!['like', 'pass', 'superlike'].includes(direction)) {
    return NextResponse.json(
      { error: 'direction must be "like", "pass", or "superlike"' },
      { status: 400 }
    )
  }

  if (toUserId === userId) {
    return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 })
  }

  // Check that the target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: toUserId },
  })

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if already swiped
  const existingSwipe = await prisma.swipe.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: userId,
        toUserId,
      },
    },
  })

  if (existingSwipe) {
    return NextResponse.json({ error: 'Already swiped on this user' }, { status: 400 })
  }

  // Record the swipe
  const swipe = await prisma.swipe.create({
    data: {
      fromUserId: userId,
      toUserId,
      direction,
    },
  })

  // Check for mutual match if this was a like or superlike
  if (direction === 'like' || direction === 'superlike') {
    const reverseSwipe = await prisma.swipe.findFirst({
      where: {
        fromUserId: toUserId,
        toUserId: userId,
        direction: { in: ['like', 'superlike'] },
      },
    })

    if (reverseSwipe) {
      const matchedProfile = await prisma.profile.findUnique({
        where: { userId: toUserId },
      })

      return NextResponse.json({
        swipe,
        matched: true,
        matchedProfile: matchedProfile
          ? {
              ...matchedProfile,
              interests: JSON.parse(matchedProfile.interests),
              photos: JSON.parse(matchedProfile.photos),
            }
          : null,
      })
    }
  }

  return NextResponse.json({ swipe, matched: false })
}
