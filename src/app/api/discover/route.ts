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

  const currentProfile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!currentProfile) {
    return NextResponse.json(
      { error: 'Profile not found. Please create a profile first.' },
      { status: 404 }
    )
  }

  // Get IDs to exclude (already swiped + blocked)
  const [swipedUserIds, blockedByMe, blockedMe] = await Promise.all([
    prisma.swipe.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    }),
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
    ...new Set([
      userId,
      ...swipedUserIds.map((s) => s.toUserId),
      ...blockedByMe.map((b) => b.blockedId),
      ...blockedMe.map((b) => b.blockerId),
    ]),
  ]

  // Fetch ALL active candidates (no distance filter at query level)
  const candidates = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludedIds },
      active: true,
    },
    include: {
      user: {
        select: { id: true, lastActive: true, isOnline: true },
      },
    },
  })

  // Parse current user's profile
  const currentInterests = JSON.parse(currentProfile.interests) as string[]
  const currentPersonalityTags = JSON.parse(
    currentProfile.personalityTags
  ) as string[]

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

  const hasLocation =
    currentProfile.latitude != null && currentProfile.longitude != null

  // Score all candidates
  const scoredCandidates = candidates.map((candidate) => {
    const candidateInterests = JSON.parse(candidate.interests) as string[]
    const candidatePersonalityTags = JSON.parse(
      candidate.personalityTags
    ) as string[]

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

    // Calculate distance if both have coords
    let distance: number | null = null
    if (
      hasLocation &&
      candidate.latitude != null &&
      candidate.longitude != null
    ) {
      distance = haversineDistance(
        currentProfile.latitude!,
        currentProfile.longitude!,
        candidate.latitude,
        candidate.longitude
      )
    }

    return {
      profile: candidate,
      interests: candidateInterests,
      personalityTags: candidatePersonalityTags,
      promptAnswers: JSON.parse(candidate.promptAnswers || '[]'),
      photos: JSON.parse(candidate.photos),
      compatibilityScore,
      distance,
    }
  })

  // Apply soft filters: try strict first, then loosen if no results
  let filtered = scoredCandidates.filter((c) => {
    // Age range filter
    if (
      c.profile.age < currentProfile.ageRangeMin ||
      c.profile.age > currentProfile.ageRangeMax
    ) {
      return false
    }
    // Distance filter (only if both have location)
    if (c.distance != null && c.distance > currentProfile.maxDistance) {
      return false
    }
    return true
  })

  // FALLBACK: If strict filtering returned nothing, show EVERYONE
  // This ensures users always see profiles regardless of location
  if (filtered.length === 0) {
    filtered = scoredCandidates
  }

  // Sort by compatibility score (highest first)
  filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

  // Limit to 50 results
  const limited = filtered.slice(0, 50)

  const result = limited.map((candidate) => ({
    id: candidate.profile.id,
    userId: candidate.profile.user.id,
    name: candidate.profile.name,
    age: candidate.profile.age,
    bio: candidate.profile.bio,
    location: candidate.profile.location,
    vibe: candidate.profile.vibe,
    gender: candidate.profile.gender,
    interests: candidate.interests,
    personalityTags: candidate.personalityTags,
    promptAnswers: candidate.promptAnswers,
    photos: candidate.photos,
    photoVerified: candidate.profile.photoVerified,
    compatibilityScore: candidate.compatibilityScore,
    distance: candidate.distance != null ? Math.round(candidate.distance) : null,
    isOnline: candidate.profile.user.isOnline,
    lastActive: candidate.profile.user.lastActive,
  }))

  return NextResponse.json(result)
}
