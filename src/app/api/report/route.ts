import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const VALID_REASONS = [
  'fake_profile',
  'harassment',
  'spam',
  'inappropriate_content',
  'underage',
  'other',
] as const

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { reportedId, reason, details } = body

  if (!reportedId || !reason) {
    return NextResponse.json(
      { error: 'reportedId and reason are required' },
      { status: 400 }
    )
  }

  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json(
      { error: `reason must be one of: ${VALID_REASONS.join(', ')}` },
      { status: 400 }
    )
  }

  if (reportedId === userId) {
    return NextResponse.json(
      { error: 'Cannot report yourself' },
      { status: 400 }
    )
  }

  // Check that the reported user exists
  const reportedUser = await prisma.user.findUnique({
    where: { id: reportedId },
  })

  if (!reportedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const report = await prisma.report.create({
    data: {
      reporterId: userId,
      reportedId,
      reason,
      details: details || '',
    },
  })

  return NextResponse.json({ success: true, report })
}
