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
  const { datePlanId, contacts } = body

  if (!datePlanId || !contacts) {
    return NextResponse.json(
      { error: 'datePlanId and contacts are required' },
      { status: 400 }
    )
  }

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json(
      { error: 'contacts must be a non-empty array of phone numbers or emails' },
      { status: 400 }
    )
  }

  // Fetch the date plan
  const datePlan = await prisma.datePlan.findUnique({
    where: { id: datePlanId },
  })

  if (!datePlan) {
    return NextResponse.json(
      { error: 'Date plan not found' },
      { status: 404 }
    )
  }

  // Only involved users can share their date plan details
  if (datePlan.creatorId !== userId && datePlan.matchId !== userId) {
    return NextResponse.json(
      { error: 'Not authorized to share this date plan' },
      { status: 403 }
    )
  }

  const updated = await prisma.datePlan.update({
    where: { id: datePlanId },
    data: {
      sharedWith: JSON.stringify(contacts),
    },
  })

  return NextResponse.json({
    success: true,
    datePlan: {
      ...updated,
      sharedWith: JSON.parse(updated.sharedWith),
    },
  })
}
