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
  const { matchId, venue, address, dateTime, notes } = body

  if (!matchId || !venue || !dateTime) {
    return NextResponse.json(
      { error: 'matchId, venue, and dateTime are required' },
      { status: 400 }
    )
  }

  if (matchId === userId) {
    return NextResponse.json(
      { error: 'Cannot create a date plan with yourself' },
      { status: 400 }
    )
  }

  // Validate the two users are matched (mutual likes)
  const userLikedMatch = await prisma.swipe.findFirst({
    where: {
      fromUserId: userId,
      toUserId: matchId,
      direction: { in: ['like', 'superlike'] },
    },
  })

  const matchLikedUser = await prisma.swipe.findFirst({
    where: {
      fromUserId: matchId,
      toUserId: userId,
      direction: { in: ['like', 'superlike'] },
    },
  })

  if (!userLikedMatch || !matchLikedUser) {
    return NextResponse.json(
      { error: 'You can only create date plans with your matches' },
      { status: 403 }
    )
  }

  const datePlan = await prisma.datePlan.create({
    data: {
      creatorId: userId,
      matchId,
      venue,
      address: address || '',
      dateTime: new Date(dateTime),
      notes: notes || '',
    },
  })

  return NextResponse.json({ success: true, datePlan })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const datePlans = await prisma.datePlan.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { matchId: userId },
      ],
    },
    include: {
      creator: {
        include: { profile: true },
      },
      match: {
        include: { profile: true },
      },
    },
    orderBy: { dateTime: 'asc' },
  })

  // Format the response with the other user's info
  const formatted = datePlans.map((plan) => {
    const isCreator = plan.creatorId === userId
    const otherUser = isCreator ? plan.match : plan.creator

    return {
      id: plan.id,
      venue: plan.venue,
      address: plan.address,
      dateTime: plan.dateTime,
      status: plan.status,
      notes: plan.notes,
      sharedWith: JSON.parse(plan.sharedWith),
      isCreator,
      otherUser: {
        id: otherUser.id,
        name: otherUser.profile?.name || 'Unknown',
      },
      createdAt: plan.createdAt,
    }
  })

  return NextResponse.json(formatted)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json(
      { error: 'id and status are required' },
      { status: 400 }
    )
  }

  if (!['accepted', 'declined', 'cancelled'].includes(status)) {
    return NextResponse.json(
      { error: 'status must be "accepted", "declined", or "cancelled"' },
      { status: 400 }
    )
  }

  // Fetch the date plan
  const datePlan = await prisma.datePlan.findUnique({
    where: { id },
  })

  if (!datePlan) {
    return NextResponse.json(
      { error: 'Date plan not found' },
      { status: 404 }
    )
  }

  // Only involved users can update
  if (datePlan.creatorId !== userId && datePlan.matchId !== userId) {
    return NextResponse.json(
      { error: 'Not authorized to update this date plan' },
      { status: 403 }
    )
  }

  // Creator can only cancel, match partner can accept or decline
  if (datePlan.creatorId === userId && status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Creator can only cancel the date plan' },
      { status: 400 }
    )
  }

  if (datePlan.matchId === userId && status === 'cancelled') {
    return NextResponse.json(
      { error: 'Only the creator can cancel. You can decline instead.' },
      { status: 400 }
    )
  }

  // Can only update proposed plans
  if (datePlan.status !== 'proposed') {
    return NextResponse.json(
      { error: `Cannot update a date plan that is already ${datePlan.status}` },
      { status: 400 }
    )
  }

  const updated = await prisma.datePlan.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true, datePlan: updated })
}
