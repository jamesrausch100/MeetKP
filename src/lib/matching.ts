// =============================================================================
// Compatibility Scoring Engine
// Calculates a 0-100 compatibility score between two profiles
// =============================================================================

export interface MatchProfile {
  interests: string[]
  personalityTags: string[]
  latitude: number | null
  longitude: number | null
  age: number
  ageRangeMin: number
  ageRangeMax: number
  gender: string
  lookingFor: string
}

/**
 * Calculate the haversine distance between two lat/lng points in miles
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate compatibility score (0-100) between two profiles
 *
 * Breakdown:
 * - Interest overlap:       0-30 points
 * - Vibe match:             0-20 points
 * - Location proximity:     0-20 points
 * - Age preference match:   0-15 points
 * - Looking for match:      0-15 points
 */
export function calculateCompatibility(
  profileA: MatchProfile,
  profileB: MatchProfile
): number {
  let score = 0

  score += calculateInterestScore(profileA.interests, profileB.interests)
  score += calculateVibeScore(profileA.personalityTags, profileB.personalityTags)
  score += calculateLocationScore(profileA, profileB)
  score += calculateAgePreferenceScore(profileA, profileB)
  score += calculateLookingForScore(profileA, profileB)

  return Math.round(Math.min(100, Math.max(0, score)))
}

/**
 * Interest overlap: 0-30 points
 * Compare interests arrays, partial match counts
 */
function calculateInterestScore(
  interestsA: string[],
  interestsB: string[]
): number {
  if (interestsA.length === 0 || interestsB.length === 0) return 0

  const normalizedA = interestsA.map((i) => i.toLowerCase().trim())
  const normalizedB = interestsB.map((i) => i.toLowerCase().trim())

  let matchCount = 0
  for (const interest of normalizedA) {
    if (normalizedB.includes(interest)) {
      matchCount++
    }
  }

  // Score based on how many interests overlap relative to the smaller set
  const smallerSetSize = Math.min(normalizedA.length, normalizedB.length)
  const overlapRatio = matchCount / smallerSetSize

  return Math.round(overlapRatio * 30)
}

/**
 * Vibe match: 0-20 points
 * Compare personalityTags arrays
 */
function calculateVibeScore(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 || tagsB.length === 0) return 0

  const normalizedA = tagsA.map((t) => t.toLowerCase().trim())
  const normalizedB = tagsB.map((t) => t.toLowerCase().trim())

  let matchCount = 0
  for (const tag of normalizedA) {
    if (normalizedB.includes(tag)) {
      matchCount++
    }
  }

  const smallerSetSize = Math.min(normalizedA.length, normalizedB.length)
  const overlapRatio = matchCount / smallerSetSize

  return Math.round(overlapRatio * 20)
}

/**
 * Location proximity: 0-20 points
 * Uses haversine distance. Max points if < 5 miles, 0 if > 100 miles or no location.
 */
function calculateLocationScore(
  profileA: MatchProfile,
  profileB: MatchProfile
): number {
  if (
    profileA.latitude == null ||
    profileA.longitude == null ||
    profileB.latitude == null ||
    profileB.longitude == null
  ) {
    // Give partial location credit when coords aren't set
    // so profiles without GPS still appear with decent scores
    return 10
  }

  const distance = haversineDistance(
    profileA.latitude,
    profileA.longitude,
    profileB.latitude,
    profileB.longitude
  )

  if (distance > 100) return 0
  if (distance <= 5) return 20

  // Linear scale from 5 to 100 miles: 20 points at 5mi, 0 at 100mi
  const score = 20 * (1 - (distance - 5) / 95)
  return Math.round(score)
}

/**
 * Age preference match: 0-15 points
 * Check if each person falls within the other's age range preferences
 * Full points if both match, half if only one direction matches
 */
function calculateAgePreferenceScore(
  profileA: MatchProfile,
  profileB: MatchProfile
): number {
  const aInBRange =
    profileA.age >= profileB.ageRangeMin && profileA.age <= profileB.ageRangeMax
  const bInARange =
    profileB.age >= profileA.ageRangeMin && profileB.age <= profileA.ageRangeMax

  if (aInBRange && bInARange) return 15
  if (aInBRange || bInARange) return 7
  return 0
}

/**
 * Looking for match: 0-15 points
 * Check if gender/lookingFor preferences align in both directions
 */
function calculateLookingForScore(
  profileA: MatchProfile,
  profileB: MatchProfile
): number {
  const aGender = profileA.gender.toLowerCase().trim()
  const bGender = profileB.gender.toLowerCase().trim()
  const aLookingFor = profileA.lookingFor.toLowerCase().trim()
  const bLookingFor = profileB.lookingFor.toLowerCase().trim()

  // If either hasn't specified, give partial credit
  if (!aLookingFor || !bLookingFor || !aGender || !bGender) return 5

  const aMatchesB =
    bLookingFor === 'everyone' ||
    bLookingFor === 'anyone' ||
    bLookingFor === aGender
  const bMatchesA =
    aLookingFor === 'everyone' ||
    aLookingFor === 'anyone' ||
    aLookingFor === bGender

  if (aMatchesB && bMatchesA) return 15
  if (aMatchesB || bMatchesA) return 7
  return 0
}
