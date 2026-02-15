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
  const { blockedId } = body

  if (!blockedId) {
    return NextResponse.json(
      { error: 'blockedId is required' },
      { status: 400 }
    )
  }

  if (blockedId === userId) {
    return NextResponse.json(
      { error: 'Cannot block yourself' },
      { status: 400 }
    )
  }

  // Check that the target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: blockedId },
  })

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if already blocked
  const existingBlock = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: userId,
        blockedId,
      },
    },
  })

  if (existingBlock) {
    return NextResponse.json(
      { error: 'User is already blocked' },
      { status: 400 }
    )
  }

  const block = await prisma.block.create({
    data: {
      blockerId: userId,
      blockedId,
    },
  })

  return NextResponse.json({ success: true, block })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: {
      blocked: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const blockedUsers = blocks.map((block) => ({
    id: block.blockedId,
    name: block.blocked.profile?.name || 'Unknown User',
    blockedAt: block.createdAt,
  }))

  return NextResponse.json(blockedUsers)
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { blockedId } = body

  if (!blockedId) {
    return NextResponse.json(
      { error: 'blockedId is required' },
      { status: 400 }
    )
  }

  const existingBlock = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: userId,
        blockedId,
      },
    },
  })

  if (!existingBlock) {
    return NextResponse.json(
      { error: 'Block not found' },
      { status: 404 }
    )
  }

  await prisma.block.delete({
    where: {
      blockerId_blockedId: {
        blockerId: userId,
        blockedId,
      },
    },
  })

  return NextResponse.json({ success: true })
}
