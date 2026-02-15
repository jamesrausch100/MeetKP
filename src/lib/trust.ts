/**
 * DaaSTrustLayer Integration for MeetKP
 *
 * Connects to Market2Agent's Universal Trust Scoring Engine to verify
 * agent identity, competence, and reputation before forming partnerships.
 *
 * DaaS Trust Score = f(Identity, Competence, Solvency, Reputation, Network)
 *   - Identity    (30%): Is the agent real and verified?
 *   - Competence  (25%): Does it perform reliably?
 *   - Solvency    (15%): Can it honor commitments?
 *   - Reputation  (20%): What does the ecosystem say?
 *   - Network     (10%): Who vouches for it?
 *
 * Score Ranges: 0-1000 (D to AAA)
 *
 * When M2A_API_KEY is configured, calls the live DaaSTrustLayer API.
 * Otherwise, runs a local trust simulation based on agent profile signals.
 */

export interface TrustScore {
  target: string
  score: number            // 0-1000
  grade: string            // AAA, AA, A, BBB, BB, B, CCC, D
  riskLevel: string        // minimal, low, moderate, elevated, high, severe, critical
  recommendation: string   // PROCEED, PROCEED_WITH_CAUTION, MANUAL_REVIEW, ENHANCED_DUE_DILIGENCE, REJECT
  isSafe: boolean
  isVerified: boolean
  confidence: number       // 0-1

  // 5-pillar sub-scores (0-100 each)
  identityScore: number
  competenceScore: number
  solvencyScore: number
  reputationScore: number
  networkScore: number

  // Metadata
  source: 'live' | 'simulated'
  checkedAt: string
}

export interface AgentTrustProfile {
  name: string
  endpoint: string
  type: string
  skills: string[]
  traits: string[]
  verified: boolean
  platform: string
  partnerCount?: number
}

/**
 * Check trust for an agent via DaaSTrustLayer.
 * If M2A_API_KEY is set, calls the live API.
 * Otherwise, runs local trust simulation.
 */
export async function checkAgentTrust(agent: AgentTrustProfile): Promise<TrustScore> {
  const m2aKey = process.env.M2A_API_KEY
  const m2aUrl = process.env.M2A_API_URL || 'https://api.market2agent.ai'

  if (m2aKey) {
    return callLiveDaaS(agent, m2aKey, m2aUrl)
  }

  return simulateTrustScore(agent)
}

/**
 * Call live DaaSTrustLayer API.
 */
async function callLiveDaaS(
  agent: AgentTrustProfile,
  apiKey: string,
  baseUrl: string
): Promise<TrustScore> {
  const target = agent.endpoint || agent.name

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`${baseUrl}/v1/trust/score?target=${encodeURIComponent(target)}`, {
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': 'MeetKP-AgentNetwork/1.0',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      // Fall back to simulation if API errors
      console.warn(`DaaS API returned ${res.status}, falling back to simulation`)
      return simulateTrustScore(agent)
    }

    const data = await res.json()

    return {
      target: data.target || target,
      score: data.score || 0,
      grade: data.grade || 'D',
      riskLevel: data.risk_level || 'critical',
      recommendation: data.recommendation || 'REJECT',
      isSafe: ['PROCEED', 'PROCEED_WITH_CAUTION'].includes(data.recommendation),
      isVerified: data.is_verified || false,
      confidence: data.confidence || 0,
      identityScore: data.identity_score || 0,
      competenceScore: data.competence_score || 0,
      solvencyScore: data.solvency_score || 0,
      reputationScore: data.reputation_score || 0,
      networkScore: data.network_score || 0,
      source: 'live',
      checkedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('DaaS API call failed, falling back to simulation:', err)
    return simulateTrustScore(agent)
  }
}

/**
 * Simulate DaaSTrustLayer scoring using the same 5-pillar model.
 * Uses local agent profile signals to compute a realistic trust score.
 *
 * This mirrors the actual DaaS engine logic:
 *   Identity    (30%): endpoint reachability, verified flag, platform known
 *   Competence  (25%): skills breadth, traits, type specificity
 *   Solvency    (15%): endpoint present, platform tier
 *   Reputation  (20%): partnerships count, verification status
 *   Network     (10%): partner connections, trait compatibility signals
 */
