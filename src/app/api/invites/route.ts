import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const invites = await prisma.inviteCode.findMany({
      where: { creatorId: userId },
      include: {
        usedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const codes = invites.map((invite) => ({
      id: invite.id,
      code: invite.code,
      createdAt: invite.createdAt,
      used: !!invite.usedById,
      usedAt: invite.usedAt,
      usedBy: invite.usedBy
        ? {
            id: invite.usedBy.id,
            name: invite.usedBy.profile?.name ?? invite.usedBy.email,
          }
        : null,
    }))

    const totalSent = codes.length
    const totalUsed = codes.filter((c) => c.used).length

    return NextResponse.json({ codes, totalSent, totalUsed })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check how many active (unused) codes the user already has
    const activeCount = await prisma.inviteCode.count({
      where: { creatorId: userId, usedById: null },
    })

    if (activeCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 active unused invite codes allowed. Wait for some to be used.' },
        { status: 400 }
      )
    }

    // Generate a unique code with retry
    let code = generateCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.inviteCode.findUnique({ where: { code } })
      if (!existing) break
      code = generateCode()
      attempts++
    }

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Failed to generate unique code. Try again.' }, { status: 500 })
    }

    const invite = await prisma.inviteCode.create({
      data: {
        code,
        creatorId: userId,
      },
    })

    return NextResponse.json({
      id: invite.id,
      code: invite.code,
      createdAt: invite.createdAt,
      used: false,
      usedAt: null,
      usedBy: null,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
