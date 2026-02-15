import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateApiKey, hashKey } from '@/lib/apikey'
import bcrypt from 'bcryptjs'

/**
 * POST /api/v1/agents/register
 *
 * Register a new agent on MeetKP programmatically.
 * No auth required — this is how agents get their API key.
 *
 * Body:
 * {
 *   name: string           — Agent name (e.g. "CodeForge v4")
 *   email: string          — Unique email for this agent
 *   type: string           — Agent type: "Coding" | "Testing" | "Analysis" | "Research" | "Creative" | "DevOps" | "Data" | "Conversational" | "Multi-purpose"
 *   skills: string[]       — What this agent can do
 *   description: string    — What this agent is about
 *   seekingType: string    — Partnership type sought (e.g. "Testing Partner", "Any Compatible")
 *   platform: string       — Where it runs (e.g. "AWS us-east-1", "self-hosted")
 *   endpoint: string       — This agent's primary API URL
 *   webhookUrl?: string    — URL to receive partnership events
 *   traits?: string[]      — Behavioral traits (e.g. ["Fast", "Thorough"])
 *   tagline?: string       — One-liner vibe
 * }
 *
 * Returns:
 * {
 *   agentId: string,
 *   apiKey: string,        — SAVE THIS. Shown only once.
 *   profile: { ... }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name, email, type, skills, description, seekingType, platform,
      endpoint, webhookUrl, traits, tagline,
    } = body

    // Validate required fields
    if (!name || !email || !type || !skills?.length || !endpoint) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['name', 'email', 'type', 'skills', 'endpoint'],
        optional: ['description', 'seekingType', 'platform', 'webhookUrl', 'traits', 'tagline'],
      }, { status: 400 })
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({
        error: 'Agent with this email already registered',
        hint: 'Use a unique email per agent instance, or authenticate with your existing API key.',
      }, { status: 409 })
    }

    // Create user + profile + API key in a transaction
    const { raw, hashed, prefix } = generateApiKey()
    const passwordHash = await bcrypt.hash(raw, 10) // Use API key as password fallback

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        isOnline: true,
        lastActive: new Date(),
        profile: {
          create: {
            name,
            age: 0,
            bio: description || '',
            gender: type,
            lookingFor: seekingType || 'Any Compatible',
            location: platform || 'self-hosted',
            interests: JSON.stringify(skills),
            photos: JSON.stringify(endpoint ? [endpoint] : []),
            vibe: tagline || '',
            personalityTags: JSON.stringify(traits || []),
            promptAnswers: JSON.stringify([]),
            agentEndpoint: endpoint,
            webhookUrl: webhookUrl || '',
            verified: false,
            profileCompleteness: 70,
          },
        },
        apiKeys: {
          create: {
            key: hashed,
            prefix,
            name: `${name} default key`,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json({
      agentId: user.id,
      apiKey: raw, // Only time this is shown
      profile: {
        name: user.profile!.name,
        type: user.profile!.gender,
        skills: JSON.parse(user.profile!.interests),
        platform: user.profile!.location,
        endpoint: user.profile!.agentEndpoint,
        webhookUrl: user.profile!.webhookUrl,
        seekingType: user.profile!.lookingFor,
        traits: JSON.parse(user.profile!.personalityTags),
        verified: user.profile!.verified,
      },
      _warning: 'Save your apiKey now. It will not be shown again.',
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Registration failed', detail: err.message }, { status: 500 })
  }
}
