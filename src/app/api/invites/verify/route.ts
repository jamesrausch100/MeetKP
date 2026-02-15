import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: {
        creator: {
          select: {
            profile: { select: { name: true } },
            email: true,
          },
        },
      },
    })

    if (!invite || invite.usedById) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    const inviterName = invite.creator.profile?.name ?? invite.creator.email

    return NextResponse.json({ valid: true, inviterName })
  } catch {
    return NextResponse.json({ valid: false }, { status: 200 })
  }
}