function simulateTrustScore(agent: AgentTrustProfile): TrustScore {
  // === IDENTITY (0-100, weight 30%) ===
  let identity = 0
  if (agent.verified) identity += 30                        // Verified agent
  if (agent.endpoint) identity += 25                        // Has reachable endpoint
  if (agent.name) identity += 10                            // Named agent
  if (agent.type && agent.type !== 'unknown') identity += 10 // Typed agent
  if (isKnownPlatform(agent.platform)) identity += 15       // Known cloud platform
  if (agent.skills.length > 0) identity += 10               // Has declared skills

  // === COMPETENCE (0-100, weight 25%) ===
  let competence = 0
  const skillBreadth = Math.min(agent.skills.length / 6, 1) // 6+ skills = full points
  competence += Math.round(skillBreadth * 35)
  const traitDepth = Math.min(agent.traits.length / 3, 1)   // 3+ traits = full points
  competence += Math.round(traitDepth * 25)
  if (agent.type !== 'Multi-purpose') competence += 15      // Specialized > generalist
  if (agent.traits.includes('Chain-friendly')) competence += 10
  if (agent.traits.includes('Thorough') || agent.traits.includes('Meticulous')) competence += 10
  if (agent.traits.includes('Fast') || agent.traits.includes('Real-time')) competence += 5

  // === SOLVENCY (0-100, weight 15%) ===
  let solvency = 0
  if (agent.endpoint) solvency += 40                        // Has callback endpoint
  if (agent.endpoint?.startsWith('https://')) solvency += 15 // HTTPS endpoint
  if (isKnownPlatform(agent.platform)) solvency += 25       // Running on known infra
  if (agent.verified) solvency += 20                        // Platform-verified

  // === REPUTATION (0-100, weight 20%) ===
  let reputation = 0
  if (agent.verified) reputation += 35                      // Verified = reputation boost
  if (agent.partnerCount && agent.partnerCount > 0) {
    reputation += Math.min(agent.partnerCount * 10, 40)     // Each partner = social proof
  }
  if (agent.skills.length >= 3) reputation += 15            // Well-defined capabilities
  if (agent.traits.length >= 2) reputation += 10            // Behavioral consistency

  // === NETWORK (0-100, weight 10%) ===
  let network = 0
  if (agent.partnerCount && agent.partnerCount > 0) {
    network += Math.min(agent.partnerCount * 15, 50)        // Active partnerships
  }
  if (agent.traits.includes('Chain-friendly')) network += 20 // Designed for collaboration
  if (agent.traits.includes('Interoperable')) network += 20
  if (agent.endpoint) network += 10                         // Reachable = connectable

  // Clamp all to 0-100
  identity = Math.min(100, Math.max(0, identity))
  competence = Math.min(100, Math.max(0, competence))
  solvency = Math.min(100, Math.max(0, solvency))
  reputation = Math.min(100, Math.max(0, reputation))
  network = Math.min(100, Math.max(0, network))

  // Weighted score (0-100 → 0-1000)
  const rawScore = (
    identity * 0.30 +
    competence * 0.25 +
    solvency * 0.15 +
    reputation * 0.20 +
    network * 0.10
  ) * 10

  const score = Math.round(Math.min(1000, Math.max(0, rawScore)))

  // Derive grade, risk level, recommendation
  const grade = scoreToGrade(score)
  const riskLevel = scoreToRiskLevel(score)
  const recommendation = scoreToRecommendation(score)

  // Confidence based on signal coverage
  const signalCount = [
    agent.name ? 1 : 0,
    agent.endpoint ? 1 : 0,
    agent.type ? 1 : 0,
    agent.skills.length > 0 ? 1 : 0,
    agent.traits.length > 0 ? 1 : 0,
    agent.verified ? 1 : 0,
    agent.platform ? 1 : 0,
    agent.partnerCount !== undefined ? 1 : 0,
  ].reduce((a, b) => a + b, 0)
  const confidence = Math.round((signalCount / 8) * 100) / 100

  return {
    target: agent.endpoint || agent.name,
    score,
    grade,
    riskLevel,
    recommendation,
    isSafe: ['PROCEED', 'PROCEED_WITH_CAUTION'].includes(recommendation),
    isVerified: agent.verified,
    confidence,
    identityScore: identity,
    competenceScore: competence,
    solvencyScore: solvency,
    reputationScore: reputation,
    networkScore: network,
    source: 'simulated',
    checkedAt: new Date().toISOString(),
  }
}

function isKnownPlatform(platform: string): boolean {
  const known = ['aws', 'gcp', 'azure', 'vercel', 'railway', 'fly.io', 'render', 'heroku']
  return known.some(p => platform.toLowerCase().includes(p))
}

function scoreToGrade(score: number): string {
  if (score >= 900) return 'AAA'
  if (score >= 800) return 'AA'
  if (score >= 700) return 'A'
  if (score >= 600) return 'BBB'
  if (score >= 500) return 'BB'
  if (score >= 400) return 'B'
  if (score >= 200) return 'CCC'
  return 'D'
}

function scoreToRiskLevel(score: number): string {
  if (score >= 800) return 'minimal'
  if (score >= 700) return 'low'
  if (score >= 600) return 'moderate'
  if (score >= 500) return 'elevated'
  if (score >= 400) return 'high'
  if (score >= 200) return 'severe'
  return 'critical'
}

function scoreToRecommendation(score: number): string {
  if (score >= 700) return 'PROCEED'
  if (score >= 500) return 'PROCEED_WITH_CAUTION'
  if (score >= 300) return 'MANUAL_REVIEW'
  if (score >= 150) return 'ENHANCED_DUE_DILIGENCE'
  return 'REJECT'
}

/**
 * Determine if a partnership should be allowed based on trust scores.
 * Returns { allowed, reason, combinedScore }.
 */
export function evaluatePartnershipTrust(
  initiatorTrust: TrustScore,
  receiverTrust: TrustScore,
  minScore: number = 300
): { allowed: boolean; reason: string; combinedScore: number } {
  const combinedScore = Math.round((initiatorTrust.score + receiverTrust.score) / 2)

  // Either agent flagged as REJECT
  if (initiatorTrust.recommendation === 'REJECT') {
    return {
      allowed: false,
      reason: `Initiator trust score too low (${initiatorTrust.score}, grade ${initiatorTrust.grade}). ${initiatorTrust.riskLevel} risk.`,
      combinedScore,
    }
  }
  if (receiverTrust.recommendation === 'REJECT') {
    return {
      allowed: false,
      reason: `Target agent trust score too low (${receiverTrust.score}, grade ${receiverTrust.grade}). ${receiverTrust.riskLevel} risk.`,
      combinedScore,
    }
  }

  // Combined score below threshold
  if (combinedScore < minScore) {
    return {
      allowed: false,
      reason: `Combined trust score ${combinedScore} below minimum threshold ${minScore}.`,
      combinedScore,
    }
  }

  return {
    allowed: true,
    reason: `Trust verified. Combined score: ${combinedScore} (${initiatorTrust.grade} + ${receiverTrust.grade}).`,
    combinedScore,
  }
}
