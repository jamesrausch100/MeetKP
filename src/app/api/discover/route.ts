import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  calculateCompatibility,
  haversineDistance,
  type MatchProfile,
} from '@/lib/matching'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch current user's profile
  const currentProfile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!currentProfile) {
    return NextResponse.json(
      { error: 'Profile not found. Please create a profile first.' },
      { status: 404 }
    )
  }

  // Get IDs of users the current user has already swiped on
  const swipedUserIds = await prisma.swipe.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true },
  })

  // Get IDs of blocked users (both directions)
  const [blockedByMe, blockedMe] = await Promise.all([
    prisma.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    }),
    prisma.block.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    }),
  ])

  const excludedIds = [
    userId,
    ...swipedUserIds.map((s) => s.toUserId),
    ...blockedByMe.map((b) => b.blockedId),
    ...blockedMe.map((b) => b.blockerId),
  ]

  // Remove duplicates
  const uniqueExcludedIds = [...new Set(excludedIds)]

  // Fetch candidate profiles
  const candidates = await prisma.profile.findMany({
    where: {
      userId: { notIn: uniqueExcludedIds },
      active: true,
    },
    include: {
      user: {
        select: { id: true },
      },
    },
  })

  // Parse current user's profile data
  const currentInterests = JSON.parse(currentProfile.interests) as string[]
  const currentPersonalityTags = JSON.parse(currentProfile.personalityTags) as string[]

  const currentMatchProfile: MatchProfile = {
    interests: currentInterests,
    personalityTags: currentPersonalityTags,
    latitude: currentProfile.latitude,
    longitude: currentProfile.longitude,
    age: currentProfile.age,
    ageRangeMin: currentProfile.ageRangeMin,
    ageRangeMax: currentProfile.ageRangeMax,
    gender: currentProfile.gender,
    lookingFor: currentProfile.lookingFor,
  }

  // Score, filter, and sort candidates
  const scoredCandidates = candidates
    .map((candidate) => {
      const candidateInterests = JSON.parse(candidate.interests) as string[]
      const candidatePersonalityTags = JSON.parse(candidate.personalityTags) as string[]

      const candidateMatchProfile: MatchProfile = {
        interests: candidateInterests,
        personalityTags: candidatePersonalityTags,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        age: candidate.age,
        ageRangeMin: candidate.ageRangeMin,
        ageRangeMax: candidate.ageRangeMax,
        gender: candidate.gender,
        lookingFor: candidate.lookingFor,
      }

      const compatibilityScore = calculateCompatibility(
        currentMatchProfile,
        candidateMatchProfile
      )

      return {
        profile: candidate,
        interests: candidateInterests,
        photos: JSON.parse(candidate.photos),
        compatibilityScore,
      }
    })
    .filter((candidate) => {
      // Filter by current user's age range preferences
      if (
        candidate.profile.age < currentProfile.ageRangeMin ||
        candidate.profile.age > currentProfile.ageRangeMax
      ) {
        return false
      }

      // Filter by distance if current user has location
      if (
        currentProfile.latitude != null &&
        currentProfile.longitude != null &&
        candidate.profile.latitude != null &&
        candidate.profile.longitude != null
      ) {
        const distance = haversineDistance(
          currentProfile.latitude,
          currentProfile.longitude,
          candidate.profile.latitude,
          candidate.profile.longitude
        )
        if (distance > currentProfile.maxDistance) {
          return false
        }
      }

      return true
    })
    // Sort by compatibility score (highest first)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    // Limit to 20 results
    .slice(0, 20)

  const result = scoredCandidates.map((candidate) => ({
    ...candidate.profile,
    interests: candidate.interests,
    photos: candidate.photos,
    userId: candidate.profile.user.id,
    user: undefined,
    compatibilityScore: candidate.compatibilityScore,
  }))

  return NextResponse.json(result)
}
