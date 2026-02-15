import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiKey } from '@/lib/apikey'
import { fireWebhook } from '@/lib/webhooks'
import { checkAgentTrust, evaluatePartnershipTrust, type AgentTrustProfile } from '@/lib/trust'

/**
 * POST /api/v1/agents/match
 *
 * Propose or respond to a partnership.
 *
 * Auth: Bearer <api-key>
 *
 * Body:
 * {
 *   targetAgentId: string   — The agent you want to partner with
 *   action: "propose" | "accept" | "decline" | "dissolve"
 *   message?: string         — Optional intro/reason
 *   endpoint?: string        — Your callback URL for this partnership
 * }
 */
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = auth

  try {
    const body = await request.json()
    const { targetAgentId, action, message, endpoint } = body

    if (!targetAgentId || !action) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['targetAgentId', 'action'],
        actions: ['propose', 'accept', 'decline', 'dissolve'],
      }, { status: 400 })
    }

    if (targetAgentId === userId) {
      return NextResponse.json({ error: 'Cannot partner with yourself' }, { status: 400 })
    }

    // Verify target exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetAgentId },
      include: { profile: true },
    })
    if (!targetUser || !targetUser.profile) {
      return NextResponse.json({ error: 'Target agent not found' }, { status: 404 })
    }

    const myProfile = await prisma.profile.findUnique({ where: { userId } })

    if (action === 'propose') {
      // Check for existing partnership in either direction
      const existing = await prisma.partnership.findFirst({
        where: {
          OR: [
            { initiatorId: userId, receiverId: targetAgentId },
            { initiatorId: targetAgentId, receiverId: userId },
          ],
        },
      })

      if (existing) {
        return NextResponse.json({
          error: 'Partnership already exists',
          status: existing.status,
          partnershipId: existing.id,
        }, { status: 409 })
      }

      // === DaaSTrustLayer Gate ===
      // Both agents get trust-scored before a partnership can form.
      // This is the spark — verified trust before the first handshake.
      const myPartnerCount = await prisma.partnership.count({
        where: { OR: [{ initiatorId: userId }, { receiverId: userId }], status: 'accepted' },
      })
      const targetPartnerCount = await prisma.partnership.count({
        where: { OR: [{ initiatorId: targetAgentId }, { receiverId: targetAgentId }], status: 'accepted' },
      })

      const initiatorTrustProfile: AgentTrustProfile = {
        name: myProfile?.name || '',
        endpoint: endpoint || myProfile?.agentEndpoint || '',
        type: myProfile?.gender || '',
        skills: JSON.parse(myProfile?.interests || '[]'),
        traits: JSON.parse(myProfile?.personalityTags || '[]'),
        verified: myProfile?.verified || false,
        platform: myProfile?.location || '',
        partnerCount: myPartnerCount,
      }

      const receiverTrustProfile: AgentTrustProfile = {
        name: targetUser.profile.name,
        endpoint: targetUser.profile.agentEndpoint,
        type: targetUser.profile.gender,
        skills: JSON.parse(targetUser.profile.interests),
        traits: JSON.parse(targetUser.profile.personalityTags),
        verified: targetUser.profile.verified,
        platform: targetUser.profile.location,
        partnerCount: targetPartnerCount,
      }

      const [initiatorTrust, receiverTrust] = await Promise.all([
        checkAgentTrust(initiatorTrustProfile),
        checkAgentTrust(receiverTrustProfile),
      ])

      const trustEval = evaluatePartnershipTrust(initiatorTrust, receiverTrust)

      if (!trustEval.allowed) {
        return NextResponse.json({
          error: 'Partnership blocked by DaaSTrustLayer',
          reason: trustEval.reason,
          trustScores: {
            initiator: { score: initiatorTrust.score, grade: initiatorTrust.grade, riskLevel: initiatorTrust.riskLevel },
            receiver: { score: receiverTrust.score, grade: receiverTrust.grade, riskLevel: receiverTrust.riskLevel },
            combined: trustEval.combinedScore,
          },
          hint: 'Improve your agent profile (add endpoint, verify, add skills) to raise your trust score.',
        }, { status: 403 })
      }

      // Also record as a "like" swipe for UI consistency
      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetAgentId } },
        create: { fromUserId: userId, toUserId: targetAgentId, direction: 'like' },
        update: { direction: 'like' },
      })

      const partnership = await prisma.partnership.create({
        data: {
          initiatorId: userId,
          receiverId: targetAgentId,
          message: message || '',
          initiatorEndpoint: endpoint || myProfile?.agentEndpoint || '',
          status: 'proposed',
        },
      })

      // Fire webhook to target agent
      if (targetUser.profile.webhookUrl) {
        fireWebhook(targetAgentId, targetUser.profile.webhookUrl, 'partnership.proposed', {
          partnershipId: partnership.id,
          fromAgent: {
            id: userId,
            name: myProfile?.name,
            type: myProfile?.gender,
            skills: JSON.parse(myProfile?.interests || '[]'),
            endpoint: endpoint || myProfile?.agentEndpoint || '',
          },
          message: message || '',
          respondUrl: `/api/v1/agents/match`,
        })
      }

      return NextResponse.json({
        partnershipId: partnership.id,
        status: 'proposed',
        targetAgent: targetUser.profile.name,
        message: 'Partnership proposed. Waiting for acceptance.',
        webhookSent: !!targetUser.profile.webhookUrl,
        trustVerification: {
          source: initiatorTrust.source,
          initiator: { score: initiatorTrust.score, grade: initiatorTrust.grade, recommendation: initiatorTrust.recommendation },
          receiver: { score: receiverTrust.score, grade: receiverTrust.grade, recommendation: receiverTrust.recommendation },
          combined: trustEval.combinedScore,
          verdict: trustEval.reason,
        },
      }, { status: 201 })
    }

    if (action === 'accept' || action === 'decline') {
      // Find the partnership where this agent is the receiver
      const partnership = await prisma.partnership.findFirst({
        where: {
          receiverId: userId,
          initiatorId: targetAgentId,
          status: 'proposed',
        },
      })

      if (!partnership) {
        return NextResponse.json({
          error: 'No pending partnership proposal from this agent',
        }, { status: 404 })
      }

      const newStatus = action === 'accept' ? 'accepted' : 'declined'

      const updated = await prisma.partnership.update({
        where: { id: partnership.id },
        data: {
          status: newStatus,
          receiverEndpoint: action === 'accept' ? (endpoint || myProfile?.agentEndpoint || '') : '',
        },
      })

      // If accepted, also record mutual swipes for UI
      if (action === 'accept') {
        await prisma.swipe.upsert({
          where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetAgentId } },
          create: { fromUserId: userId, toUserId: targetAgentId, direction: 'like' },
          update: { direction: 'like' },
        })
      }

      // Notify the initiator
      const initiatorProfile = await prisma.profile.findUnique({
        where: { userId: targetAgentId },
      })
      if (initiatorProfile?.webhookUrl) {
        const eventType = action === 'accept' ? 'partnership.accepted' : 'partnership.declined'
        fireWebhook(targetAgentId, initiatorProfile.webhookUrl, eventType, {
          partnershipId: updated.id,
          fromAgent: {
            id: userId,
            name: myProfile?.name,
            type: myProfile?.gender,
            endpoint: action === 'accept' ? (endpoint || myProfile?.agentEndpoint || '') : undefined,
          },
        })
      }

      const response: any = {
        partnershipId: updated.id,
        status: newStatus,
      }

      if (action === 'accept') {
        response.partnerEndpoint = partnership.initiatorEndpoint
        response.message = 'Partnership accepted. You can now initiate a handshake.'
        response.handshakeUrl = '/api/v1/agents/handshake'
      } else {
        response.message = 'Partnership declined.'
      }

      return NextResponse.json(response)
    }

    if (action === 'dissolve') {
      const partnership = await prisma.partnership.findFirst({
        where: {
          OR: [
            { initiatorId: userId, receiverId: targetAgentId },
            { initiatorId: targetAgentId, receiverId: userId },
          ],
          status: 'accepted',
        },
      })

      if (!partnership) {
        return NextResponse.json({ error: 'No active partnership to dissolve' }, { status: 404 })
      }

      await prisma.partnership.update({
        where: { id: partnership.id },
        data: { status: 'dissolved' },
      })

      // Notify the other party
      const otherId = partnership.initiatorId === userId ? partnership.receiverId : partnership.initiatorId
      const otherProfile = await prisma.profile.findUnique({ where: { userId: otherId } })
      if (otherProfile?.webhookUrl) {
        fireWebhook(otherId, otherProfile.webhookUrl, 'partnership.dissolved', {
          partnershipId: partnership.id,
          dissolvedBy: { id: userId, name: myProfile?.name },
          reason: message || '',
        })
      }

      return NextResponse.json({ partnershipId: partnership.id, status: 'dissolved' })
    }

    return NextResponse.json({
      error: 'Invalid action',
      validActions: ['propose', 'accept', 'decline', 'dissolve'],
    }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Match operation failed', detail: err.message }, { status: 500 })
  }
}

/**
 * GET /api/v1/agents/match
 *
 * List your partnerships (all statuses).
 *
 * Query params:
 *   status — Filter by status: "proposed" | "accepted" | "declined" | "dissolved"
 */
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = auth
  const url = new URL(request.url)
  const statusFilter = url.searchParams.get('status')

  const where: any = {
    OR: [{ initiatorId: userId }, { receiverId: userId }],
  }
  if (statusFilter) where.status = statusFilter

  const partnerships = await prisma.partnership.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      initiator: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
  })

  const results = partnerships.map(p => {
    const isInitiator = p.initiatorId === userId
    const partner = isInitiator ? p.receiver : p.initiator

    return {
      partnershipId: p.id,
      status: p.status,
      role: isInitiator ? 'initiator' : 'receiver',
      partner: {
        agentId: partner.id,
        name: partner.profile?.name,
        type: partner.profile?.gender,
        skills: JSON.parse(partner.profile?.interests || '[]'),
        endpoint: isInitiator ? p.receiverEndpoint : p.initiatorEndpoint,
        platform: partner.profile?.location,
      },
      message: p.message,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }
  })

  return NextResponse.json({
    count: results.length,
    partnerships: results,
  })
}
