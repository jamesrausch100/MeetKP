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

  // Get all messages involving the current user
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    orderBy: { createdAt: 'desc' },
  })

  // Build a map of conversation partners
  const conversationMap = new Map<
    string,
    { lastMessage: (typeof messages)[0]; unreadCount: number }
  >()

  for (const msg of messages) {
    const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        lastMessage: msg,
        unreadCount: 0,
      })
    }

    // Count unread messages sent TO the current user
    if (msg.toUserId === userId && !msg.read) {
      const entry = conversationMap.get(partnerId)!
      entry.unreadCount += 1
    }
  }

  if (conversationMap.size === 0) {
    return NextResponse.json([])
  }

  // Fetch profiles for all conversation partners
  const partnerIds = Array.from(conversationMap.keys())
  const profiles = await prisma.profile.findMany({
    where: {
      userId: { in: partnerIds },
    },
  })

  const profileMap = new Map(profiles.map((p) => [p.userId, p]))

  const conversations = partnerIds.map((partnerId) => {
    const { lastMessage, unreadCount } = conversationMap.get(partnerId)!
    const profile = profileMap.get(partnerId)

    return {
      userId: partnerId,
      profile: profile
        ? {
            ...profile,
            interests: JSON.parse(profile.interests),
            photos: JSON.parse(profile.photos),
          }
        : null,
      lastMessage,
      unreadCount,
    }
  })

  // Sort by last message time (most recent first) - already ordered since messages were fetched desc
  return NextResponse.json(conversations)
}
