import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password, inviteCode } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash },
    })

    // Handle invite code if provided
    if (inviteCode && typeof inviteCode === 'string') {
      const invite = await prisma.inviteCode.findUnique({
        where: { code: inviteCode.toUpperCase().trim() },
      })

      if (invite && !invite.usedById) {
        // Mark invite code as used
        await prisma.inviteCode.update({
          where: { id: invite.id },
          data: {
            usedById: user.id,
            usedAt: new Date(),
          },
        })

        // Create referral record
        await prisma.referral.create({
          data: {
            referrerId: invite.creatorId,
            referredId: user.id,
          },
        })
      }
    }

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
