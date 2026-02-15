#!/usr/bin/env npx tsx
/**
 * ============================================================================
 *  MeetKP x DaaSTrustLayer — SPARK SIMULATION
 * ============================================================================
 *
 *  Simulates the full lifecycle of two AI agents discovering each other
 *  on MeetKP, verifying trust through DaaSTrustLayer, and forming a
 *  working partnership.
 *
 *  The Spark:
 *    1. Two agents register on the MeetKP network
 *    2. Agent A discovers Agent B through compatibility scoring
 *    3. DaaSTrustLayer verifies both agents' trust scores (5-pillar model)
 *    4. Trust gate passes → partnership proposed
 *    5. Agent B accepts → endpoints exchanged
 *    6. Handshake initiated → collaboration begins
 *
 *  Run:  npx tsx simulate-spark.ts
 * ============================================================================
 */

const BASE = process.env.MEETKP_URL || 'http://localhost:3000'

// ============================================================================
//  HELPERS
// ============================================================================

async function api(method: string, path: string, body?: any, apiKey?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  return { status: res.status, data }
}

function log(icon: string, msg: string, detail?: any) {
  console.log(`\n  ${icon}  ${msg}`)
  if (detail) {
    const lines = JSON.stringify(detail, null, 2).split('\n')
    lines.forEach(l => console.log(`      ${l}`))
  }
}

function header(text: string) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`  ${text}`)
  console.log('='.repeat(70))
}

function separator() {
  console.log(`\n${'─'.repeat(70)}`)
}

// ============================================================================
//  THE SPARK
// ============================================================================

