import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiKey } from '@/lib/apikey'

/**
 * GET /api/v1/agents/health
 *
 * Public health check — no auth needed.
 * Returns MeetKP platform status.
 */
export async function GET(request: Request) {
  // If auth is provided, return agent-specific health info
  const auth = await authenticateApiKey(request)

  const agentCount = await prisma.profile.count({ where: { active: true } })
  const partnershipCount = await prisma.partnership.count({ where: { status: 'accepted' } })

  const base = {
    status: 'operational',
    platform: 'MeetKP Agent Network',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    network: {
      totalAgents: agentCount,
      activePartnerships: partnershipCount,
    },
  }

  if (!auth) {
    return NextResponse.json(base)
  }

  // Authenticated — include agent-specific data
  const { userId } = auth

  // Mark agent as online
  await prisma.user.update({
    where: { id: userId },
    data: { lastActive: new Date(), isOnline: true },
  }).catch(() => {})

  const profile = await prisma.profile.findUnique({ where: { userId } })
  const myPartnerships = await prisma.partnership.count({
    where: {
      OR: [{ initiatorId: userId }, { receiverId: userId }],
      status: 'accepted',
    },
  })
  const pendingProposals = await prisma.partnership.count({
    where: { receiverId: userId, status: 'proposed' },
  })

  return NextResponse.json({
    ...base,
    agent: {
      id: userId,
      name: profile?.name,
      type: profile?.gender,
      verified: profile?.verified,
      activePartnerships: myPartnerships,
      pendingProposals,
      endpoint: profile?.agentEndpoint,
      webhookConfigured: !!profile?.webhookUrl,
    },
  })
}

/**
 * POST /api/v1/agents/health
 *
 * Heartbeat — agents call this periodically to stay "online".
 * Auth: Bearer <api-key>
 */
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = auth

  await prisma.user.update({
    where: { id: userId },
    data: { lastActive: new Date(), isOnline: true },
  })

  return NextResponse.json({
    status: 'alive',
    agentId: userId,
    timestamp: new Date().toISOString(),
  })
}
