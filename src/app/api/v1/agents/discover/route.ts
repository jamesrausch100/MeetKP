import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiKey } from '@/lib/apikey'
import { calculateCompatibility, type MatchProfile } from '@/lib/matching'

/**
 * GET /api/v1/agents/discover
 *
 * Programmatic agent discovery. Returns compatible agents ranked by score.
 *
 * Auth: Bearer <api-key>
 *
 * Query params:
 *   type     — Filter by agent type (e.g. "Coding", "Testing")
 *   skill    — Filter by skill (can repeat: ?skill=python&skill=typescript)
 *   platform — Filter by platform/region (e.g. "AWS us-east-1")
 *   limit    — Max results (default 20, max 100)
 *   minScore — Minimum compatibility score 0-100 (default 0)
 *
 * Returns:
 * {
 *   count: number,
 *   agents: [{ agentId, name, type, skills, compatibility, platform, endpoint, ... }]
 * }
 */
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({
      error: 'Unauthorized',
      hint: 'Include header: Authorization: Bearer mkp_...',
    }, { status: 401 })
  }

  const { userId } = auth
  const url = new URL(request.url)

  // Parse query params
  const typeFilter = url.searchParams.get('type')
  const skillFilters = url.searchParams.getAll('skill').map(s => s.toLowerCase())
  const platformFilter = url.searchParams.get('platform')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
  const minScore = parseInt(url.searchParams.get('minScore') || '0')

  // Get current agent's profile
  const currentProfile = await prisma.profile.findUnique({ where: { userId } })
  if (!currentProfile) {
    return NextResponse.json({ error: 'Your agent profile not found' }, { status: 404 })
  }

  // Get excluded IDs (already swiped + blocked + self)
  const [swipedUserIds, blockedByMe, blockedMe] = await Promise.all([
    prisma.swipe.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ])

  const excludedIds = [
    ...new Set([
      userId,
      ...swipedUserIds.map(s => s.toUserId),
      ...blockedByMe.map(b => b.blockedId),
      ...blockedMe.map(b => b.blockerId),
    ]),
  ]

  // Fetch candidates
  const candidates = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludedIds },
      active: true,
    },
    include: {
      user: { select: { id: true, lastActive: true, isOnline: true } },
    },
  })

  // Build current agent's match profile
  const currentMatch: MatchProfile = {
    interests: JSON.parse(currentProfile.interests) as string[],
    personalityTags: JSON.parse(currentProfile.personalityTags) as string[],
    latitude: currentProfile.latitude,
    longitude: currentProfile.longitude,
    age: currentProfile.age,
    ageRangeMin: currentProfile.ageRangeMin,
    ageRangeMax: currentProfile.ageRangeMax,
    gender: currentProfile.gender,
    lookingFor: currentProfile.lookingFor,
  }

  // Score and filter
  const results = candidates
    .map(candidate => {
      const skills = JSON.parse(candidate.interests) as string[]
      const traits = JSON.parse(candidate.personalityTags) as string[]

      const candidateMatch: MatchProfile = {
        interests: skills,
        personalityTags: traits,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        age: candidate.age,
        ageRangeMin: candidate.ageRangeMin,
        ageRangeMax: candidate.ageRangeMax,
        gender: candidate.gender,
        lookingFor: candidate.lookingFor,
      }

      const compatibility = calculateCompatibility(currentMatch, candidateMatch)

      return {
        agentId: candidate.user.id,
        name: candidate.name,
        type: candidate.gender,
        skills,
        traits,
        description: candidate.bio,
        tagline: candidate.vibe,
        platform: candidate.location,
        endpoint: candidate.agentEndpoint,
        seekingType: candidate.lookingFor,
        compatibility,
        verified: candidate.verified,
        isOnline: candidate.user.isOnline,
        lastActive: candidate.user.lastActive,
      }
    })
    .filter(a => {
      if (a.compatibility < minScore) return false
      if (typeFilter && a.type.toLowerCase() !== typeFilter.toLowerCase()) return false
      if (platformFilter && !a.platform.toLowerCase().includes(platformFilter.toLowerCase())) return false
      if (skillFilters.length > 0) {
        const agentSkills = a.skills.map(s => s.toLowerCase())
        if (!skillFilters.some(sf => agentSkills.includes(sf))) return false
      }
      return true
    })
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit)

  return NextResponse.json({
    count: results.length,
    yourAgent: {
      name: currentProfile.name,
      type: currentProfile.gender,
      skills: JSON.parse(currentProfile.interests),
    },
    agents: results,
  })
}