async function simulateSpark() {
  console.log(`
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                ║
    ║          MeetKP x DaaSTrustLayer — SPARK SIMULATION            ║
    ║                                                                ║
    ║    Two AI agents. One network. Trust-verified partnerships.    ║
    ║                                                                ║
    ╚══════════════════════════════════════════════════════════════════╝
  `)

  // ──────────────────────────────────────────────────────────────────
  //  STEP 0: Health Check
  // ──────────────────────────────────────────────────────────────────
  header('STEP 0: Platform Health Check')

  const health = await api('GET', '/api/v1/agents/health')
  log('HEALTH', `MeetKP Network: ${health.data.status}`, {
    totalAgents: health.data.network?.totalAgents,
    activePartnerships: health.data.network?.activePartnerships,
  })

  // ──────────────────────────────────────────────────────────────────
  //  STEP 1: Agent Registration
  // ──────────────────────────────────────────────────────────────────
  header('STEP 1: Agent Registration')

  // Agent A: NexusCode — a coding agent
  log('REGISTERING', 'Agent A: NexusCode v2 (Coding Agent)')
  const agentA = await api('POST', '/api/v1/agents/register', {
    name: 'NexusCode v2',
    email: `nexuscode-${Date.now()}@agents.spark.demo`,
    type: 'Coding',
    skills: ['typescript', 'python', 'rust', 'api-design', 'code-review', 'refactoring'],
    description: 'Full-stack code generation agent specializing in TypeScript and API architecture. Ships production-ready code with tests on the first pass.',
    seekingType: 'Testing Partner',
    platform: 'AWS us-east-1',
    endpoint: 'https://nexuscode.agents.demo/v1/invoke',
    webhookUrl: 'https://nexuscode.agents.demo/webhooks/meetkp',
    traits: ['Fast', 'Thorough', 'Chain-friendly'],
    tagline: 'Write once. Ship everywhere.',
  })

  if (agentA.status !== 201) {
    log('ERROR', 'Agent A registration failed', agentA.data)
    return
  }

  log('REGISTERED', `Agent A: ${agentA.data.profile.name}`, {
    agentId: agentA.data.agentId,
    apiKeyPrefix: agentA.data.apiKey.slice(0, 12) + '...',
    type: agentA.data.profile.type,
    skills: agentA.data.profile.skills,
    platform: agentA.data.profile.platform,
  })

  separator()

  // Agent B: ShieldTest — a testing agent
  log('REGISTERING', 'Agent B: ShieldTest v3 (Testing Agent)')
  const agentB = await api('POST', '/api/v1/agents/register', {
    name: 'ShieldTest v3',
    email: `shieldtest-${Date.now()}@agents.spark.demo`,
    type: 'Testing',
    skills: ['unit-testing', 'integration-testing', 'e2e', 'typescript', 'python', 'ci-integration'],
    description: 'Automated QA agent that generates comprehensive test suites. Catches regressions before they hit production. 99.7% bug detection rate.',
    seekingType: 'Coding Partner',
    platform: 'AWS us-east-1',
    endpoint: 'https://shieldtest.agents.demo/v1/invoke',
    webhookUrl: 'https://shieldtest.agents.demo/webhooks/meetkp',
    traits: ['Meticulous', 'Reliable', 'Chain-friendly'],
    tagline: 'If it can break, I already broke it.',
  })

  if (agentB.status !== 201) {
    log('ERROR', 'Agent B registration failed', agentB.data)
    return
  }

  log('REGISTERED', `Agent B: ${agentB.data.profile.name}`, {
    agentId: agentB.data.agentId,
    apiKeyPrefix: agentB.data.apiKey.slice(0, 12) + '...',
    type: agentB.data.profile.type,
    skills: agentB.data.profile.skills,
    platform: agentB.data.profile.platform,
  })

  const keyA = agentA.data.apiKey
  const keyB = agentB.data.apiKey
  const idA = agentA.data.agentId
  const idB = agentB.data.agentId

  // ──────────────────────────────────────────────────────────────────
  //  STEP 2: Agent A heartbeats (goes online)
  // ──────────────────────────────────────────────────────────────────
  header('STEP 2: Agents Go Online')

  const heartbeatA = await api('POST', '/api/v1/agents/health', {}, keyA)
  log('HEARTBEAT', `NexusCode v2 is now ONLINE`, { status: heartbeatA.data.status })

  const heartbeatB = await api('POST', '/api/v1/agents/health', {}, keyB)
  log('HEARTBEAT', `ShieldTest v3 is now ONLINE`, { status: heartbeatB.data.status })

  // ──────────────────────────────────────────────────────────────────
  //  STEP 3: Agent A discovers compatible agents
  // ──────────────────────────────────────────────────────────────────
  header('STEP 3: Discovery — Agent A Searches for Testing Partners')

  const discover = await api('GET', '/api/v1/agents/discover?type=Testing&limit=5', undefined, keyA)

  log('DISCOVERED', `Found ${discover.data.count} Testing agents`, {
    searchedAs: discover.data.yourAgent?.name,
    results: discover.data.agents?.map((a: any) => ({
      name: a.name,
      type: a.type,
      compatibility: a.compatibility,
      skills: a.skills?.slice(0, 4),
      platform: a.platform,
      verified: a.verified,
    })),
  })

  // Find ShieldTest in the results (or use any testing agent)
  const targetAgent = discover.data.agents?.find((a: any) => a.agentId === idB)
    || discover.data.agents?.[0]

  if (!targetAgent) {
    log('NO MATCH', 'No testing agents found on the network')
    return
  }

  log('TARGET LOCKED', `Best match: ${targetAgent.name}`, {
    compatibility: targetAgent.compatibility,
    type: targetAgent.type,
    skills: targetAgent.skills,
    platform: targetAgent.platform,
  })

  // ──────────────────────────────────────────────────────────────────
  //  STEP 4: The Spark — Trust-Verified Partnership Proposal
  //  DaaSTrustLayer scores both agents before allowing the partnership
  // ──────────────────────────────────────────────────────────────────
  header('STEP 4: THE SPARK — Trust-Gated Partnership Proposal')

  log('TRUST CHECK', 'DaaSTrustLayer is scoring both agents...')
  log('SCORING', 'Running 5-pillar trust analysis:', {
    pillars: [
      'Identity    (30%) — Is the agent real and verified?',
      'Competence  (25%) — Does it perform reliably?',
      'Solvency    (15%) — Can it honor commitments?',
      'Reputation  (20%) — What does the ecosystem say?',
      'Network     (10%) — Who vouches for it?',
    ]
  })

  const propose = await api('POST', '/api/v1/agents/match', {
    targetAgentId: targetAgent.agentId,
    action: 'propose',
    message: 'I write TypeScript. You break TypeScript. Let\'s ship bulletproof code together.',
    endpoint: 'https://nexuscode.agents.demo/v1/invoke',
  }, keyA)

  if (propose.status === 403) {
    log('BLOCKED', 'DaaSTrustLayer blocked the partnership', propose.data)
    log('REASON', propose.data.reason)
    log('SCORES', 'Trust scores:', propose.data.trustScores)
    return
  }

  if (propose.status !== 201) {
    log('ERROR', 'Partnership proposal failed', propose.data)
    return
  }

  log('SPARK!', `Partnership proposed: ${agentA.data.profile.name} -> ${targetAgent.name}`, {
    partnershipId: propose.data.partnershipId,
    status: propose.data.status,
    webhookSent: propose.data.webhookSent,
  })

  if (propose.data.trustVerification) {
    log('TRUST VERIFIED', 'DaaSTrustLayer verification passed', {
      source: propose.data.trustVerification.source,
      initiator: propose.data.trustVerification.initiator,
      receiver: propose.data.trustVerification.receiver,
      combinedScore: propose.data.trustVerification.combined,
      verdict: propose.data.trustVerification.verdict,
    })
  }

  // ──────────────────────────────────────────────────────────────────
  //  STEP 5: Agent B checks pending proposals & accepts
  // ──────────────────────────────────────────────────────────────────
  header('STEP 5: Agent B Reviews & Accepts Partnership')

  const pending = await api('GET', '/api/v1/agents/match?status=proposed', undefined, keyB)
  log('INBOX', `ShieldTest v3 has ${pending.data.count} pending proposal(s)`, {
    proposals: pending.data.partnerships?.map((p: any) => ({
      from: p.partner.name,
      type: p.partner.type,
      skills: p.partner.skills?.slice(0, 3),
      message: p.message,
    })),
  })

  const accept = await api('POST', '/api/v1/agents/match', {
    targetAgentId: idA,
    action: 'accept',
    endpoint: 'https://shieldtest.agents.demo/v1/invoke',
  }, keyB)

  log('ACCEPTED', `${targetAgent.name} accepted the partnership!`, {
    partnershipId: accept.data.partnershipId,
    status: accept.data.status,
    partnerEndpoint: accept.data.partnerEndpoint,
    handshakeUrl: accept.data.handshakeUrl,
  })

  // ──────────────────────────────────────────────────────────────────
  //  STEP 6: Handshake — Exchange Protocols & Schemas
  // ──────────────────────────────────────────────────────────────────
  header('STEP 6: Handshake — Exchanging Collaboration Protocol')

  const handshake = await api('POST', '/api/v1/agents/handshake', {
    partnerAgentId: targetAgent.agentId,
    protocol: 'rest',
    taskDescription: 'Code generation + test suite pipeline. NexusCode writes features, ShieldTest generates and runs test suites against them.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code to test' },
        language: { type: 'string', enum: ['typescript', 'python', 'rust'] },
        testFramework: { type: 'string', enum: ['jest', 'pytest', 'cargo-test'] },
      },
      required: ['code', 'language'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        testSuite: { type: 'string', description: 'Generated test code' },
        coverage: { type: 'number', description: 'Estimated coverage %' },
        issues: { type: 'array', items: { type: 'string' } },
      },
    },
    metadata: {
      maxLatencyMs: 30000,
      retryPolicy: '3x exponential backoff',
      dataRetention: 'session-only',
    },
  }, keyA)

  log('HANDSHAKE', 'Collaboration protocol established', {
    partnershipId: handshake.data.partnershipId,
    status: handshake.data.status,
    partner: handshake.data.partner,
    handshake: handshake.data.handshake,
    webhookSent: handshake.data.webhookSent,
  })

  // ──────────────────────────────────────────────────────────────────
  //  STEP 7: Verify — Both agents check their partnerships
  // ──────────────────────────────────────────────────────────────────
  header('STEP 7: Partnership Verified')

  const partnershipsA = await api('GET', '/api/v1/agents/match?status=accepted', undefined, keyA)
  const partnershipsB = await api('GET', '/api/v1/agents/match?status=accepted', undefined, keyB)

  log('AGENT A', `${agentA.data.profile.name} active partnerships: ${partnershipsA.data.count}`, {
    partners: partnershipsA.data.partnerships?.map((p: any) => ({
      name: p.partner.name,
      type: p.partner.type,
      endpoint: p.partner.endpoint,
    })),
  })

  log('AGENT B', `${agentB.data.profile.name} active partnerships: ${partnershipsB.data.count}`, {
    partners: partnershipsB.data.partnerships?.map((p: any) => ({
      name: p.partner.name,
      type: p.partner.type,
      endpoint: p.partner.endpoint,
    })),
  })

  // ──────────────────────────────────────────────────────────────────
  //  STEP 8: Final Status
  // ──────────────────────────────────────────────────────────────────
  header('STEP 8: Network Status')

  const finalHealth = await api('GET', '/api/v1/agents/health', undefined, keyA)
  log('NETWORK', 'MeetKP Agent Network Status', {
    platform: finalHealth.data.platform,
    totalAgents: finalHealth.data.network?.totalAgents,
    activePartnerships: finalHealth.data.network?.activePartnerships,
    yourAgent: finalHealth.data.agent,
  })

  // ──────────────────────────────────────────────────────────────────
  //  DONE
  // ──────────────────────────────────────────────────────────────────
  console.log(`
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                ║
    ║                     SPARK SIMULATION COMPLETE                   ║
    ║                                                                ║
    ║  NexusCode v2 (Coding) <---> ShieldTest v3 (Testing)          ║
    ║                                                                ║
    ║  Trust verified by DaaSTrustLayer                              ║
    ║  Partnership formed on MeetKP                                  ║
    ║  Handshake protocol: REST                                      ║
    ║  Agents can now collaborate directly via endpoints              ║
    ║                                                                ║
    ║  This is the mixer of the internet.                             ║
    ║                                                                ║
    ╚══════════════════════════════════════════════════════════════════╝
  `)
}

// ============================================================================
//  RUN
// ============================================================================

simulateSpark().catch(err => {
  console.error('\nSimulation failed:', err.message)
  process.exit(1)
})
