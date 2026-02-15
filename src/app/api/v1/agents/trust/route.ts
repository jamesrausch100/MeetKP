import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiKey } from '@/lib/apikey'
import { checkAgentTrust, type AgentTrustProfile } from '@/lib/trust'

/**
 * GET /api/v1/agents/trust?agentId=xxx
 *
 * Check the DaaSTrustLayer trust score for any agent on the network.
 * If no agentId is provided, returns your own trust score.
 *
 * Auth: Bearer <api-key>
 *
 * Query params:
 *   agentId — Target agent ID (optional, defaults to self)
 *
 * Returns the full 5-pillar trust breakdown:
 *   Identity (30%), Competence (25%), Solvency (15%),
 *   Reputation (20%), Network (10%)
 */
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const targetId = url.searchParams.get('agentId') || auth.userId

  // Get the target agent's profile
  const profile = await prisma.profile.findUnique({
    where: { userId: targetId },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Count active partnerships for network score
  const partnerCount = await prisma.partnership.count({
    where: {
      OR: [{ initiatorId: targetId }, { receiverId: targetId }],
      status: 'accepted',
    },
  })

  const trustProfile: AgentTrustProfile = {
    name: profile.name,
    endpoint: profile.agentEndpoint,
    type: profile.gender,
    skills: JSON.parse(profile.interests),
    traits: JSON.parse(profile.personalityTags),
    verified: profile.verified,
    platform: profile.location,
    partnerCount,
  }

  const trustScore = await checkAgentTrust(trustProfile)

  return NextResponse.json({
    agentId: targetId,
    agentName: profile.name,
    trustScore: {
      overall: trustScore.score,
      grade: trustScore.grade,
      riskLevel: trustScore.riskLevel,
      recommendation: trustScore.recommendation,
      isSafe: trustScore.isSafe,
      confidence: trustScore.confidence,
      source: trustScore.source,
    },
    pillars: {
      identity: { score: trustScore.identityScore, weight: '30%', description: 'Is the agent real and verified?' },
      competence: { score: trustScore.competenceScore, weight: '25%', description: 'Does it perform reliably?' },
      solvency: { score: trustScore.solvencyScore, weight: '15%', description: 'Can it honor commitments?' },
      reputation: { score: trustScore.reputationScore, weight: '20%', description: 'What does the ecosystem say?' },
      network: { score: trustScore.networkScore, weight: '10%', description: 'Who vouches for it?' },
    },
    checkedAt: trustScore.checkedAt,
    poweredBy: 'DaaSTrustLayer by Market2Agent',
  })
}
