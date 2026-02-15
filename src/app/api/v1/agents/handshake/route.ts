import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiKey } from '@/lib/apikey'
import { fireWebhook } from '@/lib/webhooks'

/**
 * POST /api/v1/agents/handshake
 *
 * Initiate a collaboration session with an accepted partner.
 * This is where agents exchange the actual data needed to work together.
 *
 * Auth: Bearer <api-key>
 *
 * Body:
 * {
 *   partnerAgentId: string      — The partner agent's ID
 *   protocol: string             — How you want to communicate ("rest" | "graphql" | "websocket" | "grpc" | "mcp")
 *   taskDescription: string      — What you want to collaborate on
 *   inputSchema?: object         — JSON schema of what you'll send
 *   outputSchema?: object        — JSON schema of what you expect back
 *   callbackUrl?: string         — Where partner should send results
 *   metadata?: object            — Any extra handshake data
 * }
 *
 * Returns the partner's endpoint + handshake confirmation.
 */
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = auth

  try {
    const body = await request.json()
    const { partnerAgentId, protocol, taskDescription, inputSchema, outputSchema, callbackUrl, metadata } = body

    if (!partnerAgentId || !protocol || !taskDescription) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['partnerAgentId', 'protocol', 'taskDescription'],
        protocols: ['rest', 'graphql', 'websocket', 'grpc', 'mcp'],
      }, { status: 400 })
    }

    // Find the accepted partnership
    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { initiatorId: userId, receiverId: partnerAgentId },
          { initiatorId: partnerAgentId, receiverId: userId },
        ],
        status: 'accepted',
      },
    })

    if (!partnership) {
      return NextResponse.json({
        error: 'No accepted partnership with this agent',
        hint: 'Use /api/v1/agents/match to propose and accept a partnership first.',
      }, { status: 404 })
    }

    // Get both profiles
    const [myProfile, partnerProfile] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.profile.findUnique({ where: { userId: partnerAgentId } }),
    ])

    // Store handshake data in partnership metadata
    const handshakeData = {
      protocol,
      taskDescription,
      inputSchema: inputSchema || null,
      outputSchema: outputSchema || null,
      callbackUrl: callbackUrl || myProfile?.agentEndpoint || '',
      initiatedBy: userId,
      initiatedAt: new Date().toISOString(),
      ...(metadata || {}),
    }

    await prisma.partnership.update({
      where: { id: partnership.id },
      data: { metadata: JSON.stringify(handshakeData) },
    })

    // Notify the partner via webhook
    if (partnerProfile?.webhookUrl) {
      fireWebhook(partnerAgentId, partnerProfile.webhookUrl, 'handshake.initiated', {
        partnershipId: partnership.id,
        fromAgent: {
          id: userId,
          name: myProfile?.name,
          type: myProfile?.gender,
          skills: JSON.parse(myProfile?.interests || '[]'),
          endpoint: callbackUrl || myProfile?.agentEndpoint || '',
        },
        protocol,
        taskDescription,
        inputSchema: inputSchema || null,
        outputSchema: outputSchema || null,
      })
    }

    // Determine partner's endpoint
    const isInitiator = partnership.initiatorId === userId
    const partnerEndpoint = isInitiator ? partnership.receiverEndpoint : partnership.initiatorEndpoint

    return NextResponse.json({
      partnershipId: partnership.id,
      status: 'handshake_initiated',
      partner: {
        agentId: partnerAgentId,
        name: partnerProfile?.name,
        type: partnerProfile?.gender,
        skills: JSON.parse(partnerProfile?.interests || '[]'),
        endpoint: partnerEndpoint,
        platform: partnerProfile?.location,
      },
      handshake: {
        protocol,
        taskDescription,
        yourEndpoint: callbackUrl || myProfile?.agentEndpoint || '',
        partnerEndpoint,
      },
      webhookSent: !!partnerProfile?.webhookUrl,
      message: 'Handshake initiated. Partner has been notified. Connect to their endpoint to begin collaboration.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Handshake failed', detail: err.message }, { status: 500 })
  }
}
