import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getIcebreakerForMatch } from '@/lib/icebreakers'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const matchUserId = searchParams.get('matchUserId')

  if (!matchUserId) {
    return NextResponse.json(
      { error: 'matchUserId query parameter is required' },
      { status: 400 }
    )
  }

  // Fetch both profiles
  const [currentProfile, matchProfile] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId: matchUserId } }),
  ])

  if (!currentProfile) {
    return NextResponse.json(
      { error: 'Your profile was not found' },
      { status: 404 }
    )
  }

  if (!matchProfile) {
    return NextResponse.json(
      { error: 'Match profile was not found' },
      { status: 404 }
    )
  }

  // Parse JSON fields
  const profileA = {
    interests: JSON.parse(currentProfile.interests) as string[],
    personalityTags: JSON.parse(currentProfile.personalityTags) as string[],
  }

  const profileB = {
    interests: JSON.parse(matchProfile.interests) as string[],
    personalityTags: JSON.parse(matchProfile.personalityTags) as string[],
  }

  const suggestions = getIcebreakerForMatch(profileA, profileB)

  return NextResponse.json({ suggestions })
}
