import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const otherUserId = searchParams.get('userId')

  if (!otherUserId) {
    return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark messages from the other user as read
  await prisma.message.updateMany({
    where: {
      fromUserId: otherUserId,
      toUserId: userId,
      read: false,
    },
    data: { read: true },
  })

  return NextResponse.json(messages)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { toUserId, content } = body

  if (!toUserId || !content) {
    return NextResponse.json({ error: 'toUserId and content are required' }, { status: 400 })
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 })
  }

  if (toUserId === userId) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  // Verify that the two users are mutually matched
  const userLiked = await prisma.swipe.findFirst({
    where: {
      fromUserId: userId,
      toUserId,
      direction: { in: ['like', 'superlike'] },
    },
  })

  const otherLiked = await prisma.swipe.findFirst({
    where: {
      fromUserId: toUserId,
      toUserId: userId,
      direction: { in: ['like', 'superlike'] },
    },
  })

  if (!userLiked || !otherLiked) {
    return NextResponse.json(
      { error: 'You can only message users you are matched with' },
      { status: 403 }
    )
  }

  const message = await prisma.message.create({
    data: {
      fromUserId: userId,
      toUserId,
      content: content.trim(),
    },
  })

  return NextResponse.json(message, { status: 201 })
}
